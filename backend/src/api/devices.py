# ------------------------------------------------------------------------
# Copyright 2024, 2025 Sony Semiconductor Solutions Corp. All rights reserved.

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
File: backend/src/api/devices.py
"""


from flask import Blueprint, request
from flask_login import current_user, login_required
from flask_pydantic import validate
from src.core import db
from src.exceptions import APIException, ErrorCodes, InvalidBaseURLException
from src.libs.auth import check_resource_authorization
from src.models.reviews import build_device_query
from src.schemas.devices import (
    AitriosDeviceListSchema,
    DeleteDeviceListRequestSchema,
    DeviceCombinedListSchema,
    DeviceSaveOrUpdateRequestSchema,
)
from src.schemas.response import ResponseHTTPSchema
from src.schemas.reviews import DeviceReviewAllowedEnums, ReviewListSchema
from src.services.aitrios_service import decrypt_customer_details, get_aitrios_access_token, get_aitrios_devices
from src.utils import dict_has_non_null_values

# Admin App API
api = Blueprint("devices", __name__, url_prefix="/devices")

STATUS_API_EXPECTED_PARAMS = {
    "customer_id",
    "facility_name",
    "prefecture",
    "municipality",
    "page",
    "page_size",
    "status",
}


@api.get("/status")
@login_required
def get_device_connection_status():
    """
    Endpoint to get the device connection status
    Params:
        customer_id (int): Customer ID and
        ReviewListSchema Fields
    Returns:
        List of devices and its status
    """
    customer_id = None
    try:
        # Receive the params such as, facility name, prefecture, municipality
        # and pagination info to filter the data
        received_params = set(request.args.keys())

        # Check if unexpected params are received and raise exception if so.
        unexpected_params = received_params - STATUS_API_EXPECTED_PARAMS
        if unexpected_params:
            _ec = ErrorCodes.UNEXPECTED_PARAMS
            _ec["message"] = f"Unexpected params: {unexpected_params}"
            raise APIException(_ec)

        # Check if `customer_id` is received.
        # If not, raise param missing error.
        if "customer_id" not in request.args:
            _ec = ErrorCodes.PARAMETER_MISSING
            _ec["message"] = "`customer_id` query parameter is required"
            raise APIException(_ec)

        customer_id = request.args.get("customer_id")
        if not customer_id or int(customer_id) <= 0:
            raise APIException(ErrorCodes.VALUE_ERROR)

        customer_id = int(customer_id)

        # Check if admin has access to given customer ID (resource)
        check_resource_authorization(customer_id=customer_id)
    except ValueError as _exec:
        raise APIException(ErrorCodes.VALUE_ERROR) from _exec

    query = ReviewListSchema(**request.args)

    devices, count, _ = build_device_query(db, customer_id=customer_id, parameters=query)

    device_ids = ",".join([device.device_id for device in devices])
    # Get customer details
    customer = db.customer.find_first(where={"id": customer_id}).model_dump()
    console_creds = {
        "client_id": customer["client_id"],
        "client_secret": customer["client_secret"],
        "auth_url": customer["auth_url"],
        "base_url": customer["base_url"],
        "application_id": customer["application_id"],
    }
    # Check if the console credentials has any null values present.
    if not dict_has_non_null_values(console_creds, exempt_key="application_id"):
        raise APIException(ErrorCodes.INVALID_CONSOLE_CREDENTIALS)
    # Decrypt the customer details
    customer = decrypt_customer_details(customer)
    # Get AITRIOS Access token
    access_token = get_aitrios_access_token(customer)
    if not access_token:
        raise APIException(ErrorCodes.INVALID_CONSOLE_CREDENTIALS)

    try:
        device_status_list = []
        # Call the AITRIOS API only if the devices are present
        if devices:
            device_status_list = get_aitrios_devices(console_creds, access_token, device_ids)

        pagination_data = {
            "data": device_status_list,
            "page": query.page if query.page > 0 else 1,
            "total": count,
            "page_size": query.page_size,
            "size": len(device_status_list),
        }

        return AitriosDeviceListSchema(**pagination_data).make_response()
    except InvalidBaseURLException as _exec:
        raise APIException(ErrorCodes.INVALID_CONSOLE_CREDENTIALS) from _exec
    except APIException as _api_exec:
        raise _api_exec
    except Exception as _exec:
        raise APIException(ErrorCodes.UNEXPECTED_ERROR) from _exec


@api.post("")
@login_required
@validate()
def save_or_update_devices(body: DeviceSaveOrUpdateRequestSchema):
    """
    POST /devices
    Creates or updates multiple devices for a given customer.

        1. Validates the customer ID.
        2. Checks if the customer has access to the resource.
        3. Validates the facility ID and device type ID for each device.
        4. Deletes all reviews for the device before updating or creating it.
        5. Updates existing devices or creates new devices in the database.
        6. Returns a response indicating success or failure.

    Request Body:
    {
        "customer_id": int,
        "devices": [
            {
                "device_id": str,
                "device_name": str,
                "facility_id": int,
                "device_type_id": int
            },
            ...
        ]
    }
    Returns:
        ResponseHTTPSchema: A response schema indicating success or failure.
    """
    try:
        customer_id = body.customer_id
        devices = body.devices

        # Validate customer ID
        if not customer_id or not isinstance(customer_id, int):
            raise APIException(ErrorCodes.INVALID_CUSTOMER_ID)

        # Check resource authorization
        check_resource_authorization(customer_id=customer_id)

        failed_to_update_devices = []
        # Process each device in the list
        for device in devices:
            device_id = device.device_id
            device_name = device.device_name
            facility_id = device.facility_id

            # Validate facility_id
            if not facility_id or not db.facility.find_first(where={"id": facility_id}):
                raise APIException(ErrorCodes.INVALID_FACILITY_ID)

            # Validate device_type_id
            device_type_id = device.device_type_id
            if not device_type_id or not db.device_type.find_first(where={"id": device_type_id}):
                raise APIException(ErrorCodes.INVALID_DEVICE_TYPE_ID)

            # Check if the device exists
            existing_device = db.device.find_first(where={"device_id": device_id, "admin_id": current_user.id})
            device_update_result = None

            if existing_device:
                # delete all the reviews for the device one by one
                reviews = db.review.find_many(where={"device_id": existing_device.id})

                is_review_delete_successful = True
                # Iterate through the reviews and delete them
                for review in reviews:
                    try:
                        db.review.delete(where={"id": review.id})
                    except Exception:
                        is_review_delete_successful = False
                        break

                if not is_review_delete_successful:
                    failed_to_update_devices.append(device_id)
                    # This device update has failed. Continue to the next device.
                    continue

                # Update existing device
                update_data = {
                    "device_name": device_name,
                    "facility_id": facility_id,
                    "device_type_id": device_type_id,
                    "result": DeviceReviewAllowedEnums.INITIAL_STATE.value,
                }
                device_update_result = db.device.update(where={"id": existing_device.id}, data=update_data)
            else:
                # Create new device
                create_data = {
                    "device_id": device_id,
                    "device_name": device_name,
                    "facility_id": facility_id,
                    "device_type_id": device_type_id,
                    "admin_id": current_user.id,
                }
                device_update_result = db.device.create(data=create_data)

            if not device_update_result:
                failed_to_update_devices.append(device_id)
                continue

        # Check if any device update failed
        if failed_to_update_devices:
            error_message = f"Failed to update devices for the following IDs: {failed_to_update_devices}."
            _ec = ErrorCodes.DEVICE_UPDATE_FAILED.copy()
            _ec["message"] = error_message
            raise APIException(_ec)

        return ResponseHTTPSchema(message="Devices processed successfully", status_code=200).make_response()
    except APIException:
        raise
    except Exception as exc:
        raise APIException(ErrorCodes.UNEXPECTED_ERROR) from exc


@api.get("")
@login_required
def get_combined_devices():
    """
    GET /devices
    Retrieves all devices from AITRIOS console plus local AAT DB, merges them into one list.
    Mark each device 'registered_flag' = true if found in local DB, else false.
    Also fetch facility/device_type info from local DB for those registered devices.
    """
    # 1. Parse and validate `customer_id`
    customer_id_str = request.args.get("customer_id")
    if not customer_id_str:
        _ec = ErrorCodes.PARAMETER_MISSING
        _ec["message"] = "`customer_id` query parameter is required."
        raise APIException(_ec)

    try:
        customer_id = int(customer_id_str)
    except ValueError as exc:
        raise APIException(ErrorCodes.VALUE_ERROR) from exc

    if customer_id <= 0:
        raise APIException(ErrorCodes.INVALID_CUSTOMER_ID)

    # 2. Check resource authorization
    check_resource_authorization(customer_id=customer_id)

    # 3. Fetch console credentials from DB
    customer = db.customer.find_first(where={"id": customer_id})
    if not customer:
        raise APIException(ErrorCodes.CUSTOMER_NOT_FOUND)
    customer_data = customer.model_dump()

    console_creds = {
        "client_id": customer_data["client_id"],
        "client_secret": customer_data["client_secret"],
        "auth_url": customer_data["auth_url"],
        "base_url": customer_data["base_url"],
        "application_id": customer_data["application_id"],
    }
    # Check if console creds has any null value
    if not dict_has_non_null_values(console_creds, exempt_key="application_id"):
        raise APIException(ErrorCodes.INVALID_CONSOLE_CREDENTIALS)

    # 4. Decrypt credentials & get AITRIOS access token
    customer_decrypted = decrypt_customer_details(customer_data)
    access_token = get_aitrios_access_token(customer_decrypted)
    if not access_token:
        raise APIException(ErrorCodes.INVALID_CONSOLE_CREDENTIALS)

    # 5. Call AITRIOS to get the device list (all devices)
    try:
        aitrios_devices = get_aitrios_devices(customer_decrypted, access_token=access_token, device_ids="")
    except InvalidBaseURLException as exc:
        raise APIException(ErrorCodes.INVALID_CONSOLE_CREDENTIALS) from exc
    except Exception as exc:
        raise APIException(ErrorCodes.UNEXPECTED_ERROR) from exc

    # 6. Build a map of local AAT DB devices belonging to the given customer
    local_db_devices = db.device.find_many(where={"facility": {"customer_id": customer_id}})
    local_map = {dev.device_id: dev for dev in local_db_devices}

    # 7. Construct final list
    combined_list = []
    for aitrios_device in aitrios_devices:
        # Data from AITRIOS
        device_id = aitrios_device.device_id
        device_name = aitrios_device.device_name
        group_name_str = aitrios_device.group_name

        # Check if in local DB
        reg_flag = device_id in local_map
        facility_id = None
        facility_name = ""
        device_type_id = None
        device_type_name = ""

        if reg_flag:
            db_dev = local_map[device_id]

            # Use local DB details for device name, facility, device_type, etc.
            device_name = db_dev.device_name
            facility_id = db_dev.facility_id
            facility = db.facility.find_unique(where={"id": db_dev.facility_id})
            facility_name = facility.facility_name if facility else ""

            device_type_id = db_dev.device_type_id
            device_type = db.device_type.find_unique(where={"id": db_dev.device_type_id})
            device_type_name = device_type.name if device_type else ""
            # delete device id present in aitrios from local_map
            del local_map[device_id]

        combined_list.append(
            {
                "connection_status": aitrios_device.connection_status,
                "device_id": device_id,
                "device_name": device_name,
                "facility_id": facility_id,
                "facility_name": facility_name,
                "device_type_id": device_type_id,
                "device_type_name": device_type_name,
                "registered_flag": reg_flag,
                "group_name": group_name_str,
            }
        )

    # Add remaining local devices to the list
    for local_device in local_map.values():
        facility_obj = db.facility.find_unique(where={"id": local_device.facility_id, "customer_id": customer_id})

        # Add the device from database only if it belongs to the same customer
        if facility_obj:
            facility_name = facility_obj.facility_name if facility_obj else ""

            device_type_obj = db.device_type.find_unique(where={"id": local_device.device_type_id})
            device_type_name = device_type_obj.name if device_type_obj else ""

            combined_list.append(
                {
                    "connection_status": "Disconnected",
                    "device_id": local_device.device_id,
                    "device_name": local_device.device_name,
                    "facility_id": local_device.facility_id,
                    "facility_name": facility_name,
                    "device_type_id": local_device.device_type_id,
                    "device_type_name": device_type_name,
                    "registered_flag": True,
                    "group_name": "",
                }
            )

    # 8. Return final JSON with "devices": [...]
    return DeviceCombinedListSchema(devices=combined_list).model_dump()


@api.delete("")
@login_required
@validate()
def delete_devices(body: DeleteDeviceListRequestSchema):
    """
    DELETE API /devices
    Request Body:
    {
        "devices": [
            {
                facility_id: int
                device_id: str,
            }
        ]
    },
    Returns:
        ResponseHTTPSchema: A response schema indicating success or failure.
    """
    device_list = body.devices

    if not device_list or len(device_list) == 0:
        raise APIException(ErrorCodes.VALUE_ERROR)

    failed_to_delete_devices = []
    try:
        # loop through the device_list and check each
        for device in device_list:

            # Find the device in the database by AITRIOS DEVICE ID
            existing_device = db.device.find_first(
                where={"device_id": device.device_id, "facility_id": device.facility_id, "admin_id": current_user.id}
            )
            if not existing_device:
                failed_to_delete_devices.append(device.device_id)
                continue

            # search reviews by Device DB ID
            reviews = db.review.find_many(where={"device_id": existing_device.id})
            total_reviews = len(reviews)

            if reviews and total_reviews > 0:
                # delete reviews by Device DB ID
                deleted_review_count = db.review.delete_many(where={"device_id": existing_device.id})

                if deleted_review_count != total_reviews:
                    failed_to_delete_devices.append(device.device_id)
                    continue

            delete_device = db.device.delete(where={"id": existing_device.id, "facility_id": device.facility_id})
            if not delete_device:
                failed_to_delete_devices.append(device.device_id)

        if len(failed_to_delete_devices) > 0:
            return ResponseHTTPSchema(
                message=(
                    "Devices and its respective reviews deleted successfully. "
                    f"Failed to delete devices: {failed_to_delete_devices}"
                ),
                status_code=200,
            ).make_response()

        return ResponseHTTPSchema(
            message="Devices and its respective reviews deleted successfully.", status_code=200
        ).make_response()
    except APIException:
        raise
    except Exception as exc:
        raise APIException(ErrorCodes.UNEXPECTED_ERROR) from exc
