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

from datetime import datetime, timedelta

from flask import Blueprint, request
from flask_login import current_user, login_required
from flask_pydantic import validate
from src.config import DB_TRANSACTION_MAX_WAIT_SECONDS, DB_TRANSACTION_TIMEOUT_SECONDS
from src.core import db
from src.exceptions import APIException, ErrorCodes
from src.libs.auth import check_device_authorization, check_resource_authorization, validate_auth_token
from src.models.reviews import build_device_query, get_checking_reviews_info
from src.schemas import *
from src.schemas.devices import DeviceSchema

api = Blueprint("reviews", __name__, url_prefix="/reviews")


# @api.get("")
# @login_required
# def list_reviews():
#     query = ReviewListSchema(**request.args)

#     rows, count = build_review_query(connection=db, parameters=query)
#     data = [ReviewSchema.model_validate(row.model_dump()) for row in rows]
#     reviewing_info = get_checking_reviews_info(data=data, late_minutes=query.late_minutes)

#     pagination_data = {
#         "data": data,
#         "page": query.page if query.page > 0 else 1,
#         "total": count,
#         "page_size": query.page_size,
#         "size": len(data),
#         "reviewing_info": reviewing_info,
#     }

#     return ReviewListResponseSchema(**pagination_data).make_response()


@api.get("/latest")
@login_required
def get_device_latest_reviews():
    """
    Endpoint to get the devices and its latest reviews

    Args:
        QueryParams
            customer_id
            status
            facility_name
            region
            prefecture
            municipality
    Returns:
        List of devices and its latest reviews
    """
    # Customer ID is mandatory
    if not request.args.get("customer_id"):
        _ec = ErrorCodes.VALUE_ERROR
        _ec["message"] = "customer_id is required"
        raise APIException(_ec)

    # Raise error if customer Id is not an integer
    try:
        customer_id = int(request.args.get("customer_id"))
    except ValueError:
        _ec = ErrorCodes.VALUE_ERROR
        _ec["message"] = "customer_id should be an integer"
        raise APIException(_ec)

    check_resource_authorization(customer_id=customer_id)

    query = ReviewListSchema(**request.args)

    devices, count, result_count = build_device_query(connection=db, customer_id=customer_id, parameters=query)
    data = []
    reviews = []
    for device in devices:
        temp = {}
        device_reviews = db.review.find_many(
            where={"device_id": device.id},
            include={"facility": {"include": {"facility_type": True}}},
            order={"created_at_utc": "desc"},
        )
        latest_review = {}
        temp["latest_review"] = {}
        if len(device_reviews) > 0:
            latest_review = device_reviews[0]
            temp["latest_review"] = ReviewSchema(**latest_review.model_dump())
            reviews.append(temp["latest_review"])
        temp["device"] = DeviceSchema(**device.model_dump())
        data.append(temp)

    # Get current and late review count for all the latest reviews
    reviewing_info = get_checking_reviews_info(data=reviews, late_minutes=query.late_minutes)

    pagination_data = {
        "data": data,
        "page": query.page if query.page > 0 else 1,
        "total": count,
        "page_size": query.page_size,
        "size": len(data),
        "reviewing_info": reviewing_info,
        "status_count": result_count,
    }

    return ReviewListResponseSchema(**pagination_data).make_response()


@api.get("/devices/<int:device_id>/history")
@login_required
def get_device_review_history(device_id: int):
    """
    Endpoint to get the device review history by device id

    Args:
        device_id (int): ID of the device
    Returns:
        List of reviews for a device ID.
    """
    check_resource_authorization(device_id=device_id)
    try:
        # Handle pagination
        page = max(int(request.args.get("page", 1)), 1)
        page_size = int(request.args.get("page_size", DEFAULT_PAGE_SIZE))
        # If page size is less than 0, set to 0
        page_size = max(page_size, 0)
        take = None
        skip = None
        total_records = db.review.count(where={"device_id": device_id})
        if page > 0:
            skip = (page - 1) * page_size
            take = min(page_size, total_records - skip)
            # If the take value is less than 0, set it to 0
            take = max(take, 0)
            skip = skip if take > 0 else None
    except ValueError as _exec:
        _ec = ErrorCodes.VALUE_ERROR
        _ec["message"] = "page and page_size should be a valid integer"
        raise APIException(_ec) from _exec

    rows = db.review.find_many(
        where={"device_id": device_id},
        include={"customer": {}, "facility": {"include": {"facility_type": True}}},
        order={"created_at_utc": "desc"},
        take=take,
        skip=skip,
    )
    data = []
    for row in rows:
        model = ReviewGetResponseSchema(**row.model_dump())
        data.append(model)

    # Get device details
    device_details = db.device.find_first(where={"id": device_id}, include={"device_type": {}, "facility": {}})
    device_model = DeviceGetResponseSchema(**device_details.model_dump())

    # Load device sample image
    device_details = db.device.find_first(
        where={"id": device_id}, include={"facility": {"include": {"customer": True}}}
    )
    result_data = {
        "reviews": data,
        "device": device_model,
        "size": len(rows),
        "total": total_records,
        "page": page,
        "page_size": page_size,
    }

    return DeviceReviewHistorySchema(**result_data).make_response()


