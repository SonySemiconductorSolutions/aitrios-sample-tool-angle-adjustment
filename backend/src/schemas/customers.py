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

from datetime import datetime
from typing import Annotated, List

from pydantic import BaseModel, StringConstraints, field_serializer
from src.config import REGEX_FOR_NAME, REGEX_FOR_URL
from src.utils import serialize_datetime

from .reviews import BaseGetResponseSchema, ListResponseHTTPSchema


class CustomerSchema(BaseModel):
    """
    Customer model base schema
    """

    id: int
    customer_name: str
    auth_url: str | None = None
    base_url: str | None = None
    client_id: str | None = None
    client_secret: str | None = None
    application_id: str | None = None
    created_by: str
    last_updated_by: str
    created_at_utc: datetime | None = None
    last_updated_at_utc: datetime | None = None

    @field_serializer("created_at_utc", "last_updated_at_utc")
    def serialize_datetime(self, datetime_field: datetime):
        """
        Serializer for datetime fields
        """
        return serialize_datetime(datetime_field=datetime_field)


class CustomerListSchema(BaseModel):
    """
    Customer model base schema to list customers
    """

    id: int
    customer_name: str
    created_by: str
    last_updated_by: str
    created_at_utc: datetime | None = None
    last_updated_at_utc: datetime | None = None

    @field_serializer("created_at_utc", "last_updated_at_utc")
    def serialize_datetime(self, datetime_field: datetime):
        """
        Serializer for datetime fields
        """

        return serialize_datetime(datetime_field=datetime_field)


class CustomerListResponseSchema(ListResponseHTTPSchema):
    """
    Customer list response schema
    """

    data: List[CustomerListSchema] | None = []


class CustomerUpdateRequestSchema(BaseModel):
    """
    Customer update request schema
    """

    customer_name: Annotated[
        str,
        StringConstraints(strip_whitespace=True, pattern=REGEX_FOR_NAME, strict=True, min_length=1, max_length=127),
    ]
    auth_url: Annotated[
        str,
        StringConstraints(strip_whitespace=True, pattern=REGEX_FOR_URL, strict=True),
    ]
    base_url: Annotated[
        str,
        StringConstraints(strip_whitespace=True, pattern=REGEX_FOR_URL, strict=True),
    ]
    client_id: str
    client_secret: str
    application_id: str | None = None


class CustomerGetResponseSchema(BaseGetResponseSchema, CustomerSchema):
    """
    Customer Get response schema
    """

    pass


class CreateCustomerRequestSchema(BaseModel):
    """
    Schema for POST /customers (request body)
    """

    customer_name: Annotated[
        str,
        StringConstraints(strip_whitespace=True, pattern=REGEX_FOR_NAME, strict=True, min_length=1, max_length=127),
    ]
    client_id: str
    client_secret: str
    auth_url: Annotated[
        str,
        StringConstraints(strip_whitespace=True, pattern=REGEX_FOR_URL, strict=True),
    ]
    base_url: Annotated[
        str,
        StringConstraints(strip_whitespace=True, pattern=REGEX_FOR_URL, strict=True),
    ]
    application_id: str


class CreateCustomerResponseSchema(BaseModel):
    """
    Data object returned after customer creation
    """

    id: int
    customer_name: str
