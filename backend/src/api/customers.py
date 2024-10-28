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
File: backend/src/api/customers.py
"""

from datetime import timedelta

from flask import Blueprint
from flask_login import current_user, login_required
from flask_pydantic import validate
from requests import RequestException
from src.config import DB_TRANSACTION_MAX_WAIT_SECONDS, DB_TRANSACTION_TIMEOUT_SECONDS
from src.core import db
from src.exceptions import APIException, ErrorCodes, InvalidAuthTokenException, InvalidBaseURLException
from src.libs.auth import check_resource_authorization
from src.schemas import *
from src.services.aitrios_service import verify_customer_credentials
from src.utils import decrypt_data, encrypt_data

api = Blueprint("customers", __name__, url_prefix="/customers")


@api.get("")
@login_required
def get_customers():
    """
    List all customers
    """
    # Get all customers
    rows = db.customer.find_many(where={"admin_id": current_user.id})

    # Map the data with the customer schema
    data = [CustomerListSchema.model_validate(row.model_dump()) for row in rows]
    ret_dict = {"data": data, "total": len(data), "message": "Data retrieved successfully"}

    # Return response using CustomerListResponseSchema
    return CustomerListResponseSchema(**ret_dict).make_response()


@api.get("/<int:customer_id>/console_credentials")
@login_required
def get_console_credentials(customer_id: int):
    """
    Get customers/console_credentials by ID
    Args:
        customer_id: int
    """
    # Check resource authorization
    check_resource_authorization(customer_id=customer_id)

    # Get customer by ID
    customer = db.customer.find_first(where={"id": customer_id, "admin_id": current_user.id})

    # Check whether the customer exists
    if not customer:
        raise APIException(ErrorCodes.CUSTOMER_NOT_FOUND)

    return_data = customer.model_dump()

    if return_data["client_id"]:
        return_data["client_id"] = decrypt_data(return_data["client_id"])
    if return_data["client_secret"]:
        cli_secret = decrypt_data(return_data["client_secret"])
        # Decrypt all the chars except the last 4
        return_data["client_secret"] = "●" * (len(cli_secret) - 4) + cli_secret[-4:]
    # Decrypt if applicable
    if return_data["application_id"]:
        return_data["application_id"] = decrypt_data(return_data["application_id"])

    # Return response using CustomerGetResponseSchema
    return CustomerGetResponseSchema(**return_data).make_response()


@api.put("/<int:customer_id>/console_credentials")
@login_required
@validate()
def update_console_credentials(customer_id: int, body: CustomerUpdateRequestSchema):
    """
    Update customer's console credentials by ID
    Args:
        customer_id: int
        body: {
            "auth_url": "test_updated_url",
            "base_url": "test_updated_url",
            "client_id": "test_client_id",
            "client_secret": "test_secret",
            "application_id": "test_uuid"
        }
    """
    check_resource_authorization(customer_id=customer_id)
    customer = db.customer.find_first(where={"id": customer_id, "admin_id": current_user.id})
    # check whether the customer exists
    if not customer:
        raise APIException(ErrorCodes.CUSTOMER_NOT_FOUND)

    client_secret = body.client_secret
    # Decrypt only if not None
    if customer.client_secret:
        client_secret_decrypted = decrypt_data(customer.client_secret)
        client_secret_masked = "●" * (len(client_secret_decrypted) - 4) + client_secret_decrypted[-4:]
        # Check if the client secret is same as in the DB.
        if client_secret_masked == client_secret:
            client_secret = client_secret_decrypted

    customer_data = {
        "auth_url": body.auth_url,
        "base_url": body.base_url,
        "last_updated_by": current_user.login_id,
        "client_id": body.client_id,
        "client_secret": client_secret,
        "application_id": body.application_id,
    }
    try:
        if not verify_customer_credentials(customer_data):
            raise APIException(ErrorCodes.CONSOLE_VERIFICATION_FAILED)
    except InvalidAuthTokenException as _token_exec:
        if body.application_id:
            raise APIException(ErrorCodes.INVALID_AUTH_TOKEN_ENTERPRISE) from _token_exec
        raise APIException(ErrorCodes.INVALID_AUTH_TOKEN) from _token_exec
    except InvalidBaseURLException as _base_exec:
        raise APIException(ErrorCodes.INVALID_BASE_URL) from _base_exec
    except RequestException as _req_exec:
        raise APIException(ErrorCodes.INVALID_BASE_URL) from _req_exec
    except APIException as _api_exec:
        raise _api_exec
    except Exception as _exec:
        raise APIException(ErrorCodes.CONSOLE_VERIFICATION_FAILED) from _exec

    # Encrypt the data
    customer_data["client_id"] = encrypt_data(body.client_id)
    customer_data["client_secret"] = encrypt_data(client_secret)
    customer_data["application_id"] = (
        encrypt_data(body.application_id) if body.application_id != "" else body.application_id
    )

    # Update the customer record.
    # max_wait and timeout is added overriding the default, because, in case of Azure SQL DB
    # if the transaction takes more than 5s  and there is a timeout of 5s default, which results in failed transaction.
    # This is unlikely to occur in customer update transaction, but added for safety
    with db.tx(
        max_wait=timedelta(seconds=DB_TRANSACTION_MAX_WAIT_SECONDS),
        timeout=timedelta(seconds=DB_TRANSACTION_TIMEOUT_SECONDS),
    ) as transaction:
        transaction.customer.update(
            where={"id": customer_id},
            data={**customer_data, "last_updated_at_utc": datetime.utcnow()},
        )
    response_data = {"message": "Successfully updated"}
    return ResponseHTTPSchema(**response_data).make_response()
