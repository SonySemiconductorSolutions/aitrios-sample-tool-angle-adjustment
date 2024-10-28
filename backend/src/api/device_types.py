# ------------------------------------------------------------------------
# Copyright 2024 Sony Semiconductor Solutions Corp. All rights reserved.

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

from datetime import timedelta

from flask import Blueprint
from flask_login import login_required
from flask_pydantic import validate
from src.config import DB_TRANSACTION_MAX_WAIT_SECONDS, DB_TRANSACTION_TIMEOUT_SECONDS
from src.core import db
from src.exceptions import APIException, ErrorCodes
from src.schemas import *
from src.schemas.devices import UpdateDeviceTypeReferenceImageSchema

api = Blueprint("device-types", __name__, url_prefix="/device-types")


@api.put("/<int:device_type_id>/reference-image")
@login_required
@validate()
def update_reference_image(device_type_id: int, body: UpdateDeviceTypeReferenceImageSchema):
    """
    Update reference image of a given device type
    Args:
        device_type_id (int) : Device type ID
        reference_image (str): Base 64 reference image to update
    Raises:
        APIException: DEVICE_TYPE_NOT_FOUND, VALUE_ERROR
    Returns:
        Json response
    """
    device_type = db.device_type.find_first(where={"id": device_type_id})

    # Check if the device type exists
    if not device_type:
        raise APIException(ErrorCodes.DEVICE_TYPE_NOT_FOUND)

    # Check if the reference image has base64 prefix
    reference_image = body.reference_image
    # Reference image cannot be an empty string
    if not reference_image:
        raise APIException(ErrorCodes.VALUE_ERROR)

    if not body.reference_image.startswith("data:image/jpeg;base64,"):
        reference_image = f"data:image/jpeg;base64,{reference_image}"

    # Update reference image
    # max_wait and timeout is added overriding the default, because, in case of Azure SQL DB
    # the transaction takes more than 5s  and there is a timeout of 5s default.
    # This issue occurs when there is a high resolution sample image already in Database
    with db.tx(
        max_wait=timedelta(seconds=DB_TRANSACTION_MAX_WAIT_SECONDS),
        timeout=timedelta(seconds=DB_TRANSACTION_TIMEOUT_SECONDS),
    ) as transaction:
        transaction.device_type.update(where={"id": device_type_id}, data={"sample_image_blob": reference_image})

    return ResponseHTTPSchema(
        status_code=200, message="Updated successfully", data={"message": "Reference image updated successfully"}
    ).make_response()
