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
File: backend/src/schemas/facility_types.py
"""

from datetime import datetime
from typing import Annotated, List

from pydantic import BaseModel, StringConstraints, field_serializer
from src.config import REGEX_FOR_NAME
from src.schemas.response import ListResponseHTTPSchema
from src.utils import serialize_datetime


class FacilityTypeSchema(BaseModel):
    """
    Represents a single facility_type record.
    """

    id: int
    name: str
    created_by: str = "system"
    created_at_utc: datetime | None = None
    last_updated_by: str = "system"
    last_updated_at_utc: datetime | None = None

    @field_serializer("created_at_utc", "last_updated_at_utc")
    def serialize_datetime(self, dt_field: datetime):
        """
        Serializes datetime fields to ISO format
        Args:
            dt_field (datetime): datetime field to serialize
        """
        return serialize_datetime(dt_field)


class CreateFacilityTypeRequestSchema(BaseModel):
    """
    Request body schema for POST /facility-types
    """

    name: Annotated[
        str,
        StringConstraints(strip_whitespace=True, pattern=REGEX_FOR_NAME, strict=True, min_length=1, max_length=127),
    ]


class FacilityTypeListResponseSchema(ListResponseHTTPSchema):
    """
    Response schema for GET /facility-types
    """

    data: List[FacilityTypeSchema] = []
