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

from flask import Flask
from pydantic import ValidationError
from src.logger import get_json_logger
from src.schemas.response import ResponseHTTPSchema
from werkzeug.exceptions import HTTPException

logger = get_json_logger()


def register_exceptions(app: Flask):
    app.register_error_handler(400, exception_handler)
    app.register_error_handler(404, exception_handler)
    app.register_error_handler(405, exception_handler)
    app.register_error_handler(401, exception_handler)
    app.register_error_handler(500, exception_handler)


def exception_handler(exception):
    print(exception)
    if isinstance(exception, ValidationError):
        return default_exception_handler(ErrorCodes.INVALID_INPUT)
    elif isinstance(exception, PermissionError):
        return default_exception_handler(ErrorCodes.PERMISSION_DENIED)
    elif isinstance(exception, FileNotFoundError):
        return default_exception_handler(ErrorCodes.RESOURCE_NOT_FOUND)
    elif isinstance(exception, ConnectionError):
        return default_exception_handler(ErrorCodes.SERVICE_UNAVAILABLE)
    elif isinstance(exception, TimeoutError):
        return default_exception_handler(ErrorCodes.REQUEST_TIMEOUT)
    elif isinstance(exception, TypeError):
        return default_exception_handler(ErrorCodes.TYPE_ERROR)
    elif isinstance(exception, ValueError):
        return default_exception_handler(ErrorCodes.VALUE_ERROR)
    elif isinstance(exception, AttributeError):
        return default_exception_handler(ErrorCodes.ATTRIBUTE_ERROR)
    elif isinstance(exception, RuntimeError):
        return default_exception_handler(ErrorCodes.RUNTIME_ERROR)
    elif isinstance(exception, HTTPException):
        if exception.code == 404:
            return default_exception_handler(ErrorCodes.URL_NOT_FOUND)
        if exception.code == 500:
            return default_exception_handler(ErrorCodes.INTERNAL_SERVER_ERROR)
        if exception.code == 403:
            return default_exception_handler(ErrorCodes.PERMISSION_DENIED)
        if exception.code == 503:
            return default_exception_handler(ErrorCodes.SERVICE_UNAVAILABLE)
        if exception.code == 405:
            return default_exception_handler(ErrorCodes.METHOD_NOT_ALLOWED)
    elif isinstance(exception, Exception):
        return default_exception_handler(ErrorCodes.UNEXPECTED_ERROR)
    else:
        return default_exception_handler(ErrorCodes.UNEXPECTED_ERROR)


class RetryAPIException(Exception):
    pass


class APIException(Exception):
    def __init__(self, error_dict):
        self.status_code = error_dict["http_status"]
        self.error_code = error_dict["error_code"]
        self.message = error_dict["message"]
        logger.exception(f"APIException {self.message}")
        super().__init__(self.message)


class APIMissingFieldException(Exception):
    def __init__(self, error_dict, field):
        self.status_code = error_dict["http_status"]
        self.error_code = error_dict["error_code"]
        self.message = f'{error_dict["message"]} `{field}`'
        logger.exception(f"APIMissingFieldException {self.message}")
        super().__init__(self.message)


class InvalidAuthTokenException(Exception):
    pass


class InvalidBaseURLException(Exception):
    pass


def default_exception_handler(error):
    response = ResponseHTTPSchema(
        status_code=error["http_status"], error_code=error["error_code"], message=error["message"]
    )

    logger.exception(f"Default exception handler {error['message']}")
    return response.make_response()


def handle_api_exception(app):
    @app.errorhandler(APIException)
    def api_exception_handler(error):
        response = ResponseHTTPSchema(status_code=error.status_code, error_code=error.error_code, message=error.message)
        return response.make_response()


