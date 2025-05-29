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

from typing import Annotated, List

from pydantic import BaseModel, Field, StringConstraints
from src.config import REGEX_FOR_NAME, REGEX_FOR_TIMESTAMP
from src.schemas.response import BaseGetResponseSchema


class FacilityUpdateGetByIdResponseSchema(BaseGetResponseSchema):
    """
    Response for GET /facilities/{facility_id}
    """

    id: int
    facility_name: str
    facility_type_id: int
    prefecture: str
    municipality: str
    effective_start_utc: str
    effective_end_utc: str
    customer_id: int


class FacilityUpdateBasicSchema(BaseModel):
    """
    Minimal data returned for listing facilities
    """

    id: int
    facility_name: str
    customer_id: int


class FacilityUpdateByCustomerListResponseSchema(BaseModel):
    """
    Response for GET /facilities?customer_id={customer_id}
    """

    facilities: List[FacilityUpdateBasicSchema]
    message: str
    total: int

    def make_response(self, status_code: int = 200):
        """
        Helper method for consistent JSON output
        """
        return {
            "status_code": status_code,
            "message": self.message,
            "facilities": [f.dict() for f in self.facilities],
            "total": self.total,
        }, status_code


class FacilityUpdateCreateOrUpdateRequestSchema(BaseModel):
    """
    Request body for POST /facilities/{facility_id}
    """

    customer_id: Annotated[int, Field(gt=0)]
    facility_name: Annotated[
        str,
        StringConstraints(strip_whitespace=True, pattern=REGEX_FOR_NAME, strict=True, min_length=1, max_length=127),
    ]
    facility_type_id: Annotated[int, Field(gt=0)]
    prefecture: Annotated[
        str,
        StringConstraints(strip_whitespace=True, pattern=REGEX_FOR_NAME, strict=True, min_length=1, max_length=127),
    ]
    municipality: Annotated[
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
