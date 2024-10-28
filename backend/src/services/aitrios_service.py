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

"""
File: backend/src/services/aitrios_service.py
"""
import msal
import requests
from retry import retry
from src.config import HTTP_TIMEOUT, SSL_VERIFICATION
from src.exceptions import (
    APIException,
    ErrorCodes,
    InvalidAuthTokenException,
    InvalidBaseURLException,
    RetryAPIException,
)
from src.logger import get_json_logger
from src.schemas.devices import DeviceStatusSchema
from src.utils import decrypt_data

logger = get_json_logger()

BACKOFF_SECS = 1
DELAY_SECS = 2  # initial delay between attempts
RETRIES = 2


class GetDeviceImage:
    """
    Class definition to get the latest device image.
    """

    def __init__(self, device_id, access_token, base_url):
        self.device_id = device_id
        self.access_token = access_token
        self.base_url = base_url.rstrip("/")

    @retry(exceptions=(RetryAPIException,), tries=RETRIES, delay=DELAY_SECS, backoff=BACKOFF_SECS)
    def get_image(self):
        """
        Method to get the latest device image
        """

        headers = {"Authorization": "Bearer " + self.access_token}
        params = {"grant_type": "client_credentials"}
        try:
            response = requests.get(
                f"{self.base_url}/devices/{self.device_id}/images/latest",
                headers=headers,
                params=params,
                timeout=HTTP_TIMEOUT,
                verify=SSL_VERIFICATION,
            )
            # 404 will be raised when AITRIOS cannot find the given device ID
            if response.status_code == 404:
                raise APIException(ErrorCodes.DEVICE_NOT_FOUND_IN_AITRIOS)
            response.raise_for_status()

            data = response.json()
        except requests.exceptions.Timeout:
            raise RetryAPIException()
        except requests.exceptions.JSONDecodeError as _js_decode_exec:
            raise InvalidBaseURLException() from _js_decode_exec
        except requests.exceptions.RequestException as _exec:
            logger.exception(f"Failed to get images from AITRIOS server {_exec}")
            raise requests.exceptions.RequestException from _exec

        try:
            content = data["contents"]
        except KeyError:
            # Sometimes, aitrios return warning with payload
            # {'code': 'W.SC.API.0011007', 'message': 'Device responded with an error when requested.
            # Result = Denied', 'result': 'WARNING', 'time': '2024-01-04T08:44:07.152393'}
            logger.warning("Retry because of warning result from Aitrios...")
            raise RetryAPIException()

        # Aitrios always return jpeg image
        return content


def decrypt_customer_details(customer: dict) -> dict:
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

    # Get latest image from the device
    obj = GetDeviceImage(device_id, access_token, customer_decrypted["base_url"])
    image = obj.get_image()
    return f"data:image/jpeg;base64,{image}"


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


def get_all_devices(base_url: str, access_token: str):
    """
    Method to get all the devices associated to the user

    Args:
        base_url (str): AITRIOS Base URL
        access_token (str): AITRIOS console Access Token
    Returns:
        devices list
    """
    try:
        base_url = base_url.rstrip("/")

        headers = {"Authorization": "Bearer " + access_token}
        params = {"grant_type": "client_credentials"}

        response = requests.get(
            f"{base_url}/devices",
            headers=headers,
            params=params,
            timeout=HTTP_TIMEOUT,
            verify=SSL_VERIFICATION,
        )
        data = response.json()

        if response.status_code == 200 and "devices" in data:
            return True
        return False
    except requests.exceptions.Timeout:
        raise RetryAPIException()
    except requests.exceptions.RequestException as _exec:
        logger.exception(f"Failed to get device list from AITRIOS server {_exec}")
        raise InvalidBaseURLException from _exec


def verify_customer_credentials(customer_data: dict):
    """
    Method to verify customer credentials

    Args:
        customer_data (dict): Customer data
    Returns:
        Boolean value
        True if verified, False if not.
    """
    base_url = customer_data["base_url"]

    access_token = get_aitrios_access_token(customer_data)
    if not access_token:
        raise InvalidAuthTokenException()
    devices = get_all_devices(base_url, access_token)
    if not devices:
        return False
    return True


@retry(exceptions=(RetryAPIException,), tries=RETRIES, delay=DELAY_SECS, backoff=BACKOFF_SECS)
def _get_devices(base_url: str, access_token: str, device_ids: str) -> str:
    """
    Method to get devices

    Args:
        base_url (str): AITRIOS Base URL
        access_token (str): AITRIOS console Access Token
        device_ids (str): Comma separated Device ID
    Returns:
        List of devices
    """
    base_url = base_url.rstrip("/")

    headers = {"Authorization": "Bearer " + access_token}
    params = {"grant_type": "client_credentials", "device_ids": device_ids}
    try:
        response = requests.get(
            f"{base_url}/devices",
            headers=headers,
            params=params,
            timeout=HTTP_TIMEOUT,
            verify=SSL_VERIFICATION,
        )
        response.raise_for_status()

        data = response.json()
        return data["devices"]
    except requests.exceptions.Timeout:
        raise RetryAPIException()
    except requests.exceptions.JSONDecodeError as _js_decode_exec:
        raise InvalidBaseURLException() from _js_decode_exec
    except requests.exceptions.RequestException as _exec:
        logger.exception(f"Failed to get images from AITRIOS server {_exec}")
        raise requests.exceptions.RequestException from _exec
    except KeyError:
        logger.warning("Retry because of warning result from Aitrios...")
        raise RetryAPIException()


def get_device_status(customer: dict, access_token: str, device_ids: str):
    """
    Method to get the device status
    Args:
        customer (dict): Customer details
        access_token (str): Access token from AITRIOS
        device_id (str): Comma separated Device IDs
    Return:
        List of DeviceStatusSchema
    """
    # Call the API to get devices
    devices = _get_devices(base_url=customer["base_url"], access_token=access_token, device_ids=device_ids)

    # Prepare device ID and status schema
    result = []
    for device in devices:
        temp = {"device_id": device["device_id"], "connection_status": device["connectionState"]}
        result.append(DeviceStatusSchema(**temp))
    return result
