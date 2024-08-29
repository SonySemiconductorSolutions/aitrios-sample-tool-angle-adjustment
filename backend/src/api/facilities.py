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

from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_pydantic import validate
from requests.exceptions import RequestException
from src.core import db
from src.exceptions import (
    APIException,
    ErrorCodes,
    InvalidAuthTokenException,
    InvalidBaseURLException,
    RetryAPIException,
)
from src.libs.auth import validate_auth_token
from src.schemas import *
from src.services import aitrios_service
from src.utils import dict_has_non_null_values

api = Blueprint("facility", __name__, url_prefix="/facility")


# Commenting as facility token is validated in validate_auth_token

# def facility_required(f):
#     """
#     Decorator to ensure that a facility ID is provided and exists in the database.
#     Args:
#         f (function): The function to be decorated.
#     Returns :
#         function: The decorated function.
#     """
#     @wraps(f)
#     def decorated_function(*args, **kwargs):
#         # Extract facility ID from kwargs or request JSON
#         facility_id = kwargs.get(
#             "facility_id") or request.json.get("facility_id")

#         # Check if facility ID is provided
#         if not facility_id:
#             raise APIException(status_code=400, error_code=4001,
#                                message="Facility ID is invalid or not provided")

#         # Query the database to find the facility with the provided ID
#         try:
#             facility = db.facility.find_first(
#                 where={"id": int(facility_id)})
#         except ValueError:
#             raise APIException(status_code=400, error_code=4002,
#                                message="Invalid facility")

#         # Check if facility exists
#         if not facility:
#             raise APIException(status_code=404, error_code=4041,
#                                message="Facility not found")

#         g.current_facility = facility

#         return f(*args, **kwargs)

#     return decorated_function


@api.get("/devices")
@validate_auth_token
def get_facility_devices(payload: dict) -> FacilityDeviceDataSchema:
    """
    Get facility information based on the provided QR token and authorization token.

    Args:
        payload (dict): Dict containing facility_id and customer_id.

    Returns:
        FacilityDeviceDataSchema: Response containing devices associated to the facility.

    Raises:
        401: If any required header is missing or in invalid format, or if tokens are invalid or expired.
        500: If an unexpected error occurs during the processing of the request.
    """
    # Get the facility ID
    facility_id = payload.get("facility_id")

    # Get the Customer ID
    customer_id = payload.get("customer_id")

    # Query to find the facility based on facility_id and customer_id
    facility = db.facility.find_first(where={"id": int(facility_id), "customer_id": int(customer_id)})
    if not facility:
        raise APIException(ErrorCodes.INVALID_FACILITY)

    # query to fetch related data from the device table
    devices = db.device.find_many(where={"facility_id": int(facility_id)})

    # Verify devices. If no devices for the facility then raise exception
    if not any(devices):
        raise APIException(ErrorCodes.DEVICES_NOT_FOUND)

    # Extract device IDs
    device_ids = [device.id for device in devices]

    # Fetch reviews for each device and filter the latest one
    reviews_by_device_id = {}
    for device_id in device_ids:
        latest_review = None
        reviews = db.review.find_many(where={"device_id": device_id})
        for review in reviews:
            if not latest_review or review.created_at_utc > latest_review.created_at_utc:
                latest_review = review
        if latest_review:
            reviews_by_device_id[device_id] = latest_review.result

    # Extract device data with latest review result
    device_data = []
    for device in devices:
        latest_result = reviews_by_device_id.get(device.id, None)
        if not latest_result:
            latest_result = 1
        device_data.append(
            {
                "id": device.id,
                "device_name": device.device_name,
                "result": latest_result,
            }
        )

    # Construct response including data from device and review tables
    result = {"devices": device_data}

    # validate the response using the schema
    validated_response = FacilityDeviceDataSchema(**result)
    return jsonify(validated_response.dict())


@api.get("/devices/<int:device_id>/status")
@validate_auth_token
@validate()
# Commenting as facility token is validated in validate_auth_token
# @facility_required
def get_device_status(device_id: int, payload: dict) -> FacilityStatusGetResponseSchema:
    """
    Endpoint to get the status of a device in a facility.
    Args:
        device_id (int): The ID of the device.
        payload (dict): Dict containing facility_id and customer_id.

    Returns:
        FacilityStatusGetResponseSchema: A schema containing the status and review comment of the device.
    """
    device = db.device.find_first(where={"id": int(device_id)})

    # Verify device. If no device for the facility then raise exception
    if not device:
        raise APIException(ErrorCodes.DEVICE_NOT_FOUND)

    reviews = db.review.find_many(where={"device_id": int(device_id)}, order={"created_at_utc": "desc"})

    if any(reviews):
        reviews = reviews[0]
        return FacilityStatusGetResponseSchema(status=reviews.result, review_comment=reviews.review_comment)
    else:
        return FacilityStatusGetResponseSchema(status=FacilityStatusSchema.CONFIRMED, review_comment="")