@api.get("/<int:review_id>")
@login_required
@validate()
def get_review(review_id: int) -> ReviewGetResponseSchema:
    """
    Endpoint to get review by review_id

    Args:
        review_id (int): ID of the review
    Returns:
        Review Details
    """
    # Check resource authorization
    check_resource_authorization(review_id=review_id)

    # Include device and device type filter
    review = db.review.find_unique(
        where={"id": review_id},
        include={
            "facility": {"include": {"facility_type": {}}},
            "device": {
                "include": {"device_type": {}},
            },
            "customer": {},
        },
    )

    if not review:
        raise APIException(ErrorCodes.REVIEW_NOT_FOUND)

    try:
        model = ReviewGetResponseSchema(**review.model_dump())
    except Exception as _exec:
        raise APIException(ErrorCodes.SCHEMA_VALIDATION_FAILED) from _exec

    return model


@api.route("/<int:review_id>", methods=["PUT"])
@login_required
@validate()
def update_review_by_admin(review_id: int, body: ConfirmReviewRequestSchema):
    """
    Endpoint to update a review by admin

    Args:
        review_id (int): ID of the review
        body (ConfirmReviewRequestSchema)
    Returns:
        Success response with status 200
    """
    check_resource_authorization(review_id=review_id)
    review = db.review.find_first(where={"id": review_id}, include={"facility": {}})
    if not review:
        raise APIException(ErrorCodes.REVIEW_NOT_FOUND)

    is_rejected_without_cmt = body.result == DeviceReviewAllowedEnums.REJECTED and not body.comment
    if is_rejected_without_cmt:
        raise APIException(ErrorCodes.REJECT_WITHOUT_COMMENT)

    # Fetch facility from the review query
    # facility = db.facility.find_first(where={"review_id": review_id})
    if not review.facility:
        raise APIException(ErrorCodes.FACILITY_NOT_FOUND)

    if body.result in [
        DeviceReviewAllowedEnums.APPROVED.value,
        DeviceReviewAllowedEnums.REJECTED.value,
    ]:
        # Get the latest review for the device
        latest_device_review = db.review.find_first(
            where={
                "facility_id": int(review.facility_id),
                "device_id": int(review.device_id),
                "customer_id": int(review.customer_id),
            },
            order={"created_at_utc": "desc"},
        )

        # If the latest device review is not the current review don't approve / reject
        if latest_device_review.id != review.id:
            if body.result == DeviceReviewAllowedEnums.APPROVED.value:
                raise APIException(ErrorCodes.REVIEW_APPROVE_FAILED)
            raise APIException(ErrorCodes.REVIEW_REJECT_FAILED)

    # max_wait and timeout is added overriding the default, because, in case of Azure SQL DB
    # if the transaction takes more than 5s  and there is a timeout of 5s default, which results in failed transaction.
    # This is unlikely to occur in review update transaction, but added for safety
    with db.tx(
        max_wait=timedelta(seconds=DB_TRANSACTION_MAX_WAIT_SECONDS),
        timeout=timedelta(seconds=DB_TRANSACTION_TIMEOUT_SECONDS),
    ) as transaction:
        transaction.review.update(
            where={"id": review_id},
            data={
                "result": body.result,
                "review_comment": body.comment if body.comment else "",
                "last_updated_by": str(current_user.id),
                "last_updated_at_utc": datetime.utcnow(),
                # Field not applicable
                # "answered": datetime.utcnow(),
            },
        )

        # Updating the facility's status is not required. Hence commented
        # transaction.facility.update(where={"id": review.facility.id}, data={
        #                             "status": body.result})

        # Update the device status as the review status
        transaction.device.update(where={"id": review.device_id}, data={"result": body.result})

    response_data = ConfirmReviewResponseDataSchema(result=body.result)

    return ResponseHTTPSchema(data=response_data.model_dump()).make_response()


