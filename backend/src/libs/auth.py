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
from functools import wraps

import jwt
from flask import Flask, g, request
from flask.sessions import SecureCookieSessionInterface
from flask_login import LoginManager, current_user
from jwt import InvalidTokenError
from src.core import db
from src.logger import get_json_logger
from src.schemas import ResponseHTTPSchema

from ..config import APP_SECRET_KEY
from ..exceptions import APIException, APIMissingFieldException, ErrorCodes
from ..models.accounts import Account

logger = get_json_logger()


class CustomSessionInterface(SecureCookieSessionInterface):
    """Disable default cookie generation."""

    def should_set_cookie(self, *args, **kwargs):
        return False

    """Prevent creating session from API requests."""

    def save_session(self, *args, **kwargs):
        if g.get("login_via_header"):
            logger.info(f"Custom session login via header")
            return
        return super(CustomSessionInterface, self).save_session(*args, **kwargs)


def user_loader_callback(request):
    authorization_header = request.headers.get("Authorization")
    if not authorization_header or not authorization_header.startswith("Bearer "):
        raise APIException(ErrorCodes.INVALID_AUTH_HEADER)

    token = authorization_header[len("Bearer ") :]
    try:
        user_data = jwt.decode(token, APP_SECRET_KEY, algorithms=["HS256"])
        login_id = user_data.get("login_id")
        if not login_id:
            return None
        return Account.get_user(login_id)

    except InvalidTokenError:
        return None


def create_login_manager(app: Flask):
    app.session_interface = CustomSessionInterface()

    login_manager = LoginManager()
    login_manager.request_loader(callback=user_loader_callback)

    login_manager.init_app(app)
    login_manager.unauthorized_handler(unauthorized_callback)

    @login_manager.user_loader
    def load_user(user_id):
        return Account.get_user(user_id)

    return login_manager


