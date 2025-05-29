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

from src.config import APP_SECRET_KEY, CONTRACTOR_APP_URL
from src.core import db
from src.logger import get_json_logger
from src.services.facility_service import FacilityService

logger = get_json_logger()


def generate_qr_codes_for_customers(customer_id: int, facility_ids: list[int], base_output_dir: str):
    """
    For customer provided in `customer_id`, generate QRs for all facilities of the customer.
    If `facility_ids` is provided, generate QRs for facilities provided only in `facility_ids`.
    and store them in the structure:
      base_output_dir/customerName/facilityName/<.png>
    """

    # 1. For the given customer
    cust = db.customer.find_first(where={"id": customer_id})
    if not cust:
        return

    # Make a folder named after the customer
    customer_folder_name = os.path.join(base_output_dir, cust.customer_name.replace(" ", "_"))
    os.makedirs(customer_folder_name, exist_ok=True)

    # 2. Fetch that customer's facilities

    # If facility_ids is provided, filter by those IDs
    if facility_ids:
        facilities = db.facility.find_many(
            where={"customer_id": customer_id, "id": {"in": facility_ids}}
        )
    else:
        facilities = db.facility.find_many(
            where={"customer_id": customer_id}
        )

    for facility in facilities:
        # Create subfolder for the facility
        facility_folder_name = os.path.join(customer_folder_name, facility.facility_name.replace(" ", "_"))
        os.makedirs(facility_folder_name, exist_ok=True)

        # 3. Using "FacilityService" logic to generate a token + QR code

        # Build the service
        qr_service = FacilityService(
            facility_id=facility.id,
            customer_id=customer_id,
            secret_key=APP_SECRET_KEY,
            start_time=facility.effective_start_utc,
            exp=facility.effective_end_utc,
            url=CONTRACTOR_APP_URL,
        )

        token = qr_service.generate_jwt_token()
        if not token:
            logger.error("Failed to generate JWT for facility %s", facility.facility_name)
            continue

        # Construct the URL
        web_app_url_payload = f"{CONTRACTOR_APP_URL}?authenticate={token}"

        # 4. Generate the QR code
        device_count = qr_service.fetch_device_count(facility.id)
        file_name = f"QRCode+{cust.customer_name}+{facility.facility_name}+{device_count}+app-url.png"
        output_file = os.path.join(facility_folder_name, file_name.replace(" ", "_"))

        success = qr_service.generate_qr_code(web_app_url_payload, output_file)
        if success:
            logger.info("Wrote QR code for facility '%s' at: %s", facility.facility_name, output_file)
        else:
            logger.error("Failed to write QR code for facility '%s'.", facility.facility_name)

        txt_file_name = f"FacilityTokenURL_{facility.facility_name}.txt".replace(" ", "_")
        txt_path = os.path.join(facility_folder_name, txt_file_name)
        with open(txt_path, "w", encoding="utf-8") as token_file:
            token_file.write(web_app_url_payload)
