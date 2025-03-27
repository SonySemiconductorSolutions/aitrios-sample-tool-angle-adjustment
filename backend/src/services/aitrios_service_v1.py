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
File: backend/src/services/aitrios_service_v1.py
"""

import requests
from retry import retry
from src.schemas.devices import DeviceStatusSchema
from src.services.aitrios_strategy import AitriosServiceStrategy
from src.config import HTTP_TIMEOUT, SSL_VERIFICATION
from src.exceptions import (
    APIException,
    ErrorCodes,
    InvalidBaseURLException,
    RetryAPIException,
)
from src.logger import get_json_logger

logger = get_json_logger()

BACKOFF_SECS = 1
DELAY_SECS = 2  # initial delay between attempts
RETRIES = 2

# Concrete Strategy for V1
class AitriosServiceV1(AitriosServiceStrategy):
    """
    Service class that interacts with the AITRIOS V1 API to retrieve device images and device information.
    """

    @retry(exceptions=(RetryAPIException,), tries=RETRIES, delay=DELAY_SECS, backoff=BACKOFF_SECS)
    def get_device_image(self, device_id: str, base_url: str, access_token: str):
        """
        Method to get the images by device ID
        Args:
            device_id (str): Device ID
            base_url (str): AITRIOS Base URL
            access_token (dict): AITRIOS console Access Token
        """

        headers = {"Authorization": "Bearer " + access_token}
        params = {"grant_type": "client_credentials"}
        try:
            response = requests.get(
                f"{base_url}/devices/{device_id}/images/latest",
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


    @retry(exceptions=(RetryAPIException,), tries=RETRIES, delay=DELAY_SECS, backoff=BACKOFF_SECS)
    def get_devices(self, base_url: str, access_token: str, device_ids: str):
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

        if device_ids:
            params = {"grant_type": "client_credentials", "device_ids": device_ids}
        else:
            params = {"grant_type": "client_credentials"}

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
            devices = data["devices"]
            # Prepare device ID and status schema
            result = []
            for device in devices:
                temp = {"device_id": device["device_id"], "connection_status": device["connectionState"]}
                result.append(DeviceStatusSchema(**temp))
            return result
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
