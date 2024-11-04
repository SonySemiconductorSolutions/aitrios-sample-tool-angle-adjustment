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
File: tools/caat-helper/src/services/aitrios_service.py
"""
import sys

import msal
import requests
from retry import retry
from src.utils.logger import get_json_logger

SSL_VERIFICATION = True
HTTP_TIMEOUT = 55
logger = get_json_logger()


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
                    logger.error(f"Invalid client id for the customer {customer['customer_name']}")
                    logger.error("Validation failed: Please enter correct customer credentials in the customer sheet")
                    sys.exit(1)
                # When invalid client Secret provided by the user
                if response.status_code == 401 and response.json().get("error") == "invalid_client":
                    logger.error(f"Invalid client secret for the customer {customer['customer_name']}")
                    logger.error("Validation failed: Please enter correct customer credentials in the customer sheet")
                    sys.exit(1)

                if not response.json().get("access_token"):
                    return None
                access_token = response.json().get("access_token")
            except Exception as _exec:
                logger.error(f"Invalid Auth token for the customer {customer['customer_name']}")
                logger.error("Validation failed: Please enter correct customer credentials in the customer sheet")
                sys.exit(1)
        return access_token
    except Exception as _exec:
        logger.error(f"Invalid Auth token for the customer {customer['customer_name']}")
        logger.error("Validation failed: Please enter correct customer credentials in the customer sheet")
        sys.exit(1)


def get_all_devices(base_url: str, access_token: str, customer_name: str):
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
        logger.error(f"API request timed out")
        logger.error("Please try again after some time.")
        return False
    except requests.exceptions.RequestException:
        logger.error(f"Invalid base_url for the customer {customer_name}")
        logger.error("Validation failed: Please enter correct customer credentials in the customer sheet")
        sys.exit(1)


def verify_customer_credentials(customer_data: dict):
    """
    Method to verify customer credentials

    Args:
        customer_data (dict): Customer data
    Returns:
        Boolean value
        True if verified, False if not.
    """
    required_fields = ["base_url", "auth_url", "client_id", "client_secret"]

    # Check if all fields are empty
    all_empty = all(customer_data.get(field) == "" for field in required_fields)
    if all_empty:
        logger.info(
            f"The customer credentials for the customer {customer_data['customer_name']} is empty, so please add it from the admin app"
        )
        return True
    # Check if all fields are non-empty
    all_non_empty = all(customer_data.get(field) != "" for field in required_fields)
    if not all_empty and not all_non_empty:
        empty_fields = [field for field in required_fields if customer_data.get(field) == ""]
        logger.error(
            f"Validation failed: {', '.join(empty_fields)} is empty for the customer {customer_data['customer_name']}"
        )
        logger.error("Validation failed: Please enter correct customer credentials in the customer sheet")
        sys.exit(1)

    base_url = customer_data["base_url"]
    access_token = get_aitrios_access_token(customer_data)
    if not access_token:
        logger.error(f"Access token is empty for the customer {customer_data['customer_name']}")
        logger.error("Validation failed: Please enter correct customer credentials in the customer sheet")
        return False
    devices = get_all_devices(base_url, access_token, customer_data["customer_name"])
    if not devices:
        logger.error(f"Error while getting the device details for the customer {customer_data['customer_name']}")
        logger.error("Validation failed: Please enter correct customer credentials in the customer sheet")
        return False
    logger.info(f"Successfully verified the customer credentials for the customer {customer_data['customer_name']}.")
    return True
