# ------------------------------------------------------------------------
# Copyright 2025 Sony Semiconductor Solutions Corp. All rights reserved.

# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at

# http://www.apache.org/licenses/LICENSE-2.0

# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ------------------------------------------------------------------------

"""
File: backend/src/api/data_migration.py
"""

import json
import uuid
from datetime import datetime
from io import BytesIO

from flask import Blueprint, jsonify, request, send_file
from flask_login import current_user, login_required
from src.core import db
from src.exceptions import APIException, ErrorCodes
from src.schemas.data_migration import DataMigrationSchema
from src.utils import decrypt_data, encrypt_data, is_valid_base64_image

# Admin App API
# Blueprint for export/import APIs
api = Blueprint("data-migration", __name__, url_prefix="/data-migration")


@api.get("/export")
@login_required
def export_data():
    """
    Export database data to a JSON file for the current admin only.
    """
    try:
        # Fetch data for the current admin
        admin = db.admin.find_first(
            where={"id": current_user.id},
            include={"customers": {"include": {"facilities": {"include": {"devices": True}}}}},
        )
        if not admin:
            raise APIException(ErrorCodes.ADMIN_NOT_FOUND)

        # Fetch facility types and device types (global data)
        facility_types = db.facility_type.find_many(where={"admin_id": current_user.id})
        device_types = db.device_type.find_many(where={"admin_id": current_user.id})

        # Prepare data for export
        data = {
            "admin": [
                {
                    "device_types": [
                        {"name": dt.name, "sample_image_blob": dt.sample_image_blob} for dt in device_types
                    ],
                    "facility_types": [{"name": ft.name} for ft in facility_types],
                    "customers": [
                        {
                            "customer_name": customer.customer_name,
                            "auth_url": customer.auth_url,
                            "base_url": customer.base_url,
                            "client_id": decrypt_data(customer.client_id) if customer.client_id else "",
                            "client_secret": decrypt_data(customer.client_secret) if customer.client_secret else "",
                            "application_id": decrypt_data(customer.application_id) if customer.application_id else "",
                            "facilities": [
                                {
                                    "facility_type_name": next(
                                        (ft.name for ft in facility_types if ft.id == facility.facility_type_id), ""
                                    ),
                                    "prefecture": facility.prefecture,
                                    "municipality": facility.municipality,
                                    "facility_name": facility.facility_name,
                                    "effective_start_utc": facility.effective_start_utc,
                                    "effective_end_utc": facility.effective_end_utc,
                                    "devices": [
                                        {
                                            "device_id": device.device_id,
                                            "device_name": device.device_name,
                                            "device_type_name": next(
                                                (dt.name for dt in device_types if dt.id == device.device_type_id), ""
                                            ),
                                        }
                                        for device in facility.devices
                                    ],
                                }
                                for facility in customer.facilities
                            ],
                        }
                        for customer in admin.customers
                    ],
                }
            ],
        }

        # Export as JSON
        json_data = json.dumps(data, indent=4, ensure_ascii=False)
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        return send_file(
            BytesIO(json_data.encode()),
            mimetype="application/json",
            as_attachment=True,
            download_name=f"AAT_Data_{admin.login_id}_{timestamp}.json",
        )
    except APIException as _api_exc:
        # Re-raise API-specific exceptions without wrapping them
        raise _api_exc
    except Exception as _exc:
        # Handle unexpected errors
        raise APIException(ErrorCodes.UNEXPECTED_ERROR) from _exc


