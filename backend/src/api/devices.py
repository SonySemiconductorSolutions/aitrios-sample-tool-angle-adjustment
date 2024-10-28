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
File: backend/src/api/devices.py
"""

from flask import Blueprint, request
from flask_login import login_required
from src.core import db
from src.exceptions import APIException, ErrorCodes, InvalidBaseURLException
from src.libs.auth import check_resource_authorization
from src.models.reviews import build_device_query
from src.schemas.devices import DeviceStatusListSchema
from src.schemas.reviews import ReviewListSchema
from src.services.aitrios_service import decrypt_customer_details, get_aitrios_access_token, get_device_status
from src.utils import dict_has_non_null_values

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
        if not customer_id:
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
            device_status_list = get_device_status(console_creds, access_token, device_ids)

        pagination_data = {
            "data": device_status_list,
            "page": query.page if query.page > 0 else 1,
            "total": count,
            "page_size": query.page_size,
            "size": len(device_status_list),
        }

        return DeviceStatusListSchema(**pagination_data).make_response()
    except InvalidBaseURLException as _exec:
        raise APIException(ErrorCodes.INVALID_CONSOLE_CREDENTIALS) from _exec
    except APIException as _api_exec:
        raise _api_exec
    except Exception as _exec:
        raise APIException(ErrorCodes.UNEXPECTED_ERROR) from _exec