@api.post("")
# Commenting as explicitly checking the validation for the token in the code.
# @login_required
# Commenting as facility token is validated in validate_auth_token
# @facility_required
@validate_auth_token
@validate()
def create_review_by_contractor(body: CreateReviewRequestSchema, payload: dict):
    """
    Endpoint to create the review.

    Args:
        body:       (CreateReviewRequestSchema) Review body containing Review details.
        payload:    (dict) contains facility_id and customer_id.
                    payload is returned as kwargs by`validate_auth_token` decorator.
                    payload is formed by validating the request header in
                    `validate_auth_token` decorator.

    Returns:
        Response: HTTP response indicating success or failure.
    """
    # extract data from review body
    device_id = body.device_id

    check_device_authorization(device_id, payload)

    device = db.device.find_first(where={"id": int(device_id)})

    # Verify device. If no device for the facility then raise exception
    if not device:
        raise APIException(ErrorCodes.DEVICE_NOT_FOUND)

    image = body.image

    # Get the facility ID
    facility_id = payload.get("facility_id")

    # Validate facility_id and device_id
    if not facility_id:
        raise APIException(ErrorCodes.INVALID_FACILITY_ID)

    elif not device_id:
        raise APIException(ErrorCodes.INVALID_DEVICE_ID)

    # Fetch facility
    facility = db.facility.find_first(where={"id": int(facility_id)})
    if not facility:
        raise APIException(ErrorCodes.FACILITY_NOT_FOUND)

    customer = db.customer.find_first(where={"id": int(facility.customer_id)})

    # Check if any review with the Applying state exists
    existing_review = db.review.find_first(
        where={
            "device_id": int(device_id),
            "facility_id": int(facility_id),
            "customer_id": customer.id,
            "result": {"in": [DeviceReviewAllowedEnums.REQUESTING_FOR_REVIEW]},
        }
    )
    if existing_review:
        return ResponseHTTPSchema(
            status_code=200, message="Review already exists", data={"review_id": existing_review.id}
        ).make_response()

    # Check if the latest device review was approved
    latest_device_review = db.review.find_first(
        where={
            "facility_id": int(facility_id),
            "device_id": int(device_id),
            "customer_id": customer.id,
        },
        order={"created_at_utc": "desc"},
    )

    # If the latest device review is approved, Do not create a new review
    if latest_device_review and latest_device_review.result == DeviceReviewAllowedEnums.APPROVED.value:
        raise APIException(ErrorCodes.REVIEW_CREATION_ERROR)

    # Create DB transaction to add review in the DB
    try:
        # max_wait and timeout is added overriding the default, because, in case of Azure SQL DB
        # if the transaction takes more than 5s  and there is a timeout of 5s default, which results in failed transaction.
        # This is unlikely to occur in review create transaction, but added for safety
        with db.tx(
            max_wait=timedelta(seconds=DB_TRANSACTION_MAX_WAIT_SECONDS),
            timeout=timedelta(seconds=DB_TRANSACTION_TIMEOUT_SECONDS),
        ) as transaction:
            # Create a new review record
            data = {
                "customer_id": facility.customer_id,
                "facility_id": facility_id,
                "device_id": device_id,
                "result": DeviceReviewAllowedEnums.REQUESTING_FOR_REVIEW,
                "image_blob": image,
            }
            review = transaction.review.create(data=data)

            # Update the device status as the review status
            transaction.device.update(
                where={"id": review.device_id}, data={"result": DeviceReviewAllowedEnums.REQUESTING_FOR_REVIEW}
            )

    except Exception as _exec:
        raise APIException(ErrorCodes.REVIEW_CREATION_FAILED)
    # Return success response
    return ResponseHTTPSchema(
        status_code=201, message="Create successfully", data={"review_id": review.id}
    ).make_response()
