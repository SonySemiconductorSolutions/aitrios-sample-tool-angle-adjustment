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
File: backend/src/services/aitrios_service_v2.py
"""
import json

import requests
from retry import retry
from src.config import HTTP_TIMEOUT, SSL_VERIFICATION
from src.exceptions import APIException, ErrorCodes, InvalidBaseURLException, RetryAPIException
from src.logger import get_json_logger
from src.schemas.devices import AitriosDeviceSchema
from src.services.aitrios_strategy import AitriosServiceStrategy

logger = get_json_logger()

BACKOFF_SECS = 1
DELAY_SECS = 2  # initial delay between attempts
RETRIES = 2


# Concrete Strategy for V2
class AitriosServiceV2(AitriosServiceStrategy):
    """
    Service class that interacts with the AITRIOS V2 API to retrieve device images and device information.
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
        payload = json.dumps(
            {
                "command_name": "direct_get_image",
                "parameters": {
                    "sensor_name": "sensor_chip",
                    "crop_h_offset": 0,
                    "crop_v_offset": 0,
                    "crop_h_size": 4056,
                    "crop_v_size": 3040,
                },
            }
        )

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}",
        }
        try:
            response = requests.post(
                f"{base_url}/devices/{device_id}/command",
                headers=headers,
                data=payload,
                timeout=HTTP_TIMEOUT,
                verify=SSL_VERIFICATION,
            )

            # 400 will be raised when AITRIOS cannot find the given device ID
            if response.status_code == 400:
                # {'result': 'ERROR', 'code': 'E.SC.API.0308001', 'message': 'Invalid parameter device_id.', 'time': '2025-01-29T03:54:08.283105+00:00'}
                raise APIException(ErrorCodes.DEVICE_NOT_FOUND_IN_AITRIOS)
            response.raise_for_status()

            response_data = response.json()
        except requests.exceptions.Timeout:
            raise RetryAPIException()
        except requests.exceptions.RequestException as _exec:
            raise requests.exceptions.RequestException from _exec
        try:
            content = response_data["command_response"]
            image = content["image"]
        except KeyError:
            raise RetryAPIException()
        # Aitrios always return jpeg image
        return image

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
            for aitrios_device in devices:
                device_id = aitrios_device["device_id"]
                device_name = aitrios_device["device_name"]  # aitrios v2 API

                # Gather group_name from multiple device_groups
                device_groups = aitrios_device.get("device_groups", [])
                group_names = [grp["device_group_id"] for grp in device_groups]
                group_name_str = ", ".join(group_names)

                temp = {
                    "device_id": device_id,
                    "device_name": device_name,
                    "connection_status": aitrios_device["connection_state"],  # aitrios v2 API
                    "group_name": group_name_str,
                }
                result.append(AitriosDeviceSchema(**temp))
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
