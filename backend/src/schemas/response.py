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

from enum import Enum
from typing import Union

from pydantic import BaseModel

from src.config import DEFAULT_PAGE_SIZE


class ResponseHTTPSchema(BaseModel):
    status_code: int = 200
    error_code: int = 0
    message: str = "Successfully"
    data: Union[dict, list, str] = None

    def make_response(self):
        return self.model_dump(), self.status_code


class BaseGetResponseSchema(BaseModel):
    def make_response(self, status_code: int = 200, error_code: int = 0, message: str = "Successfully"):
        response_schema = ResponseHTTPSchema(
            status_code=status_code, error_code=error_code, message=message, data=self.model_dump())
        return response_schema.make_response()


class ListResponseHTTPSchema(BaseModel):
    status_code: int = 200
    message: str = "Successfully"
    data: Union[dict, list, str] = None
    page: int | None = None
    page_size: int | None = None
    size: int | None = None
    total: int | None = None

    def make_response(self):
        return self.model_dump(), self.status_code


class BaseListResponseSchema(BaseModel):
    def make_response(self):
        response_schema = ListResponseHTTPSchema(
            status_code=200, message="Successfully", data=self.model_dump())
        return response_schema.make_response()


class PaginationReviewSchema(BaseModel):
    page: int | None = 1
    page_size: int | None = DEFAULT_PAGE_SIZE
    pagination: bool = True


class SortOrderSchema(str, Enum):
    asc = "asc"
    desc = "desc"