# Not used
# @api.post("/<string:facility_id>/device/status")
# @login_required
# @validate()
# @facility_required
# def change_device_status(facility_id: str, body: FacilityUpdateRequestSchema):
#     db.facility.update(where={"id": g.current_facility.id}, data={
#                        "status": body.status})
#     # Get current request and update status to new status
#     db.review.update(
#         where={"id": g.current_facility.request_id}, data={"result": body.status}
#     )

#     return ResponseHTTPSchema(message="Facility status updated")


@api.get("/devices/<int:device_id>/images")
# Commenting as explicitly checking the validation for the token in the code.
# @login_required
@validate_auth_token
# Commenting as facility token is validated in validate_auth_token
# @facility_required
def get_images(device_id: int, payload: dict):
    """
    Get images based on the device ID and facility ID.

    Args:
        device_id (int): The ID of the device.
        payload (dict): Dict containing facility_id and customer_id.

    Returns:
        FacilityImageGetResponseSchema: Response containing devices associated to the facility.

    Raises:
        401: If any required header is missing or in invalid format, or if tokens are invalid or expired.
        500: If an unexpected error occurs during the processing of the request.
    """
    image_type = int(request.args.get("image_type", 0))
    if image_type not in [ImageTypeSchema.CAMERA, ImageTypeSchema.REVIEW_COMMENT_AND_SAMPLE_IMAGE]:
        raise APIException(ErrorCodes.IMAGE_TYPE_NOT_FOUND)
    camera_image = None
    sample_image = None
    review_comment = ""
    device = db.device.find_first(where={"id": int(device_id)})

    # Verify device. If no device for the facility then raise exception
    if not device:
        raise APIException(ErrorCodes.DEVICE_NOT_FOUND)

    # Get the facility ID
    facility_id = payload.get("facility_id")

    facility = db.facility.find_unique(where={"id": int(facility_id)}, include={"customer": {}})

    # Verify facility. Raise the exception if no facility for the facility_id
    if not facility:
        raise APIException(ErrorCodes.FACILITY_NOT_FOUND)

    # 1 for Camera image and 0 for review comment and sample image.
    if image_type == ImageTypeSchema.CAMERA:
        try:
            customer = facility.customer.model_dump()
            console_creds = {
                "client_id": customer["client_id"],
                "client_secret": customer["client_secret"],
                "auth_url": customer["auth_url"],
                "base_url": customer["base_url"],
                "application_id": customer["application_id"]
            }
            # Check if console creds has any null value
            if not dict_has_non_null_values(console_creds, "application_id"):
                raise APIException(ErrorCodes.INVALID_CONSOLE_CREDENTIALS)
            camera_image = aitrios_service.fetch_images_by_device_id(device.device_id, console_creds)
        except RetryAPIException:
            raise APIException(ErrorCodes.CAMERA_ISSUE)
        except InvalidAuthTokenException as _token_exec:
            if console_creds["application_id"]:
                raise APIException(ErrorCodes.INVALID_AUTH_TOKEN_ENTERPRISE) from _token_exec
            raise APIException(ErrorCodes.INVALID_AUTH_TOKEN) from _token_exec
        except InvalidBaseURLException as _invalid_url_exec:
            raise APIException(ErrorCodes.INVALID_BASE_URL) from _invalid_url_exec
        except RequestException as _req_exec:
            raise APIException(ErrorCodes.DEVICE_IMAGE_FETCH_FAIL) from _req_exec
        except APIException as _api_exec:
            raise _api_exec
        except Exception as _exec:
            raise APIException(ErrorCodes.DEVICE_IMAGE_FETCH_FAIL) from _exec

    elif image_type == ImageTypeSchema.REVIEW_COMMENT_AND_SAMPLE_IMAGE:
        try:
            device_type = db.device_type.find_first(where={"id": int(device.device_type_id)})
            sample_image = device_type.sample_image_blob
            review = db.review.find_first(
                where={
                    "facility_id": int(facility_id),
                    "device_id": int(device_id),
                    "result": DeviceReviewAllowedEnums.REJECTED.value,
                },
                order={"created_at_utc": "desc"},
            )

            if review:
                review_comment = review.review_comment
        except RetryAPIException:
            raise APIException(ErrorCodes.DEVICE_SAMPLE_IMAGE_FAIL)

    return FacilityImageGetResponseSchema(
        **{
            "device_id": device_id,
            "device_image": camera_image,
            "sample_image": sample_image,
            "retrieved_date": datetime.now(),
            "comment": review_comment,
        }
    ).model_dump()
