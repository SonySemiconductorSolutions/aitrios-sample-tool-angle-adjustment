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

from flask import Blueprint, request
from flask_login import login_required
from flask_pydantic import validate
from src.core import db
from src.exceptions import APIException, ErrorCodes
from src.libs.auth import check_resource_authorization
from src.schemas.facility_update import (
    FacilityUpdateBasicSchema,
    FacilityUpdateByCustomerListResponseSchema,
    FacilityUpdateCreateOrUpdateRequestSchema,
    FacilityUpdateGetByIdResponseSchema,
)
from src.schemas.response import ResponseHTTPSchema

# Admin App API
api = Blueprint("facility-update", __name__, url_prefix="/facilities")


@api.get("/<int:facility_id>")
@login_required
def get_facility_by_id(facility_id: int):
    """
    GET /facilities/{facility_id}
    Fetches details for a specific facility by ID (completely separate from the old code).
    """

    # Return 404 if facility_id is not valid
    if facility_id <= 0:
        raise APIException(ErrorCodes.FACILITY_NOT_FOUND)

    facility = db.facility.find_first(where={"id": facility_id})
    if not facility:
        raise APIException(ErrorCodes.FACILITY_NOT_FOUND)

    response_model = FacilityUpdateGetByIdResponseSchema(**facility.model_dump())
    return response_model.make_response()


@api.post("/<int:facility_id>")
@login_required
@validate()
def create_or_update_facility(facility_id: int, body: FacilityUpdateCreateOrUpdateRequestSchema):
    """
    POST /facilities/{facility_id}
    Creates or updates a facility record with the given ID.
      - If facility exists, updates it.
      - If it does NOT exist, creates it, ensuring the facility name is unique for the customer.
    """
    try:

        # Return 404 if facility_id is not valid
        if facility_id < 0:
            raise APIException(ErrorCodes.FACILITY_NOT_FOUND)

        # Check if facility exists
        existing = db.facility.find_first(where={"id": facility_id})

        if existing:
            # Update existing facility
            update_data = {
                "facility_name": body.facility_name,
                "prefecture": body.prefecture,
                "municipality": body.municipality,
                "effective_start_utc": body.effective_start_utc,
                "effective_end_utc": body.effective_end_utc,
                "facility_type_id": body.facility_type_id,
                "customer_id": body.customer_id,
            }

            # Validate uniqueness of facility name for the customer
            duplicate = db.facility.find_first(
                where={
                    "facility_name": body.facility_name,
                    "customer_id": body.customer_id,
                    "id": {"not": facility_id},
                }
            )
            if duplicate:
                raise APIException(ErrorCodes.DUPLICATE_FACILITY_NAME)

            db.facility.update(where={"id": facility_id}, data=update_data)
            message = "Facility updated successfully"
        else:
            # Handle the case where the facility ID is not found for an update
            if facility_id > 0:
                raise APIException(ErrorCodes.FACILITY_NOT_FOUND)

            # Check for uniqueness of facility name for the customer before creating
            duplicate = db.facility.find_first(
                where={
                    "facility_name": body.facility_name,
                    "customer_id": body.customer_id,
                }
            )
            if duplicate:
                raise APIException(ErrorCodes.DUPLICATE_FACILITY_NAME)

            # Create new facility
            create_data = {
                "facility_name": body.facility_name,
                "prefecture": body.prefecture,
                "municipality": body.municipality,
                "effective_start_utc": body.effective_start_utc,
                "effective_end_utc": body.effective_end_utc,
                "facility_type_id": body.facility_type_id,
                "customer_id": body.customer_id,
            }
            db.facility.create(data=create_data)
            message = "Facility created successfully"

        return ResponseHTTPSchema(message=message, status_code=200).make_response()
    except APIException as api_exec:
        # Catch expected errors and raise exception
        raise api_exec
    except Exception as api_exec:
        # Catch unexpected errors and return a 500 response
        raise APIException(ErrorCodes.INTERNAL_SERVER_ERROR) from api_exec


@api.get("")
@login_required
def get_facilities_by_customer():
    """
    GET /facilities?customer_id={customer_id}
    Returns a list of facilities for the given 'customer_id' query param.
    """
    customer_id = request.args.get("customer_id", None)
    if not customer_id:
        raise APIException(ErrorCodes.INVALID_CUSTOMER_ID)

    # Validate it is an integer
    try:
        customer_id = int(customer_id)
    except ValueError:
        raise APIException(ErrorCodes.INVALID_CUSTOMER_ID)

    # Return 404 if customer_id is not valid
    if customer_id <= 0:
        raise APIException(ErrorCodes.INVALID_CUSTOMER_ID)

    # Check resource authorization
    check_resource_authorization(customer_id=customer_id)

    rows = db.facility.find_many(where={"customer_id": customer_id})
    data = [FacilityUpdateBasicSchema(**row.model_dump()) for row in rows]

    # Return using a custom list schema
    resp_model = FacilityUpdateByCustomerListResponseSchema(
        facilities=data, message="Facilities retrieved successfully", total=len(data)
    )
    return resp_model.make_response()
