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

import os
from datetime import datetime

import jwt
import qrcode
from prisma import Prisma, errors
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.colormasks import SolidFillColorMask
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer

# ======== User Inputs ========
# Edit the URL here
URL = "REPLACE-WITH-CONTRACTOR-URL"
APP_SECRET_KEY = "REPLACE-WITH-GENERATED-APP-SECRET-KEY"
# ==============================


class QRCodeGenerator:
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

    def __init__(self, facility_id=None, customer_id=None, secret_key=None, start_time=None, exp=None, url=None):
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

        # Create DB instance
        self.db = Prisma()
        self.db.connect()

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
            print(f"Error generating JWT token: {e}")
            return None

    def generate_qr_code(self, web_app_url_payload, filename_prefix):
        """
        Generate QR codes for web app URL.

        Parameters:
            web_app_url_payload (str): Payload for the web app URL.
            filename_prefix (str): Prefix for the filename of the generated QR code images.
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
            qr_img.save(f"{filename_prefix}.png")

            filename = f"{filename_prefix}.png"
            print(f"\nQR Code of Web App URL stored at: \n{os.path.abspath(filename)}")
        except Exception as e:
            print(f"Error generating QR code: {e}")

    def create_payload(self):
        """
        Creates payload for URL.
        """
        try:
            start_time = datetime.strptime(self.start_time, "%Y-%m-%d")
            exp = datetime.strptime(self.exp, "%Y-%m-%d")

            payload_url = {
                "start_time": int(start_time.timestamp()),
                "exp": int(exp.timestamp()),
                "facility_id": int(self.facility_id),
                "customer_id": int(self.customer_id),
            }

            output_file = f"QRCode+{self.customer_id}+{self.facility_id}+devices"
            self.generate_qr_code_with_payload(payload_url, self.url, output_file)
        except Exception as e:
            print(f"Error creating payload: {e}")

    def generate_qr_code_with_payload(self, payload_url, base_url, output_file):
        """
        Generates a QR code with a JWT token.

        Args:
            payload_url (dict): The payload to encode in the JWT token.
            base_url (str): The base URL to include in the QR code.
            output_file (str): The name of the file to save the QR code image.
        """
        try:
            web_app_url_token = jwt.encode(payload_url, self.secret_key, algorithm="HS256")
            web_app_url_payload = f"{base_url}?authenticate={web_app_url_token}"
            self.generate_qr_code(web_app_url_payload, output_file)
        except Exception as e:
            print(f"Error generating QR code with payload: {e}")

    def fetch_admins(self):
        """
        Fetches all administrators from the database.

        Returns:
            List[Dict]: A list of dictionaries containing admin data.
        """
        try:
            return self.db.admin.find_many()
        except errors.PrismaError as e:
            print(f"Error fetching admins: {e}")
            return []

    def fetch_customers(self, admin_id):
        """
        Fetches all customers associated with a specific administrator from the database.

        Args:
            admin_id (int): The ID of the administrator.

        Returns:
            List[Dict]: A list of dictionaries containing customer data.
        """
        try:
            return self.db.customer.find_many(where={"admin_id": admin_id})
        except errors.PrismaError as e:
            print(f"Error fetching customers: {e}")
            return []

    def fetch_facilities(self, customer_id):
        """
        Fetches all facilities associated with a customer from the database.

        Args:
            customer_id (int): The ID of the customer.

        Returns:
            List[Dict]: A list of dictionaries containing facility data.
        """
        try:
            return self.db.facility.find_many(where={"customer_id": customer_id})
        except errors.PrismaError as e:
            print(f"Error fetching facilities: {e}")
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
            return self.db.device.count(where={"facility_id": facility_id})
        except errors.PrismaError as e:
            print(f"Error fetching device count: {e}")
            return 0


def main():
    facility_id = None
    customer_id = None
    start_time = None

    exp = None

    # Initialize QRCodeGenerator
    qr_generator = QRCodeGenerator(facility_id, customer_id, APP_SECRET_KEY, start_time, exp, URL)
    admins = qr_generator.fetch_admins()

    for admin in admins:
        customers = qr_generator.fetch_customers(admin.id)
        for customer in customers:
            facilities = qr_generator.fetch_facilities(customer.id)
            for facility in facilities:
                # Update QRCodeGenerator instance attributes
                qr_generator.facility_id = facility.id
                qr_generator.customer_id = customer.id
                qr_generator.start_time = facility.effective_start_utc
                qr_generator.exp = facility.effective_end_utc

                # Generate JWT token
                token_url = qr_generator.generate_jwt_token()
                if token_url:
                    web_app_url_payload = f"{URL}?authenticate={token_url}"
                    print("\nURL token: ", token_url)
                    print("\nWeb App URL: ", web_app_url_payload)

                    main_directory = "QRCodes"
                    if not os.path.exists(main_directory):
                        os.mkdir(main_directory)

                    customer_name_directory = f"{main_directory}/{customer.customer_name}"
                    if not os.path.exists(customer_name_directory):
                        os.mkdir(customer_name_directory)

                    output_file = f"{customer_name_directory}/QRCode+{customer.customer_name}+{facility.facility_name}+{qr_generator.fetch_device_count(facility.id)}+app-url"
                    qr_generator.generate_qr_code(web_app_url_payload, output_file)
                else:
                    print("Failed to generate tokens.")
    # Disconnect from DB after generating the QR codes
    qr_generator.db.disconnect()


if __name__ == "__main__":
    main()
