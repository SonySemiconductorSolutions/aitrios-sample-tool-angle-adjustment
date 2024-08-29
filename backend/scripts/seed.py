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

import base64
import json
import mimetypes
import uuid

from cryptography.fernet import Fernet
from prisma import Prisma, errors
from werkzeug.security import generate_password_hash

# ======== User Inputs ========
SIER_JSON_PATH = "./scripts/SIer-Data.json"
APP_SECRET_KEY = "REPLACE-WITH-GENERATED-APP-SECRET-KEY"
# ==============================

# Create DB instance
db = Prisma()

# Create fernet instance to encrypt Data
key = bytes(APP_SECRET_KEY, encoding="utf-8")
base64_encoded_key = base64.urlsafe_b64encode(key)
fernet_obj = Fernet(base64_encoded_key)


def encrypt_data(plain_data: str) -> str:
    """
    Method to Encrypt the data
    Args:
        plain_data (str): data which needs to be encrypted
    Returns:
        str: encrypted data
    """
    plain_data_in_bytes = plain_data.encode("utf-8")
    # decode the bytes data returned from fernet into string
    return fernet_obj.encrypt(plain_data_in_bytes).decode("utf-8")


def clear_data():
    try:
        db.device.delete_many()
        db.device_type.delete_many()
        db.facility.delete_many()
        db.facility_type.delete_many()
        db.customer.delete_many()
        db.admin.delete_many()
    except errors.PrismaError as e:
        print("Clear DB Failed. " + str(e))
        return False


def image_to_base64(image_path):
    try:
        # Open the image file in binary mode
        with open(image_path, "rb") as image_file:
            # Read the binary data of the image
            image_data = image_file.read()
            # Encode the binary data to base64
            base64_encoded = base64.b64encode(image_data)
            # Convert the base64 bytes to a string
            base64_string = base64_encoded.decode("utf-8")
            mime_type = mimetypes.guess_type(image_path)[0]
            base64_string = f"data:{mime_type};base64,{base64_string}"
        return base64_string
    except Exception as _exec:
        print("Error converting the image to base64 string", _exec)
        return ""


def seed_data():
    # Load data from JSON file
    with open(SIER_JSON_PATH, "r") as file:
        data = json.load(file)

    for facility_type in data["facility_type"]:
        db.facility_type.create({"name": facility_type["name"]})

    for device_type in data["device_type"]:
        sample_image_b64 = image_to_base64(device_type["sample_image_path"])
        db.device_type.create({"name": device_type["name"], "sample_image_blob": sample_image_b64})
    # # Insert data into the database
    for admin_data in data["admin"]:
        db.admin.create(
            {
                "login_id": admin_data["login_id"],
                "admin_password": generate_password_hash(admin_data["admin_pass"]),
                "customers": {
                    "create": [
                        {
                            # "admin_id": customer_data["admin_id"],
                            "customer_name": customer_data["customer_name"],
                            "customer_uuid": str(uuid.uuid4()),
                            "auth_url": customer_data["auth_url"],
                            "base_url": customer_data["base_url"],
                            "client_id": encrypt_data(customer_data["client_id"]),
                            "client_secret": encrypt_data(customer_data["client_secret"]),
                            "application_id": customer_data["application_id"],
                            "facilities": {
                                "create": [
                                    {
                                        "facility_type": {
                                            "connect": {
                                                "id": db.facility_type.find_first(
                                                    where={"name": facility_data["facility_type_name"]}
                                                ).id
                                            }
                                        },
                                        "prefecture": facility_data["prefecture"],
                                        "municipality": facility_data["municipality"],
                                        "facility_name": facility_data["facility_name"],
                                        "effective_start_utc": facility_data["effective_start_utc"],
                                        "effective_end_utc": facility_data["effective_end_utc"],
                                        "devices": {
                                            "create": [
                                                {
                                                    "device_id": device_data["device_id"],
                                                    "device_name": device_data["device_name"],
                                                    "device_type": {
                                                        "connect": {
                                                            "id": db.device_type.find_first(
                                                                where={"name": device_data["device_type_name"]}
                                                            ).id
                                                        }
                                                    },
                                                }
                                                for device_data in facility_data["devices"]
                                            ]
                                        },
                                    }
                                    for facility_data in customer_data["facilities"]
                                ]
                            },
                        }
                        for customer_data in admin_data["customers"]
                    ]
                },
            }
        )


if __name__ == "__main__":
    print("Connecting to DB...")
    db.connect()
    print("DB connection success.")

    print("Clearing DB data...")
    if clear_data():
        print("DB clear success.")

    print("Seeding data to DB...")
    seed_data()
    print("Data seed success.")

    print("Disconnecting from DB...")
    db.disconnect()
    print("DB disconnection success.")