def validate_auth_token(f):
    """
    Decorator that returns value of the decorated function.
    * Checks for the presence of accepted fields [facility_id, customer_id, start_date and exp]
    * Validates the facility_id, customer_id, start_date and exp
    Args:
        f (_type_): The function to be decorated

    Raises:
        APIException: Exp token, invalid token and exception

    Returns:
        func: Decorated function
    """

    @wraps(f)
    def auth_decorator_function(*args, **kwargs):
        """
        Decorator function to validate the auth token.
        Args:
            args: Contains the tuple values.
            kwargs: Contains query params and body.
        Returns:
            *args, **kwargs: Request
        """
        # Get token from header
        try:
            authorization_header = request.headers.get("Authorization")
            if not authorization_header or not authorization_header.startswith("Bearer "):
                raise Exception
        except Exception:
            raise APIException(ErrorCodes.INVALID_AUTH_HEADER)

        authorization_token = authorization_header[len("Bearer ") :]

        # Verify the token validity, signature and extract payload
        try:
            payload = jwt.decode(authorization_token, APP_SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            raise APIException(ErrorCodes.TOKEN_EXPIRED)
        except jwt.InvalidTokenError:
            raise APIException(ErrorCodes.INVALID_TOKEN)

        # Payload must contain only following fields
        expected_fields = {"customer_id", "exp", "facility_id", "start_time"}

        # Check if only expected fields are present in payload
        for field in expected_fields:
            if field not in payload:
                raise APIMissingFieldException(ErrorCodes.PARAMETER_MISSING, field)

        # check if any extra fields are present
        if set(payload.keys()) != expected_fields:
            raise APIException(ErrorCodes.INVALID_FIELDS_IN_TOKEN)

        # Check if given customer and facility ID are present in DB
        # Also fetch effective start and end time
        facility_id = payload.get("facility_id")
        customer_id = payload.get("customer_id")
        facility = db.facility.find_first(where={"id": facility_id, "customer_id": customer_id})

        if not facility:
            raise APIException(ErrorCodes.INVALID_FACILITY)

        eff_start_time = int(datetime.fromisoformat(facility.effective_start_utc).timestamp())
        eff_end_time = int(datetime.fromisoformat(facility.effective_end_utc).timestamp())

        # Check if start_time is valid
        try:
            start_time_unix_timestamp = payload.get("start_time")
            if not isinstance(start_time_unix_timestamp, int):
                raise Exception
        except Exception:
            raise APIException(ErrorCodes.INVALID_START_TIME)

        current_unix_timestamp = int(datetime.now().timestamp())
        # Verify start_time
        if (current_unix_timestamp < start_time_unix_timestamp) or (start_time_unix_timestamp < eff_start_time):
            raise APIException(ErrorCodes.TOKEN_NOT_YET_VALID)

        # Check if exp is valid
        try:
            end_time_unix_timestamp = payload.get("exp")
            if not isinstance(end_time_unix_timestamp, int):
                raise Exception
        except Exception:
            raise APIException(ErrorCodes.INVALID_EXPIRY)

        # Verify exp
        if (current_unix_timestamp > end_time_unix_timestamp) or (end_time_unix_timestamp > eff_end_time):
            raise APIException(ErrorCodes.TOKEN_EXPIRED)

        kwargs["payload"] = payload

        return f(*args, **kwargs)

    return auth_decorator_function


def check_device_authorization(device_id: int, payload: dict):
    """
    Function to check the existence and authorize the device for a given facility ID.
    Args:
        device_id:  Device ID
        payload:    Dict contains facility_id and customer_id.
    Raises:
        APIException: DEVICE_NOT_FOUND, PERMISSION_DENIED
    Returns:
        None
    """
    if device_id:
        facility_id = payload.get("facility_id")
        device = db.device.find_first(where={"id": device_id})
        # Check whether the device exists in the DB.
        # If not, raise device not found error
        if not device:
            raise APIException(ErrorCodes.DEVICE_NOT_FOUND)

        # Check if the facility has access to the device
        # If not, raise Permission denied error
        if device.facility_id != facility_id:
            raise APIException(ErrorCodes.PERMISSION_DENIED)


def init_app(app: Flask):
    app.secret_key = APP_SECRET_KEY
    create_login_manager(app=app)


def check_resource_authorization(
    customer_id: int | None = None,
    device_id: int | None = None,
    facility_id: int | None = None,
    review_id: int | None = None,
):
    """
    Method to check if the resource is authorized to access

    Args:
        customer_id (int) : ID of the customer
        device_id (int) : ID of the device
        facility_id (int) : ID of the facility
        review_id (int): ID of the review
    """
    if current_user:
        if customer_id:
            record = db.customer.find_first(where={"id": customer_id})
            # Check if record exists
            if not record:
                raise APIException(ErrorCodes.CUSTOMER_NOT_FOUND)
            # Check if record is authorized
            if not record.admin_id == current_user.id:
                raise APIException(ErrorCodes.PERMISSION_DENIED)
        if device_id:
            record = db.device.find_first(
                where={"id": device_id}, include={"facility": {"include": {"customer": True}}}
            )
            # Check if record exists
            if not record:
                raise APIException(ErrorCodes.DEVICE_NOT_FOUND)
            # Check if record is authorized
            if not record.facility.customer.admin_id == current_user.id:
                raise APIException(ErrorCodes.PERMISSION_DENIED)
        if facility_id:
            record = db.facility.find_first(where={"id": facility_id}, include={"customer": {}})
            # Check if record exists
            if not record:
                raise APIException(ErrorCodes.FACILITY_NOT_FOUND)
            if not record.customer.admin_id == current_user.id:
                raise APIException(ErrorCodes.PERMISSION_DENIED)
            if customer_id:
                # Check if given customer_id and facility's customer_id are same
                if record.customer.id != customer_id:
                    raise APIException(ErrorCodes.PERMISSION_DENIED)
        if review_id:
            record = db.review.find_first(where={"id": review_id}, include={"customer": {}})
            # Check if record exists
            if not record:
                raise APIException(ErrorCodes.REVIEW_NOT_FOUND)
            # Check if record is authorized
            if not record.customer.admin_id == current_user.id:
                raise APIException(ErrorCodes.PERMISSION_DENIED)
    return True


def unauthorized_callback():
    """
    Unauthorized Callback Function
    Returns:
        Response: Unauthorized response.
    """
    return ResponseHTTPSchema(status_code=401, message="Unauthorized").make_response()
