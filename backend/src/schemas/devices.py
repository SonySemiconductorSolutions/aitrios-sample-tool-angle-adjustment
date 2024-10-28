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

from datetime import datetime
from enum import Enum, IntEnum
from typing import List, Optional

from pydantic import BaseModel, Field, field_serializer
from src.utils import serialize_datetime

from .facilities import FacilityGetResponseSchema
from .response import BaseGetResponseSchema, ListResponseHTTPSchema


class DeviceTypeSchema(BaseModel):
    id: int
    name: str
    created_by: str | None = "system"
    created_at_utc: datetime
    last_updated_by: str | None = "system"
    last_updated_at_utc: datetime
    sample_image_blob: str | None = ""

    @field_serializer("created_at_utc", "last_updated_at_utc")
    def serialize_datetime(self, datetime_field: datetime):
        return serialize_datetime(datetime_field=datetime_field)


class DeviceSchema(BaseModel):
    id: int
    device_id: str
    device_name: str
    device_type: DeviceTypeSchema | None = None
    device_type_id: int
    facility: FacilityGetResponseSchema | None = Field(None, alias="facility")

    @field_serializer("facility")
    def serialize_facility(self, facility_field: List[FacilityGetResponseSchema]):
        if not facility_field:
            return None

        if not isinstance(facility_field, list):
            return facility_field

        return facility_field[0]


class DeviceStatusSchema(BaseModel):
    device_id: str | int
    connection_status: str


class DeviceStatusListSchema(ListResponseHTTPSchema):
    data: List[DeviceStatusSchema]


class DeviceGetResponseSchema(BaseGetResponseSchema, DeviceSchema):
    pass


class UpdateDeviceTypeReferenceImageSchema(BaseModel):
    reference_image: str


class Status(str, Enum):
    CAPTURED = "captured"
    SAMPLE = "sample"
