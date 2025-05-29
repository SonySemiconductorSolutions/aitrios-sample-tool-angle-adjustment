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

from datetime import datetime

import jwt
import qrcode
from prisma import errors
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.colormasks import SolidFillColorMask
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer
from src.core import db
from src.logger import get_json_logger

logger = get_json_logger()


class FacilityService:
    """
    A class to generate QR codes with JWT tokens embedded in the URL.

    Attributes:
        facility_id (str): The facility ID.
        customer_id (str): The customer ID.
        secret_key (str): The secret key used to encode the JWT token.
        start_time (str): The start time in YYYY-MM-DD format.
        exp (str): The expiration date in YYYY-MM-DD format.
        url (str): The base URL for the web app.
    """

    def __init__(
        self,
        facility_id=None,
        customer_id=None,
        secret_key=None,
        start_time=None,
        exp=None,
        url=None,
    ):
        """
        Initializes the QRCodeGenerator with the given parameters.

        Parameters:
            facility_id (str): The facility ID.
            customer_id (str): The customer ID.
            secret_key (str): The secret key used to encode the JWT token.
            start_time (str): The start time in YYYY-MM-DD format.
            exp (str): The expiration date in YYYY-MM-DD format.
            url (str): The base URL for the web app.
        """
        self.facility_id = facility_id
        self.customer_id = customer_id
        self.secret_key = secret_key
        self.start_time = start_time
        self.exp = exp
        self.url = url

    def generate_jwt_token(self):
        """
        Generates JWT tokens for the URL.

        Returns:
            str: The JWT token.
        """
        try:
            start_time = datetime.strptime(self.start_time, "%Y-%m-%dT%H:%M:%S%z")
            exp = datetime.strptime(self.exp, "%Y-%m-%dT%H:%M:%S%z")

            payload_url = {
                "facility_id": int(self.facility_id),
                "customer_id": int(self.customer_id),
                "exp": int(exp.timestamp()),
                "start_time": int(start_time.timestamp()),
            }

            token_url = jwt.encode(payload_url, self.secret_key, algorithm="HS256")
            return token_url
        except Exception as e:
            logger.error(f"Error generating JWT token: {e}")
            return None

    def generate_qr_code(self, web_app_url_payload, filename):
        """
        Generate QR codes for web app URL.

        Parameters:
            web_app_url_payload (str): Payload for the web app URL.
            filename (str): Filename to save generated QR code image.
        """
        try:
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_H,
                box_size=10,
                border=4,
            )
            qr.add_data(web_app_url_payload)
            qr.make(fit=True)

            qr_img = qr.make_image(
                image_factory=StyledPilImage,
                module_drawer=RoundedModuleDrawer(),
                color_mask=SolidFillColorMask(back_color=(255, 255, 255), front_color=(0, 0, 0)),
            )
            qr_img.save(filename)
            return True
        except Exception as e:
            logger.error(f"Error generating QR code: {e}")
            return False

    def fetch_facilities(self, customer_id):
        """
        Fetches all facilities associated with a customer from the database.

        Args:
            customer_id (int): The ID of the customer.

        Returns:
            List[Dict]: A list of dictionaries containing facility data.
        """
        try:
            return db.facility.find_many(where={"customer_id": customer_id})
        except errors.PrismaError as e:
            logger.error(f"Error fetching facilities: {e}")
            return []

    def fetch_device_count(self, facility_id):
        """
        Fetches the count of devices associated with a specific facility from the database.

        Args:
            facility_id (int): The ID of the facility.

        Returns:
            int: The count of devices.
        """
        try:
            return db.device.count(where={"facility_id": facility_id})
        except errors.PrismaError as e:
            logger.error(f"Error fetching device count: {e}")
            return 0
