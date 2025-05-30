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

"""
File: backend/src/services/aitrios_service.py
"""
import msal
import requests
from src.config import HTTP_TIMEOUT
from src.exceptions import APIException, ErrorCodes, InvalidAuthTokenException
from src.logger import get_json_logger
from src.schemas.devices import AitriosDeviceSchema, DeviceStatusSchema
from src.services.aitrios_service_v1 import AitriosServiceV1
from src.services.aitrios_service_v2 import AitriosServiceV2
from src.services.aitrios_strategy import AitriosServiceStrategy
from src.utils import decrypt_data

logger = get_json_logger()


# Factory Method to get the appropriate strategy
def get_aitrios_service(base_url: str) -> AitriosServiceStrategy:
    """
    Method to get the AITRIOS service based on the base URL
    Args:
        base_url (str): Base URL of the AITRIOS service
    Returns:
        AitriosServiceStrategy: AitriosServiceV1 or AitriosServiceV2
    """
    if base_url.endswith("/api/v1"):
        return AitriosServiceV1()

    if base_url.endswith("/api/v2") or base_url.endswith("/api/v2-preview"):
        return AitriosServiceV2()

    raise APIException(ErrorCodes.INVALID_BASE_URL)


def decrypt_customer_details(customer: dict) -> dict:
    """Get the decrypted customer details

    Args:
        customer (dict): Customer details encrypted

    Returns:
        dict: Customer details decrypted
    """
    customer["client_id"] = decrypt_data(customer["client_id"])
    customer["client_secret"] = decrypt_data(customer["client_secret"])
    if customer["application_id"]:
        customer["application_id"] = decrypt_data(customer["application_id"])

    return customer


def fetch_images_by_device_id(device_id: str, customer: dict):
    """
    Method to get the images by device ID

    Args:
        device_id (str): Device ID
        customer (dict): Customer details encrypted
    """
    customer_decrypted = decrypt_customer_details(customer)
    access_token = get_aitrios_access_token(customer_decrypted)
    service = get_aitrios_service(customer_decrypted["base_url"])

    image = service.get_device_image(device_id, customer_decrypted["base_url"], access_token)
    if image:
        return f"data:image/jpeg;base64,{image}"
    return None


def get_aitrios_access_token(customer: dict) -> str:
    """
    Method to get the AITRIOS access token

    Args:
        customer (dict) : Customer details decrypted
    Returns:
        AITRIOS access token
    """
    try:
        access_token = None

        auth_url = customer["auth_url"]

        headers = {"Content-Type": "application/x-www-form-urlencoded"}

        # For enterprise edition, application ID is mandatory
        # Checks if the application ID is provided and not None
        if customer.get("application_id") and customer["application_id"] != "":
            application_id = customer["application_id"]
            scope = ["api://" + application_id + "/.default"]
            # Create an instance of the ConfidentialClientApplication API class
            _data = msal.ConfidentialClientApplication(
                client_id=customer["client_id"],
                authority=customer["auth_url"],
                client_credential=customer["client_secret"],
            )
            _response = _data.acquire_token_silent(scopes=scope, account=None)
            if not _response:
                _response = _data.acquire_token_for_client(scopes=scope)
            access_token = _response.get("access_token")
        else:
            data = {
                "client_id": customer["client_id"],
                "scope": "system",
                "client_secret": customer["client_secret"],
                "grant_type": "client_credentials",
            }

            try:
                response = requests.post(url=auth_url, headers=headers, data=data, timeout=HTTP_TIMEOUT)
                # When invalid client ID provided by the user
                if response.status_code == 400 and response.json().get("errorCode") == "invalid_client":
                    raise APIException(ErrorCodes.INVALID_CLIENT_ID)

                # When invalid client Secret provided by the user
                if response.status_code == 401 and response.json().get("error") == "invalid_client":
                    raise APIException(ErrorCodes.INVALID_CLIENT_SECRET)

                if not response.json().get("access_token"):
                    return None
                access_token = response.json().get("access_token")
            except APIException as _api_exec:
                raise _api_exec
            except Exception as _exec:
                logger.exception(str(_exec))
                raise InvalidAuthTokenException
        return access_token
    except APIException as _api_exec:
        raise _api_exec
    except Exception as _exec:
        logger.exception(str(_exec))
        raise InvalidAuthTokenException


def verify_customer_credentials(customer_data: dict):
    """
    Method to verify customer credentials

    Args:
        customer_data (dict): Customer data
    Returns:
        Boolean value
        True if verified, False if not.
    """
    access_token = get_aitrios_access_token(customer_data)
    if not access_token:
        raise InvalidAuthTokenException()

    service = get_aitrios_service(customer_data["base_url"])
    devices = service.get_devices(customer_data["base_url"], access_token, "")
    return bool(devices)


def get_device_status(customer: dict, access_token: str, device_ids: str) -> list[DeviceStatusSchema]:
    """
    Method to get the device status
    Args:
        customer (dict): Customer details
        access_token (str): Access token from AITRIOS
        device_id (str): Comma separated Device IDs
    Return:
        List of DeviceStatusSchema
    """
    service = get_aitrios_service(customer["base_url"])
    # Call the API to get devices
    result = service.get_devices(customer["base_url"], access_token, device_ids)
    return result


def get_aitrios_devices(customer: dict, access_token: str, device_ids: str) -> list[AitriosDeviceSchema]:
    """
    Method to get the devices
    Args:
        customer (dict): Customer details
        access_token (str): Access token from AITRIOS
        device_id (str): Comma separated Device IDs
    Return:
        List of AitriosDeviceSchema
    """
    service = get_aitrios_service(customer["base_url"])
    # Call the API to get devices
    result = service.get_devices(customer["base_url"], access_token, device_ids)
    return result
