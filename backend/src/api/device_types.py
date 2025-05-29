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
File: backend/src/api/device_types.py
"""

from datetime import datetime, timedelta, timezone

from flask import Blueprint
from flask_login import current_user, login_required
from flask_pydantic import validate
from src.config import DB_TRANSACTION_MAX_WAIT_SECONDS, DB_TRANSACTION_TIMEOUT_SECONDS
from src.core import db
from src.exceptions import APIException, ErrorCodes
from src.schemas.devices import (
    CreateDeviceTypeRequestSchema,
    DeviceTypeListResponseSchema,
    DeviceTypeResponseSchema,
    DeviceTypeSchema,
    EditDeviceTypeRequestSchema,
)
from src.schemas.response import ResponseHTTPSchema
from src.utils import is_valid_base64_image

# Admin App API
api = Blueprint("device-types", __name__, url_prefix="/device-types")


@api.get("")
@login_required
def get_device_types():
    """
    GET /device-types
    Retrieves a list of all device types.
    """
    rows = db.device_type.find_many(where={"admin_id": current_user.id})
    data = [DeviceTypeResponseSchema.model_validate(row.model_dump()) for row in rows]
    response = DeviceTypeListResponseSchema(data=data, message="Device types retrieved successfully", total=len(data))
    return response.make_response()


@api.get("/<int:devicetype_id>")
@login_required
def get_devicetype_by_id(devicetype_id: int):
    """
    GET /device-types/{devicetype_id}
    Fetches details for a specific devicetype by ID
    """

    # Return 404 if device_type_id is not valid
    if devicetype_id <= 0:
        raise APIException(ErrorCodes.DEVICE_TYPE_NOT_FOUND)

    devicetype_obj = db.device_type.find_first(where={"id": devicetype_id, "admin_id": current_user.id})
    if not devicetype_obj:
        raise APIException(ErrorCodes.DEVICE_TYPE_NOT_FOUND)

    return ResponseHTTPSchema(
        message="Device type retrieved successfully", data=devicetype_obj.model_dump()
    ).make_response()


@api.post("")
@login_required
@validate()
def create_device_type(body: CreateDeviceTypeRequestSchema):
    """
    POST /device-types
    Creates a new device type with reference image.
    """

    reference_image = body.reference_image

    if reference_image and not reference_image.startswith("data:image/"):
        reference_image = "data:image/jpeg;base64," + reference_image

    with db.tx(
        max_wait=timedelta(seconds=DB_TRANSACTION_MAX_WAIT_SECONDS),
        timeout=timedelta(seconds=DB_TRANSACTION_TIMEOUT_SECONDS),
    ):
        new_device_type = db.device_type.create(
            data={
                "name": body.name,
                "sample_image_blob": reference_image,
                "created_by": "system",
                "admin_id": current_user.id,
                "last_updated_by": "system",
            }
        )

    created_data = DeviceTypeSchema(**new_device_type.model_dump())
    return ResponseHTTPSchema(
        status_code=201, message="Device type created", data=created_data.model_dump()
    ).make_response()


@api.put("/<int:device_type_id>")
@login_required
@validate()
def edit_device_type(device_type_id: int, body: EditDeviceTypeRequestSchema):
    """
    PUT /device-types/{device_type_id}

    Edits the name and/or reference image of an existing device type.
    1. Editing device type details (name and reference image) on the Manage Devices page.
    2. Updating the reference image on the Review page.

    Request Body (JSON):
    {
        "name": "New Name",
        "reference_image": "base64string or null"
    }
    """
    # 1. Find the device type
    device_type = db.device_type.find_first(where={"id": device_type_id})
    if not device_type:
        raise APIException(ErrorCodes.DEVICE_TYPE_NOT_FOUND)

    # 2. Prepare fields to update
    update_data = {}
    if body.name:
        update_data["name"] = body.name

    if body.reference_image is not None:
        ref_img = body.reference_image
        if ref_img and not ref_img.startswith("data:image/"):
            ref_img = "data:image/jpeg;base64," + ref_img
        update_data["sample_image_blob"] = ref_img

        # Validate if the base64 string is valid image
        if update_data.get("sample_image_blob"):
            if not is_valid_base64_image(update_data["sample_image_blob"]):
                return ResponseHTTPSchema(status_code=400, message="Invalid image format").make_response()

    # 3. Update DB
    with db.tx(
        max_wait=timedelta(seconds=DB_TRANSACTION_MAX_WAIT_SECONDS),
        timeout=timedelta(seconds=DB_TRANSACTION_TIMEOUT_SECONDS),
    ):
        updated = db.device_type.update(
            where={"id": device_type_id},
            data={**update_data, "last_updated_by": "system", "last_updated_at_utc": datetime.now(timezone.utc)},
        )

    # 4. Return the updated device type
    updated_data = DeviceTypeSchema(**updated.model_dump())
    return ResponseHTTPSchema(
        status_code=200, message="Device type updated successfully", data=updated_data.model_dump()
    ).make_response()
