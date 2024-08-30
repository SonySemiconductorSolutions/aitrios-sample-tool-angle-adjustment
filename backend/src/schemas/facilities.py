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
from enum import IntEnum
from typing import List, Optional

from pydantic import BaseModel

from .response import BaseGetResponseSchema


class FacilityStatusSchema(IntEnum):
    NOT_CONFIRMED = 0  # 未確認
    CONFIRMED = 1  # 施設確認済み
    SUBMITTING = 2  # 申請中
    REJECTED = 3  # 却下
    APPROVED = 4  # 承認
    COMPLETED = 9  # 設置完了


class FacilityTypeGetResponse(BaseModel):
    name: str


class FacilityGetResponseSchema(BaseGetResponseSchema):
    id: int
    facility_name: str
    facility_type: FacilityTypeGetResponse | None = None
    prefecture: str | None = None
    municipality: str | None = None
    # Not applicable
    # aitrios_name: str
    device_id: str | None = None
    status: FacilityStatusSchema = FacilityStatusSchema.NOT_CONFIRMED
    # Not applicable
    # request_id: int | None = None
    access_token: str | None = None


class DeviceDataSchema(BaseModel):
    id: int
    device_name: str
    result: Optional[int]


class FacilityDeviceDataSchema(BaseModel):
    devices: List[DeviceDataSchema]


class FacilityStatusGetResponseSchema(BaseGetResponseSchema):
    status: FacilityStatusSchema
    review_comment: str


class FacilityUpdateStatusEnum(IntEnum):
    CONFIRMED = 1
    SUBMITTING = 2
    COMPLETED = 9


class FacilityUpdateRequestSchema(BaseModel):
    status: FacilityUpdateStatusEnum


class FacilityImageListRequestSchema(BaseModel):
    device_id: str
    sample_image_flag: bool = True


class FacilityImageGetResponseSchema(BaseModel):
    device_id: int
    device_image: str | None = None
    sample_image: str | None = None
    retrieved_date: datetime
    comment: str | None = None


class FacilityQRResponseSchema(BaseModel):
    facility_name: str
    prefecture: str
    municipality: str


class ImageTypeSchema(IntEnum):
    REVIEW_COMMENT_AND_SAMPLE_IMAGE = 0
    CAMERA = 1


class FacilityImageGetRequestSchema(BaseModel):
    sample_image_flag: bool | None = False
    image_type: ImageTypeSchema | None = ImageTypeSchema.CAMERA
