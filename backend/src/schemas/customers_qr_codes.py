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

from pydantic import BaseModel, Field


class QRCodeCustomerSchema(BaseModel):
    """Customer Schema for QR Code Generation

    Args:
        BaseModel (BaseModel): Pydantic BaseModel
    """

    customer_id: Annotated[int, Field(gt=0)]
    facility_ids: List[Annotated[int, Field(gt=0)]] = None


class GenerateQRCodesRequestSchema(BaseModel):
    """List of QRCodeCustomerSchema
    Request body for POST /customers/qr-codes
      {
        "customers": [
          {
            "customer_id": 58,
            "facility_ids": [
              23,
              25
            ]
          }
        ]
      },
      Args:
          BaseModel (BaseModel): Pydantic BaseModel
    """

    customers: List[QRCodeCustomerSchema] = Field(..., description="List of customers to generate QR codes for.")
