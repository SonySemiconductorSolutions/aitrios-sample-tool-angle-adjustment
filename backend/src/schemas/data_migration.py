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

from typing import Annotated, List, Optional

from pydantic import BaseModel, StringConstraints
from src.config import REGEX_FOR_LOGIN_ID, REGEX_FOR_NAME, REGEX_FOR_TIMESTAMP, REGEX_FOR_URL


class FacilityTypeSchema(BaseModel):
    """
    FacilityType model base schema
    """

    name: Annotated[
        str,
        StringConstraints(strip_whitespace=True, pattern=REGEX_FOR_NAME, strict=True, min_length=1, max_length=127),
    ]


class DeviceTypeSchema(BaseModel):
    """
    DeviceType model base schema
    """

    name: Annotated[
        str,
        StringConstraints(strip_whitespace=True, pattern=REGEX_FOR_NAME, strict=True, min_length=1, max_length=127),
    ]
    sample_image_blob: Annotated[
        str,
        StringConstraints(strip_whitespace=True, strict=True, min_length=1),
    ]


class DeviceSchema(BaseModel):
    """
    Device model base schema
    """

    device_id: Annotated[
        str,
        StringConstraints(strip_whitespace=True, strict=True, min_length=1),
    ]
    device_name: Annotated[
        str,
        StringConstraints(strip_whitespace=True, pattern=REGEX_FOR_NAME, strict=True, min_length=1, max_length=127),
    ]
    device_type_name: Annotated[
        str,
        StringConstraints(strip_whitespace=True, pattern=REGEX_FOR_NAME, strict=True, min_length=1, max_length=127),
    ]


class FacilitySchema(BaseModel):
    """
    Facility model base schema
    """

    facility_type_name: Annotated[
        str,
        StringConstraints(strip_whitespace=True, pattern=REGEX_FOR_NAME, strict=True, min_length=1, max_length=127),
    ]
    prefecture: Annotated[
        str,
        StringConstraints(strip_whitespace=True, pattern=REGEX_FOR_NAME, strict=True, min_length=1, max_length=127),
    ]
    municipality: Annotated[
        str,
        StringConstraints(strip_whitespace=True, pattern=REGEX_FOR_NAME, strict=True, min_length=1, max_length=127),
    ]
    facility_name: Annotated[
        str,
        StringConstraints(strip_whitespace=True, pattern=REGEX_FOR_NAME, strict=True, min_length=1, max_length=127),
    ]
    effective_start_utc: Annotated[
        str,
        StringConstraints(strip_whitespace=True, pattern=REGEX_FOR_TIMESTAMP, strict=True),
    ]
    effective_end_utc: Annotated[
        str,
        StringConstraints(strip_whitespace=True, pattern=REGEX_FOR_TIMESTAMP, strict=True),
    ]
    devices: List[DeviceSchema]


class CustomerSchema(BaseModel):
    """
    Customer model base schema
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
    application_id: Optional[str]
    facilities: List[FacilitySchema]


class AdminSchema(BaseModel):
    """
    Admin model base schema
    """

    device_types: List[DeviceTypeSchema]
    facility_types: List[FacilityTypeSchema]
    customers: List[CustomerSchema]


class DataMigrationSchema(BaseModel):
    """
    Data migration schema
    """

    admin: List[AdminSchema]