@api.post("/import")
@login_required
def import_data():
    """
    POST /import
    Import database data from a JSON file. The data would be imported to the current admin only.
    'json_file' is a required key in the request.

    The JSON file should be structured as follows:
    {
        "admin": [
            {
                "facility_types": [
                    {"name": "FacilityType1"},
                    {"name": "FacilityType2"}
                ],
                "device_types": [
                    {"name": "DeviceType1", "sample_image_blob": "base64_encoded_image"},
                    {"name": "DeviceType2", "sample_image_blob": "base64_encoded_image"}
                ],
                "customers": [
                    {
                        "customer_name": "Customer1",
                        "auth_url": "https://auth.example.com",
                        "base_url": "https://api.example.com",
                        "client_id": "encrypted_client_id",
                        "client_secret": "encrypted_client_secret",
                        "application_id": "encrypted_application_id",
                        "facilities": [
                            {
                                "facility_type_name": "FacilityType1",
                                "prefecture": "Tokyo",
                                "municipality": "Shinjuku",
                                "facility_name": "Facility1",
                                "effective_start_utc": "2025-01-01T00:00:00+00:00",
                                "effective_end_utc": "2025-12-31T23:59:59+00:00",
                                "devices": [
                                    {
                                        "device_id": "Device1",
                                        "device_name": "DeviceName1",
                                        "device_type_name": "DeviceType1"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    """
    try:
        # Step 1: Validate the request
        if "json_file" not in request.files:
            raise APIException(ErrorCodes.INVALID_FILE)
        json_file = request.files["json_file"]
        if not json_file.filename.endswith(".json"):
            raise APIException(ErrorCodes.INVALID_FILE)

        # Step 2: Read and validate the JSON file
        file_content = json_file.read()

        try:
            json_data = json.loads(file_content)
            validated_data = DataMigrationSchema(**json_data)
        except json.JSONDecodeError as _js_decode_exc:
            raise APIException(ErrorCodes.INVALID_JSON_FORMAT) from _js_decode_exc
        except ValueError as _schema_exc:
            _ec = ErrorCodes.SCHEMA_VALIDATION_FAILED
            _ec["message"] = str(_schema_exc)
            raise APIException(_ec) from _schema_exc

        # Ensure the admin list is non-empty
        if not validated_data.admin or len(validated_data.admin) == 0:
            raise APIException(ErrorCodes.INVALID_JSON_FORMAT, "Admin data is missing.")

        # Assign the first admin record to a variable for reuse
        admin_data = validated_data.admin[0]

        # Validate device type images
        for device_type_data in admin_data.device_types:
            if not is_valid_base64_image(device_type_data.sample_image_blob):
                _ec = ErrorCodes.SCHEMA_VALIDATION_FAILED
                _ec["message"] = "invalid sample image blob format"
                raise APIException(_ec)

        # verify if the customer name is unique in the admin data
        customer_names = [customer.customer_name for customer in admin_data.customers]
        if len(customer_names) != len(set(customer_names)):
            raise APIException(ErrorCodes.DUPLICATE_CUSTOMER_NAME)

        # Step 3: Clear all data associated with the current user
        # Batch delete reviews
        reviews_to_delete = db.review.find_many(where={"customer": {"admin_id": current_user.id}})
        for review in reviews_to_delete:
            db.review.delete(where={"id": review.id})

        # Batch delete devices
        devices_to_delete = db.device.find_many(where={"facility": {"customer": {"admin_id": current_user.id}}})
        for device in devices_to_delete:
            db.device.delete(where={"id": device.id})

        # Batch delete facilities
        facilities_to_delete = db.facility.find_many(where={"customer": {"admin_id": current_user.id}})
        for facility in facilities_to_delete:
            db.facility.delete(where={"id": facility.id})

        # Batch delete customers
        customers_to_delete = db.customer.find_many(where={"admin_id": current_user.id})
        for customer in customers_to_delete:
            db.customer.delete(where={"id": customer.id})

        # Batch delete device types
        device_types_to_delete = db.device_type.find_many(where={"admin_id": current_user.id})
        for device_type in device_types_to_delete:
            db.device_type.delete(where={"id": device_type.id})

        # Batch delete facility types
        facility_types_to_delete = db.facility_type.find_many(where={"admin_id": current_user.id})
        for facility_type in facility_types_to_delete:
            db.facility_type.delete(where={"id": facility_type.id})

        # Step 4: Populate the data into the current user
        # Insert facility types
        for facility_type_data in admin_data.facility_types:
            existing_facility_type = db.facility_type.find_first(
                where={"name": facility_type_data.name, "admin_id": current_user.id}
            )
            if existing_facility_type:
                # Update the existing facility type if needed (no fields to update in this case)
                pass
            else:
                # Create a new facility type
                db.facility_type.create(data={"name": facility_type_data.name, "admin_id": current_user.id})

        # Insert device types
        for device_type_data in admin_data.device_types:

            existing_device_type = db.device_type.find_first(
                where={"name": device_type_data.name, "admin_id": current_user.id}
            )
            if existing_device_type:
                # Update the existing device type
                db.device_type.update(
                    where={"id": existing_device_type.id},
                    data={"sample_image_blob": device_type_data.sample_image_blob},
                )
            else:
                # Create a new device type
                db.device_type.create(
                    data={
                        "name": device_type_data.name,
                        "sample_image_blob": device_type_data.sample_image_blob,
                        "admin_id": current_user.id,
                    }
                )

        # Insert customers
        customer_map = {}
        for customer_data in admin_data.customers:
            customer = db.customer.create(
                data={
                    "admin_id": current_user.id,
                    "customer_name": customer_data.customer_name,
                    "customer_uuid": str(uuid.uuid4()),
                    "auth_url": customer_data.auth_url,
                    "base_url": customer_data.base_url,
                    "client_id": encrypt_data(customer_data.client_id),
                    "client_secret": encrypt_data(customer_data.client_secret),
                    "application_id": (
                        encrypt_data(customer_data.application_id) if customer_data.application_id else None
                    ),
                }
            )
            customer_map[customer_data.customer_name] = customer.id

        # Insert facilities
        facility_map = {}
        for customer_data in admin_data.customers:
            customer_id = customer_map[customer_data.customer_name]
            for facility_data in customer_data.facilities:
                facility_type = db.facility_type.find_first(
                    where={"name": facility_data.facility_type_name, "admin_id": current_user.id}
                )
                if not facility_type:
                    raise APIException(ErrorCodes.FACILITY_TYPE_NOT_FOUND)

                facility = db.facility.create(
                    data={
                        "customer_id": customer_id,
                        "facility_type_id": facility_type.id,
                        "prefecture": facility_data.prefecture,
                        "municipality": facility_data.municipality,
                        "facility_name": facility_data.facility_name,
                        "effective_start_utc": facility_data.effective_start_utc,
                        "effective_end_utc": facility_data.effective_end_utc,
                    }
                )
                facility_map[facility_data.facility_name] = facility.id

        # Insert devices
        for customer_data in admin_data.customers:
            for facility_data in customer_data.facilities:
                facility_id = facility_map[facility_data.facility_name]
                for device_data in facility_data.devices:
                    device_type = db.device_type.find_first(
                        where={"name": device_data.device_type_name, "admin_id": current_user.id}
                    )
                    if not device_type:
                        raise APIException(ErrorCodes.DEVICE_TYPE_NOT_FOUND)

                    db.device.create(
                        data={
                            "facility_id": facility_id,
                            "device_id": device_data.device_id,
                            "device_name": device_data.device_name,
                            "device_type_id": device_type.id,
                            "admin_id": current_user.id,
                        }
                    )

        return jsonify({"message": "Data imported successfully."})
    except APIException as _api_exc:
        # Re-raise API-specific exceptions without wrapping them
        raise _api_exc
    except Exception as _exc:
        # Handle unexpected errors
        raise APIException(ErrorCodes.UNEXPECTED_ERROR) from _exc
