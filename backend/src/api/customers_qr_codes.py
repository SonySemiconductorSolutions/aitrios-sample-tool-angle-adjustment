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


import os
import shutil
import tempfile
import zipfile
from datetime import datetime

from flask import Blueprint, send_file
from flask_login import login_required
from flask_pydantic import validate
from src.exceptions import APIException, ErrorCodes
from src.libs.auth import check_resource_authorization
from src.qr_generator import generate_qr_codes_for_customers
from src.schemas.customers_qr_codes import GenerateQRCodesRequestSchema

# Admin App API
api = Blueprint("customers-qr", __name__, url_prefix="/customers")


@api.post("/qr-codes")
@login_required
@validate()
def generate_customer_qr_codes(body: GenerateQRCodesRequestSchema):
    """
    POST /customers/qr-codes
    Request Body:
    {
      "customers": [
        {
          "customer_id": int,
          "facility_ids": [
            int,
            int
          ]
        }
      ]
    },

    Generates QR Codes for each facility if provided belonging
    to the specified customer(s), organizes them
    in folders, and returns a ZIP file.
    """
    customers = body.customers

    if not customers or len(customers) == 0:
        raise APIException(ErrorCodes.INVALID_CUSTOMER_ID)

    # Check resource authorization for each customer and each facility
    for customer in customers:
        if customer.facility_ids is None or len(customer.facility_ids) == 0:
            check_resource_authorization(customer_id=customer.customer_id)
        else:
            for facility_id in customer.facility_ids:
                check_resource_authorization(customer_id=customer.customer_id, facility_id=facility_id)

    # 1. Create a temporary directory to store the generated QR codes
    temp_dir = tempfile.mkdtemp(prefix="qr_codes_")

    try:
        # 2. Generate the QR codes
        for customer in customers:
            if customer.facility_ids is None or len(customer.facility_ids) == 0:
                generate_qr_codes_for_customers(customer.customer_id, None, temp_dir)
            else:
                generate_qr_codes_for_customers(customer.customer_id, customer.facility_ids, temp_dir)

        # 3. Zip up the contents
        zip_filename = f"qr_codes_{datetime.now().strftime('%Y%m%d_%H%M%S')}.zip"
        zip_path = os.path.join(temp_dir, zip_filename)
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
            # @pylint:disable=unused-variable
            for root, dirs, files in os.walk(temp_dir):
                for file in files:
                    if file == zip_filename:
                        continue
                    filepath = os.path.join(root, file)
                    # Make a relative path for the zip
                    arcname = os.path.relpath(filepath, start=temp_dir)
                    zipf.write(filepath, arcname=arcname)

        # 4. Return the ZIP file
        return send_file(zip_path, as_attachment=True, download_name=zip_filename, mimetype="application/zip")
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)
