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

from flask import Blueprint
from flask_login import login_required
from flask_pydantic import validate
from src.core import db
from src.exceptions import APIException, ErrorCodes
from src.libs.auth import validate_auth_token
from src.models.accounts import Account
from src.schemas import *

api = Blueprint("login", __name__, url_prefix="/auth")


@api.route("/login", methods=["POST"])
@validate()
def login(body: LoginRequestSchema):
    """
    User Login Endpoint
    This endpoint handles user authentication. It validates the provided credentials
    and generates a JWT token upon successful authentication.
    Args:
        body (LoginRequestSchema): Request body containing user credentials.
    Returns:
        Response: Login response with JWT token and user information.
    """
    user: Account = Account.get_user(login_id=body.login_id)

    # Check if user exists and if the credential matches
    if not user or not user.validate_password(password=body.password):
        raise APIException(ErrorCodes.LOGIN_FAILED)

    # Generate JWT token for authenticated user
    token = user.create_jwt_token()
    data = {"token": token, "id": str(user.id), "login_id": user.login_id}
    return LoginResponseSchema(**data).make_response()


@api.route("/logout", methods=["POST"])
@login_required
def logout():
    """
    User Logout Endpoint
    This endpoint logs out the authenticated user by invalidating the current session.
    Returns:
        Response: Logout success response.
    """
    return ResponseHTTPSchema(status_code=200, message="Logout successfully").make_response()


@api.post("/facility")
@validate_auth_token
@validate()
def verify_url_auth_token(payload: dict):
    """
    Endpoint to validate the web app url.
    Args:
        token (dict): Dict containing facility_id, customer_id, exp and start_date.
    Returns:
        Response: HTTP response indicating success or failure.
    """
    # Get the facility ID
    facility_id = payload.get("facility_id")
    customer_id = payload.get("customer_id")
    facility = db.facility.find_first(where={"id": facility_id, "customer_id": customer_id})

    # Return response
    return FacilityQRResponseSchema(
        **{
            "facility_name": facility.facility_name,
            "prefecture": facility.prefecture,
            "municipality": facility.municipality,
        }
    ).model_dump()
