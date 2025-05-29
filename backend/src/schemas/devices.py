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
from enum import Enum
from typing import Annotated, List, Optional

from pydantic import BaseModel, Field, StringConstraints, field_serializer
from src.config import REGEX_FOR_NAME
from src.utils import serialize_datetime

from .facilities import FacilityGetResponseSchema
from .response import BaseGetResponseSchema, ListResponseHTTPSchema


class DeviceTypeSchema(BaseModel):
    """
    Device Type Schema for Device API response
    Args:
        BaseModel (BaseModel): Pydantic BaseModel
    """

    id: int
    name: str
    created_by: str | None = "system"
    created_at_utc: datetime
    last_updated_by: str | None = "system"
    last_updated_at_utc: datetime
    sample_image_blob: str | None = ""

    @field_serializer("created_at_utc", "last_updated_at_utc")
    def serialize_datetime(self, datetime_field: datetime):
        """
        Serializes datetime fields to ISO format
        Args:
            datetime_field (datetime): datetime field to serialize
        """
        return serialize_datetime(datetime_field=datetime_field)


class DeviceSchema(BaseModel):
    """
    Device Schema for Device API response
    Args:
        BaseModel (BaseModel): Pydantic BaseModel
    """

    id: int
    device_id: str
    device_name: str
    device_type: DeviceTypeSchema | None = None
    device_type_id: int
    facility: FacilityGetResponseSchema | None = Field(None, alias="facility")

    @field_serializer("facility")
    def serialize_facility(self, facility_field: List[FacilityGetResponseSchema]):
        """
        Serializes facility field to return the first element if it's a list
        and returns None if the list is empty
        or the original facility field if it's not a list otherwise None

        Args:
            facility_field (List[FacilityGetResponseSchema]): facility field to serialize
        """
        if not facility_field:
            return None
        if not isinstance(facility_field, list):
            return facility_field
        return facility_field[0]


class DeviceStatusSchema(BaseModel):
    """
    Device Status Schema for Device API response
    Args:
        BaseModel (BaseModel): Pydantic BaseModel
    """

    device_id: str | int
    connection_status: str


class AitriosDeviceSchema(BaseModel):
    """
    Aitrios Device Schema for Device API response
    Args:
        BaseModel (BaseModel): Pydantic BaseModel
    """

    device_id: str | int
    device_name: str
    connection_status: str
    group_name: str


class AitriosDeviceListSchema(ListResponseHTTPSchema):
    """
    List of AitriosDeviceSchema
    Args:
        ListResponseHTTPSchema (ListResponseHTTPSchema): Pydantic BaseModel
    """

    data: List[AitriosDeviceSchema]


class DeviceStatusListSchema(ListResponseHTTPSchema):
    """
    List of DeviceStatusSchema
    Args:
        ListResponseHTTPSchema (ListResponseHTTPSchema): Pydantic BaseModel
    """

    data: List[DeviceStatusSchema]


class DeviceGetResponseSchema(BaseGetResponseSchema, DeviceSchema):
    """
    DeviceGetResponseSchema for GET /devices/{device_id}
    Args:
        BaseGetResponseSchema (BaseGetResponseSchema): Pydantic BaseModel
        DeviceSchema (DeviceSchema): Pydantic BaseModel
    """

    pass


class UpdateDeviceTypeReferenceImageSchema(BaseModel):
    """
    Schema for updating the reference image of a device type
    Args:
        BaseModel (BaseModel): Pydantic BaseModel
    """

    reference_image: Annotated[
        str,
        StringConstraints(strip_whitespace=True, strict=True, min_length=1),
    ]


class Status(str, Enum):
    """
    Enum for device status
    Args:
        str (Enum): Pydantic Enum
    """

    CAPTURED = "captured"
    SAMPLE = "sample"


class CreateDeviceTypeRequestSchema(BaseModel):
    """
    Schema for creating a new device type (POST /device-types)
    Args:
        BaseModel (BaseModel): Pydantic BaseModel
    """

    name: Annotated[
        str,
        StringConstraints(strip_whitespace=True, pattern=REGEX_FOR_NAME, strict=True, min_length=1, max_length=127),
    ]
    reference_image: Annotated[
        str,
        StringConstraints(strip_whitespace=True, strict=True, min_length=1),
    ]


class DeviceTypeResponseSchema(BaseModel):
    """
    Response schema for single Devie Type in GET /device-types
    """

    id: int
    name: str


class DeviceTypeListResponseSchema(ListResponseHTTPSchema):
    """
    Response schema for GET /device-types
    """

    data: List[DeviceTypeResponseSchema] = []


class EditDeviceTypeRequestSchema(BaseModel):
    """
    Schema for editing an existing device type
    All fields are optional so the user can update name or reference_image or both
    """

    name: (
        Annotated[
            str,
            StringConstraints(strip_whitespace=True, pattern=REGEX_FOR_NAME, strict=True, min_length=1, max_length=127),
        ]
        | None
    ) = None
    reference_image: (
        Annotated[
            str,
            StringConstraints(strip_whitespace=True, strict=True, min_length=1),
        ]
        | None
    ) = None


class DeviceSaveOrUpdateItemSchema(BaseModel):
    """
    Schema for a single device in the save or update request
    """

    device_id: Annotated[
        str,
        StringConstraints(strip_whitespace=True, strict=True, min_length=1),
    ]
    device_name: Annotated[
        str,
        StringConstraints(strip_whitespace=True, pattern=REGEX_FOR_NAME, strict=True, min_length=1, max_length=127),
    ]
    facility_id: Annotated[int, Field(gt=0)]
    device_type_id: Annotated[int, Field(gt=0)]


class DeviceSaveOrUpdateRequestSchema(BaseModel):
    """
    Schema for the save or update devices request
    """

    customer_id: Annotated[int, Field(gt=0)]
    devices: List[DeviceSaveOrUpdateItemSchema]


class DeviceCombinedItemSchema(BaseModel):
    """Device Schema for Combined devices API response

    Args:
        BaseModel (BaseModel): Pydantic BaseModel
    """

    connection_status: str
    device_id: str
    device_name: str
    device_type_id: Optional[int] = None
    device_type_name: str | None = None
    facility_id: Optional[int] = None
    facility_name: str | None = None
    group_name: str | None = None
    registered_flag: bool


class DeviceCombinedListSchema(BaseModel):
    """List of DeviceCombinedItemSchema

    Args:
        BaseModel (BaseModel): Pydantic BaseModel
    """

    devices: List[DeviceCombinedItemSchema]


class DeviceDeleteSchema(BaseModel):
    """Schema for a single device to be deleted

    Args:
        BaseModel (BaseModel): Pydantic BaseModel
    """

    facility_id: Annotated[int, Field(gt=0)]
    device_id: Annotated[
        str,
        StringConstraints(strip_whitespace=True, strict=True, min_length=1),
    ]


class DeleteDeviceListRequestSchema(BaseModel):
    """List of devices to be deleted

    Args:
        BaseModel (BaseModel): Pydantic BaseModel
    """

    devices: List[DeviceDeleteSchema]
