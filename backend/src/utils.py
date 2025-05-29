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
import base64
from datetime import date, datetime
from io import BytesIO
from typing import Callable, List

from cryptography.fernet import InvalidToken
from PIL import Image
from src.core import fernet
from src.exceptions import APIException, ErrorCodes
from werkzeug.exceptions import BadRequest


def serialize_date(date_field: date = None):
    """
    Serializes a date object.

    Args:
        date_field (date): A date object to be serialized. Defaults to None.

    Returns:
        str: ISO formatted date string or None if date_field is None.
    """
    if not date_field:
        return date_field

    return date_field.isoformat()


def serialize_datetime(datetime_field: datetime = None):
    """
    Serializes a datetime object to an ISO formatted string with seconds precision.

    Args:
        datetime_field (datetime): A datetime object to be serialized. Defaults to None.

    Returns:
        str: ISO 8601 formatted datetime string with seconds precision or None if datetime_field is None.
    """
    if not datetime_field:
        # Return None if datetime_field is None
        return datetime_field

    return datetime_field.isoformat(timespec="seconds")


def add_to_nested_dict(_dict: dict, key: str, value: any):
    """
    Adds a key-value pair to a nested dictionary. If the key already exists and the value
    is a dictionary, it merges the dictionaries recursively.

    Args:
        _dict (dict): The dictionary to which the key-value pair will be added.
        key (str): The key for the value to be added.
        value (any): The value to be added. Can be a dictionary for recursive merging.
    """
    if key in _dict:
        if isinstance(value, dict):
            sub_dict = _dict[key]
            for sub_key, sub_value in value.items():
                # Recursive merging for nested dictionaries
                add_to_nested_dict(sub_dict, sub_key, sub_value)
        else:
            # Overwrite existing value with the new value
            _dict[key] = value
    else:
        # Add the new key-value pair
        _dict[key] = value


def to_list(field: List[str] | str, split_char: str = ",", cast: Callable = str):
    """
    Converts a comma-separated string or a list of strings into a list of values,
    applying an optional type casting function to each element.

    Args:
        field (List[str] | str): The input field to be converted to a list. Can be a string or a list of strings.
        split_char (str): The character used to split the string if field is a string. Defaults to ",".
        cast (Callable): A function to cast each element in the list. Defaults to str.

    Returns:
        List[Any]: A list of values obtained by splitting and casting the input field.

    Raises:
        BadRequest: If the cast function fails to convert any element.
    """
    try:
        _list = field
        if isinstance(field, str):
            # Split the string into a list
            _list = field.split(split_char)
            # Apply the cast function to each element
        return [cast(_field.strip()) for _field in _list]
    except ValueError:
        # Raise an exception if casting fails
        raise BadRequest("Bad request")


# Commenting as the management_id is changed to facility_id.
# Valid format: ATS-[7 digits]-[8 random characters]
# def validate_store_management_id(management_id: str):
#     return bool(re.match("ATS-\d{7}-[\w\s]{8}", management_id))


def encrypt_data(plain_data: str) -> str:
    """
    Method to Encrypt the data
    Args:
        plain_data (str): data which needs to be encrypted
    Returns:
        str: encrypted data
    """
    plain_data_in_bytes = plain_data.encode("utf-8")
    # decode the bytes data returned from fernet into string
    return fernet.encrypt(plain_data_in_bytes).decode("utf-8")


def decrypt_data(encrypted_data: str) -> str:
    """
    Method to decrypt the data
    Args:
        encrypted_data (bytes): Input data to decrypt
    Return:
        str: decrypted string
    """
    try:
        return fernet.decrypt(encrypted_data).decode("utf-8")
    except InvalidToken:
        # When fernet couldn't decrypt the console credentials
        raise APIException(ErrorCodes.INVALID_CREDENTIAL_DATA)
    except TypeError:
        # Fernet may raise TypeError during decryption
        raise APIException(ErrorCodes.INVALID_CREDENTIAL_DATA)
    except Exception:
        # Catch if general exception is raised.
        raise APIException(ErrorCodes.INVALID_CREDENTIAL_DATA)


def dict_has_non_null_values(d: dict, exempt_key: str) -> bool:
    """
    Method to check if the dict has non null values except the exempt key
    Args:
        d (dict): Dictionary as input
    Return:
        bool : True if the dict has non null except one key else False
    """
    return all(value is not None for key, value in d.items() if key != exempt_key)


def is_valid_base64_image(base64_string: str) -> bool:
    """
    Validates if a given base64 string represents a valid image.
    Args:
        base64_string (str): The base64 encoded string of the image.
    Returns:
        bool: True if valid image, False otherwise.
    """
    try:
        header, encoded = base64_string.split(",", 1)
        if not header.startswith("data:image/"):
            return False
        decoded = base64.b64decode(encoded)
        Image.open(BytesIO(decoded)).verify()
        return True
    except Exception:
        return False