class ErrorCodes:

    # 400 Client Errors
    INVALID_FACILITY_ID = {
        "http_status": 400,
        "error_code": 40001,
        "message": "Facility ID is invalid or not provided",
    }
    INVALID_DEVICE_ID = {
        "http_status": 400,
        "error_code": 40002,
        "message": "Device ID is invalid or not provided",
    }
    INVALID_CUSTOMER_ID = {
        "http_status": 400,
        "error_code": 40003,
        "message": "Customer ID is invalid or not provided",
    }
    INVALID_INPUT = {"http_status": 400, "error_code": 40004, "message": "Invalid input"}
    TYPE_ERROR = {"http_status": 400, "error_code": 40005, "message": "Type error"}
    VALUE_ERROR = {"http_status": 400, "error_code": 40006, "message": "Value error"}
    REJECT_WITHOUT_COMMENT = {
        "http_status": 400,
        "error_code": 40007,
        "message": "When review is rejected, please write comment",
    }
    SCHEMA_VALIDATION_FAILED = {
        "http_status": 400,
        "error_code": 40008,
        "message": "Schema validation failed",
    }
    PARAMETER_MISSING = {
        "http_status": 400,
        "error_code": 40009,
        "message": "Parameter is required",
    }
    UNEXPECTED_PARAMS = {
        "http_status": 400,
        "error_code": 40010,
        "message": "Unexpected parameters received",
    }
    DUPLICATE_FACILITY_NAME = {
        "http_status": 400,
        "error_code": 40011,
        "message": "Facility name already exists for the customer",
    }
    INVALID_DEVICE_TYPE_ID = {
        "http_status": 400,
        "error_code": 40012,
        "message": "Device Type ID is invalid or not provided",
    }
    INVALID_FILE = {
        "http_status": 400,
        "error_code": 40013,
        "message": "File is invalid or not provided",
    }
    INVALID_JSON_FORMAT = {
        "http_status": 400,
        "error_code": 40014,
        "message": "Invalid JSON format",
    }
    DUPLICATE_CUSTOMER_NAME = {
        "http_status": 400,
        "error_code": 40015,
        "message": "Customer name already exists",
    }
    ADMIN_ALREADY_EXISTS = {
        "http_status": 400,
        "error_code": 40016,
        "message": "Admin with this login_id already exists.",
    }

    # 401 Authorization Errors
    INVALID_AUTH_HEADER = {
        "http_status": 401,
        "error_code": 40101,
        "message": "Invalid authorization header format",
    }
    TOKEN_NOT_YET_VALID = {
        "http_status": 401,
        "error_code": 40102,
        "message": "Token is not yet valid",
    }
    TOKEN_EXPIRED = {
        "http_status": 401,
        "error_code": 40103,
        "message": "Authorization token has expired",
    }
    INVALID_TOKEN = {
        "http_status": 401,
        "error_code": 40104,
        "message": "Invalid authorization token",
    }
    INVALID_FACILITY = {"http_status": 401, "error_code": 40105, "message": "Invalid facility"}
    INVALID_FIELDS_IN_TOKEN = {
        "http_status": 401,
        "error_code": 40106,
        "message": "Unexpected fields in token",
    }
    LOGIN_FAILED = {
        "http_status": 401,
        "error_code": 40107,
        "message": "Username or password is incorrect",
    }
    INVALID_FACILITY_START_DATE = {
        "http_status": 401,
        "error_code": 40108,
        "message": "Invalid start date in the auth token",
    }

    # 403 Forbidden Error
    PERMISSION_DENIED = {"http_status": 403, "error_code": 40301, "message": "Permission denied"}
    REVIEW_CREATION_ERROR = {
        "http_status": 403,
        "error_code": 40302,
        "message": "New review cannot be created as the device already has the approved review",
    }

    REVIEW_APPROVE_FAILED = {
        "http_status": 403,
        "error_code": 40303,
        "message": "Review approval failed as the current review is not the latest one.",
    }
    REVIEW_REJECT_FAILED = {
        "http_status": 403,
        "error_code": 40304,
        "message": "Review rejection failed as the current review is not the latest one.",
    }
    INVALID_AUTH_TOKEN = {
        "http_status": 403,
        "error_code": 40305,
        "message": "Invalid Auth token URL / Client ID / Client secret provided",
    }
    INVALID_AUTH_TOKEN_ENTERPRISE = {
        "http_status": 403,
        "error_code": 40306,
        "message": "Invalid Auth token URL / Client ID / Client secret / Application ID provided",
    }
    INVALID_BASE_URL = {"http_status": 403, "error_code": 40307, "message": "Invalid Base URL"}
    CONSOLE_VERIFICATION_FAILED = {
        "http_status": 403,
        "error_code": 40308,
        "message": "Console credentials verification failed",
    }
    INVALID_CLIENT_ID = {
        "http_status": 403,
        "error_code": 40309,
        "message": "Invalid Client ID provided",
    }
    INVALID_CLIENT_SECRET = {
        "http_status": 403,
        "error_code": 40310,
        "message": "Invalid Client Secret provided",
    }

    # 404 Not Found Errors
    FACILITY_NOT_FOUND = {"http_status": 404, "error_code": 40401, "message": "Facility not found"}
    RESOURCE_NOT_FOUND = {"http_status": 404, "error_code": 40402, "message": "Resource not found"}
    DEVICE_NOT_FOUND = {"http_status": 404, "error_code": 40403, "message": "Device not found"}
    REVIEW_NOT_FOUND = {"http_status": 404, "error_code": 40404, "message": "Review not found"}
    DEVICES_NOT_FOUND = {"http_status": 404, "error_code": 40405, "message": "Devices not found"}
    IMAGE_TYPE_NOT_FOUND = {
        "http_status": 404,
        "error_code": 40406,
        "message": "Image type not found",
    }
    CUSTOMER_NOT_FOUND = {"http_status": 404, "error_code": 40407, "message": "Customer not found"}
    INVALID_START_TIME = {
        "http_status": 404,
        "error_code": 40408,
        "message": "start_time not valid.",
    }
    INVALID_EXPIRY = {"http_status": 404, "error_code": 40409, "message": "exp not valid."}
    URL_NOT_FOUND = {"http_status": 404, "error_code": 40410, "message": "URL not found"}
    DEVICE_TYPE_NOT_FOUND = {"http_status": 404, "error_code": 40411, "message": "Device type not found"}
    FACILITY_TYPE_NOT_FOUND = {"http_status": 404, "error_code": 40412, "message": "Facility type not found"}
    ADMIN_NOT_FOUND = {"http_status": 404, "error_code": 40413, "message": "Admin not found"}

    # 405 Method not allowed
    METHOD_NOT_ALLOWED = {"http_status": 405, "error_code": 40501, "message": "Method not allowed"}

    # 500 Server Errors
    CAMERA_ISSUE = {
        "http_status": 500,
        "error_code": 50001,
        "message": "Something is wrong with camera device",
    }
    RUNTIME_ERROR = {"http_status": 500, "error_code": 50002, "message": "Runtime error occurred"}
    REVIEW_CREATION_FAILED = {
        "http_status": 500,
        "error_code": 50003,
        "message": "Failed to create review",
    }
    REVIEW_UPDATE_FAILED = {
        "http_status": 500,
        "error_code": 50004,
        "message": "Failed to update review",
    }
    DEVICE_STATUS_FAIL = {
        "http_status": 500,
        "error_code": 50005,
        "message": "Failed to get device status",
    }
    DEVICE_IMAGE_FETCH_FAIL = {
        "http_status": 500,
        "error_code": 50006,
        "message": "Failed to fetch device image",
    }
    DEVICE_SAMPLE_IMAGE_FAIL = {
        "http_status": 500,
        "error_code": 50007,
        "message": "Failed to fetch device sample image",
    }
    ATTRIBUTE_ERROR = {
        "http_status": 500,
        "error_code": 50008,
        "message": "Attribute error occurred",
    }
    UNEXPECTED_ERROR = {
        "http_status": 500,
        "error_code": 50009,
        "message": "An unexpected error occurred",
    }
    REVIEW_IMAGE_LOAD_FAILED = {
        "http_status": 500,
        "error_code": 50010,
        "message": "Failed to load review image",
    }
    INVALID_CONSOLE_CREDENTIALS = {
        "http_status": 500,
        "error_code": 50011,
        "message": "Invalid console credentials found",
    }
    INTERNAL_SERVER_ERROR = {
        "http_status": 500,
        "error_code": 50012,
        "message": "An internal server error occurred",
    }
    INVALID_CREDENTIAL_DATA = {
        "http_status": 500,
        "error_code": 50013,
        "message": "Console credential decryption error, Invalid encrypted values found.",
    }
    DEVICE_NOT_FOUND_IN_AITRIOS = {
        "http_status": 500,
        "error_code": 50014,
        "message": "AITRIOS cannot find the device ID",
    }
    REVIEW_DELETE_FAILED = {
        "http_status": 500,
        "error_code": 50015,
        "message": "Failed to delete reviews.",
    }
    DEVICE_UPDATE_FAILED = {
        "http_status": 500,
        "error_code": 50016,
        "message": "Failed to update devices",
    }
    # 503 Service Unavailable
    SERVICE_UNAVAILABLE = {
        "http_status": 503,
        "error_code": 50301,
        "message": "Service unavailable due to connection error",
    }

    # 504 Gateway Timeout
    REQUEST_TIMEOUT = {"http_status": 504, "error_code": 50401, "message": "Request timed out"}
