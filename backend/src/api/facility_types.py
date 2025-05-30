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
File: backend/src/api/facility_types.py
"""

from datetime import timedelta

from flask import Blueprint
from flask_login import current_user, login_required
from flask_pydantic import validate
from src.config import DB_TRANSACTION_MAX_WAIT_SECONDS, DB_TRANSACTION_TIMEOUT_SECONDS
from src.core import db
from src.schemas.facility_types import (
    CreateFacilityTypeRequestSchema,
    FacilityTypeListResponseSchema,
    FacilityTypeSchema,
)
from src.schemas.response import ResponseHTTPSchema

# Admin App API
api = Blueprint("facility-types", __name__, url_prefix="/facility-types")


@api.get("")
@login_required
def get_facility_types():
    """
    GET /facility-types
    Retrieves a list of all facility types.
    """
    rows = db.facility_type.find_many(where={"admin_id": current_user.id})

    # Convert each row to FacilityTypeSchema
    data = [FacilityTypeSchema.model_validate(row.model_dump()) for row in rows]

    # Build a response
    response = FacilityTypeListResponseSchema(
        data=data, total=len(data), message="Facility types retrieved successfully"
    )
    return response.make_response()


@api.post("")
@login_required
@validate()
def create_facility_type(body: CreateFacilityTypeRequestSchema):
    """
    POST /facility-types
    Creates a new facility type
    Request Body (JSON):
    {
      "name": "Parking"
    }
    """

    # Create the new facility type
    with db.tx(
        max_wait=timedelta(seconds=DB_TRANSACTION_MAX_WAIT_SECONDS),
        timeout=timedelta(seconds=DB_TRANSACTION_TIMEOUT_SECONDS),
    ):
        new_type = db.facility_type.create(
            data={"name": body.name, "admin_id": current_user.id, "created_by": "system", "last_updated_by": "system"}
        )

    created_data = FacilityTypeSchema(**new_type.model_dump())

    return ResponseHTTPSchema(
        status_code=201, message="Facility type created", data=created_data.model_dump()
    ).make_response()
