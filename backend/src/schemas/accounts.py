# ------------------------------------------------------------------------
# Copyright 2024-2025 Sony Semiconductor Solutions Corp. All rights reserved.

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


from typing import Annotated

from pydantic import BaseModel, StringConstraints, field_validator
from src.config import REGEX_FOR_LOGIN_ID, REGEX_FOR_LOGIN_PASSWORD
from src.exceptions import APIException, ErrorCodes

from .reviews import BaseGetResponseSchema


class LoginRequestSchema(BaseModel):
    """
    Schema for login request.
    It validates the login ID and password.
    """

    # Validate login_id contains only alphanumeric characters and underscores
    # and is between 1 and 255 characters long
    login_id: Annotated[
        str,
        StringConstraints(strip_whitespace=True, pattern=REGEX_FOR_LOGIN_ID, strict=True, min_length=1, max_length=255),
    ]
    password: Annotated[
        str,
        StringConstraints(
            strip_whitespace=True, pattern=REGEX_FOR_LOGIN_PASSWORD, strict=True, min_length=8, max_length=255
        ),
    ]


class AdminCreateRequestSchema(BaseModel):
    """
    Schema for creating a new admin.
    """

    login_id: Annotated[
        str,
        StringConstraints(strip_whitespace=True, pattern=REGEX_FOR_LOGIN_ID, strict=True, min_length=1, max_length=255),
    ]
    password: Annotated[
        str,
        StringConstraints(
            strip_whitespace=True, pattern=REGEX_FOR_LOGIN_PASSWORD, strict=True, min_length=8, max_length=255
        ),
    ]
    created_by: str = "system"
    updated_by: str = "system"

    @field_validator("password")
    @classmethod
    def validate_password(cls, password: str) -> str:
        """
        Validates the password to ensure it meets the required complexity:
        - At least three of the following categories:
          1. Uppercase letters (A-Z)
          2. Lowercase letters (a-z)
          3. Digits (0-9)
          4. Special characters (_, -, !, $, #, %, @)
        """
        categories = [
            any(c.islower() for c in password),  # Lowercase
            any(c.isupper() for c in password),  # Uppercase
            any(c.isdigit() for c in password),  # Numbers
            any(not c.isalnum() for c in password),  # Special characters
        ]
        if sum(categories) < 3:
            error_message = (
                "Password must include at least three of the following categories:\n"
                "1. Uppercase letters (A-Z)\n"
                "2. Lowercase letters (a-z)\n"
                "3. Digits (0-9)\n"
                "4. Special characters (_, -, !, $, #, %, @)"
            )
            _ec = ErrorCodes.VALUE_ERROR.copy()
            _ec["message"] = error_message
            raise APIException(_ec)
        return password


class LoginResponseSchema(BaseGetResponseSchema):
    """
    Schema for login response.
    It contains the token, ID, and login ID.
    """

    token: str
    id: str
    login_id: str
