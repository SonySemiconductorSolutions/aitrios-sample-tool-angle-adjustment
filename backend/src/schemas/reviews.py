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
from typing import Annotated, List

from pydantic import BaseModel, Field, StringConstraints, field_serializer
from src.utils import serialize_datetime

from .devices import DeviceGetResponseSchema
from .facilities import FacilityGetResponseSchema
from .response import BaseGetResponseSchema, ListResponseHTTPSchema, PaginationReviewSchema


class ReviewSchema(BaseModel):
    """
    Review Schema for Review API response
    Args:
        BaseModel (BaseModel): Pydantic BaseModel
    """

    id: int
    image_date_utc: datetime | None = None
    image_blob: str | None = None
    result: int
    review_comment: str
    facility: FacilityGetResponseSchema | None = Field(None, alias="facility")
    device: DeviceGetResponseSchema | None = Field(None, alias="device")
    created_by: str
    created_at_utc: datetime
    last_updated_by: str
    last_updated_at_utc: datetime

    @field_serializer("image_date_utc", "created_at_utc", "last_updated_at_utc")
    def serialize_datetime(self, datetime_field: datetime):
        """
        Serializes datetime fields to ISO format
        Args:
            datetime_field (datetime): datetime field to serialize
        """
        return serialize_datetime(datetime_field=datetime_field)

    @field_serializer("facility")
    def serialize_facility(self, facility_field: List[FacilityGetResponseSchema]):
        """
        Serializes facility field to return a single facility object
        Args:
            facility_field (List[FacilityGetResponseSchema]): facility field to serialize
        """
        if not facility_field:
            return None

        if not isinstance(facility_field, list):
            return facility_field

        return facility_field[0]

    @field_serializer("device")
    def serialize_device(self, device_field: DeviceGetResponseSchema):
        """
        Serializes device field to return a single device object
        Args:
            device_field (DeviceGetResponseSchema): device field to serialize
        """
        if not device_field:
            return None

        if not isinstance(device_field, list):
            return device_field

        return device_field


class ReviewGetSchema(ReviewSchema):
    """
    Response schema for GET /reviews/{id}
    """

    # Addition field when loading image
    image_blob: str | None = None


class ReviewListResponseSchema(ListResponseHTTPSchema):
    """
    Response schema for GET /reviews
    """

    data: List[dict] | None = []
    reviewing_info: dict | None = None
    status_count: dict | None = None


class ReviewGetResponseSchema(BaseGetResponseSchema, ReviewSchema):
    """
    Response schema for GET /reviews/{id}
    """

    pass


class ReviewSortEnum(str, Enum):
    """
    Enum for sorting reviews
    """

    last_updated_by = "last_updated_by"
    status = "status"
    aitrios_name = "aitrios_name"
    device_id = "device_id"
    result = "result"
    answered = "answered"
    image_date = "image_date"
    created_at = "created_at"
    null = ""


class ReviewListSchema(PaginationReviewSchema):
    """
    Request schema for GET /reviews
    """

    customer_id: int
    status: str | None = None
    facility_name: str | None = None
    region: str | None = None  # Currently not used
    prefecture: str | None = None
    municipality: str | None = None
    late_minutes: int | None = 10

    # Not used
    #
    # sort: ReviewSortEnum | None = ReviewSortEnum.last_updated_by
    # sort_order: SortOrderSchema | None = SortOrderSchema.desc


class DeviceReviewAllowedEnums(IntEnum):
    """
    Enum for device review allowed status
    """

    # ------------------------Status Updated by-#
    NOT_USED = 0  # --------------SYSTEM
    INITIAL_STATE = 1  # ---------Contractor app
    REQUESTING_FOR_REVIEW = 2  # -Contractor app
    REJECTED = 3  # --------------Admin app
    APPROVED = 4  # --------------Admin app


class ConfirmReviewRequestSchema(BaseModel):
    """
    Request schema for POST /reviews/confirm
    """

    result: DeviceReviewAllowedEnums
    comment: (
        Annotated[
            str,
            StringConstraints(strip_whitespace=True, strict=True, min_length=1, max_length=255),
        ]
        | None
    ) = None


class ConfirmReviewResponseDataSchema(BaseModel):
    """
    Response schema for POST /reviews/confirm
    """

    result: int


class CreateReviewRequestSchema(BaseModel):
    """
    Request schema for POST /reviews
    """

    device_id: Annotated[int, Field(gt=0)]
    image: Annotated[
        str,
        StringConstraints(strip_whitespace=True, strict=True, min_length=1),
    ]


class UpdateReviewRequestSchema(BaseModel):
    """
    Request schema for PUT /reviews/{id}
    """

    image: Annotated[
        str,
        StringConstraints(strip_whitespace=True, strict=True, min_length=1),
    ]


class DeviceReviewHistorySchema(ListResponseHTTPSchema):
    """
    Response schema for GET /reviews/history
    """

    reviews: List[ReviewGetResponseSchema] | None = []
    device: DeviceGetResponseSchema
    total: int | None = 0
