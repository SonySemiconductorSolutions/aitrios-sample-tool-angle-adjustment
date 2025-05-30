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

"""General Data Validator util"""

import imghdr
import math
import os
import re
from datetime import datetime

from src.utils.logger import get_json_logger

logger = get_json_logger()


def validate_date(date_str: str, check_expiry=False) -> bool:
    """Validates the input string if it is valid date or not

    Args:
        date_str (str): date in string format
        check_expiry (bool) : flag indicating expiry time should be checked or not

    Returns:
        bool: True if valid date False otherwise
    """
    try:
        # Parse the date string with the given format
        expiry_date = datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%S%z")

        if check_expiry:
            # Get the current time in UTC
            now = datetime.now(expiry_date.tzinfo)

            # Check if the expiry date is in the future
            if expiry_date <= now:
                logger.error(f"Error: Expiry date '{date_str}' is in the past.")
                return False

        return True
    except ValueError:
        # If parsing fails, the format is invalid
        logger.error(f"Error: Date '{date_str}' does not match format 'YYYY-MM-DDTHH:MM:SS±HH:MM'.")
        return False


def validate_local_url(input_local_path: str) -> bool:
    """Validate the local url

    Args:
        input_local_path (str): path of the url

    Returns:
        bool: True if the path is correct
    """
    # Check if the given image has one of the extensions
    if not input_local_path.lower().endswith((".png", ".jpg", ".jpeg")):
        logger.error(
            f"Error: Unsupported file extension for '{input_local_path}'. Please provide a .jpg, .jpeg, or .png image."
        )
        return False

    # Check if input image file exists in local system
    if not os.path.exists(input_local_path):
        logger.error(f"Error: {input_local_path} file doesn't exist")
        return False

    # Check for file size 0 and return False if so
    if os.path.getsize(input_local_path) == 0:
        logger.error(f"Error: {input_local_path} file size is 0 bytes. Please provide valid file.")
        return False

    # Check if image size is 1MB or less
    if os.path.getsize(input_local_path) > 1 * 1024 * 1024:
        logger.error(
            f"Error: {input_local_path} file size is more than {1024*1024} bytes. Please reduce the file size."
        )
        return False

    # Check if image is actually the png/jpeg
    image_type = imghdr.what(input_local_path)
    if image_type not in ["jpeg", "png"]:
        logger.error(f"Error: {input_local_path} file is not a valid PNG or JPEG image. Please provide valid file.")
        return False

    return True


def validate_loginid(input_str: str) -> bool:
    """Validates the input string if it is valid login_id or not
    Criteria: \n
        1. Length of 1-255 Characters\n
        2. Contains letter from any of 3 categories\n
            a. Lowercase (a-z)\n
            b. Uppercase (A-Z)\n
            c. Digits (0-9)\n
            d. Special Characters ('_', '-') without at start/end

    Args:
        input_str (str): input string

    Returns:
        bool: True if valid login_id False otherwise
    """
    if len(input_str) < 1 or len(input_str) > 255:
        logger.error(f"'{input_str}' : doesn't meet the required length of 1-255 characters.")
        return False

    # Check if the string starts or ends with _, -
    if re.fullmatch(r"^[_\- ].*|.*[_\- ]$", input_str):
        logger.error(f"'{input_str}' : should not start/end with Underscore, hyphen, space.")
        return False

    # Check if the string contains only valid characters
    if not re.fullmatch(r"^[\u4E00-\u9FAF\u3040-\u309F\u30A0-\u30FFa-zA-Z0-9_\-]+$", input_str):
        logger.error(
            f"'{input_str}' : English Alphanumeric characters or Japanese characters except 。 are supported and allowed Special Characters are ('_', '-')."
        )
        return False

    return True


def validate_name(input_str: str) -> bool:
    """Validates the input string if it is valid name or not. \n
    Criteria: \n
        1. English AlphaNumeric characters or Japanese Characters except 。 are supported.
        2. Allowed Special characters are Space, Hyphen -, Underscore _ without at start/end.\n

    Args:
        input_str (str): input string

    Returns:
        bool: True if valid name False otherwise
    """
    if len(input_str) < 1 or len(input_str) > 127:
        logger.error(f"'{input_str}' : doesn't meet the required length of 1-127 characters.")
        return False

    # Check if the string starts or ends with _, -, or space
    if re.fullmatch(r"^[_\-\s].*|.*[_\-\s]$", input_str):
        logger.error(f"'{input_str}' : should not start/end with Underscore, hyphen or space.")
        return False

    # Check if the string contains only valid characters
    if not re.fullmatch(r"^[\u4E00-\u9FAF\u3040-\u309F\u30A0-\u30FFa-zA-Z0-9_\- ]+$", input_str):
        logger.error(
            f"'{input_str}' : English Alphanumeric characters or Japanese characters except 。 are supported. \n"
            f"Allowed Special characters are Space, Hyphen -, Underscore _ without at start/end.\n"
        )
        return False
    return True


def validate_password(input_str: str) -> bool:
    """Validates the input string if it is valid pass or not\n
    Criteria: \n
        1. Length of 8-255 Characters\n
        2. Contains letter from any of 3 categories\n
            a. Lowercase (a-z)\n
            b. Uppercase (A-Z)\n
            c. Digits (0-9)\n
            d. Special Characters ('_', '-', '!', '$', '#', '%', '@')

    Args:
        input_str (str): input string

    Returns:
        bool: True if valid pass False otherwise
    """
    if len(input_str) < 8 or len(input_str) > 255:
        logger.error(f"{input_str} : doesn't meet the required length of 8-255 characters.")
        return False

    error_message = "Password can contain AlphaNumeric characters only from (a-z) (A-Z) (0-9) \nor Special Characters ('_', '-', '!', '$', '#', '%', '@') without space.\n "

    if not bool(re.fullmatch(r"^[a-zA-Z0-9_\-!$#%@]+$", input_str)):
        logger.error(f"'{input_str}' : {error_message}")
        return False

    categories = 0

    # Check for lowercase letters (a-z)
    if any(ch.islower() for ch in input_str):
        categories += 1

    # Check for uppercase letters (A-Z)
    if any(ch.isupper() for ch in input_str):
        categories += 1

    # Check for digits (0-9)
    if any(ch.isdigit() for ch in input_str):
        categories += 1

    # Check for special characters
    special_characters = {"_", "-", "!", "$", "#", "%", "@"}
    if any(ch in special_characters for ch in input_str):
        categories += 1

    # Pass is valid if it contains characters from at least three categories
    if categories < 3:
        logger.error(
            f"'{input_str}' : Password should be combination of any 3 categories: \n 1. Uppercase letters `A-Z` \n 2. Lowercase letters `a-z`\n 3. Digits `0-9`\n 4. Special Characters '_', '-', '!', '$', '#', '%', '@'."
        )
        return False

    return True


def is_nan(value):
    """
    Check if a value is NaN (Not a Number).
    Args:
        value: The value to check.
    Returns:
        bool: True if the value is NaN, False otherwise.
    """
    return isinstance(value, float) and math.isnan(value)


def confirm_alert(alert_text):
    """
    Shows the confirmation alert with yes no
    """
    while True:
        response = input(alert_text + " (y/n): ").lower()
        if response in ["y", "n"]:
            return response == "y"

        logger.info(f"Please respond with 'y' or 'n'.")
