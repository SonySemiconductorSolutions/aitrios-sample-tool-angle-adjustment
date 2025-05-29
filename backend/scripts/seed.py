# ------------------------------------------------------------------------
# Copyright 2024-2025 Sony Semiconductor Solutions Corp. All rights reserved.

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
    """
    Method to clear the DB data
    Returns:
        bool: True if successful, False otherwise
    """
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
    """
    Method to convert image to base64 string
    Args:
        image_path (str): path of the image
    Returns:
        str: base64 string of the image
    """
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


def seed_data() -> bool:
    """
    Method to seed data into the DB
    Returns:
        bool: True if successful, False otherwise
    """

    # Load data from JSON file
    with open(SIER_JSON_PATH, "r") as file:
        json_data = json.load(file)

    # Assign the first admin record to a variable for reuse
    admin_data = json_data["admin"]
    if not admin_data:
        print("No admin data found in the JSON file.")
        return False

    for admin_data in json_data["admin"]:

        hashed_password = generate_password_hash(admin_data["admin_pass"])
        admin = db.admin.create(
            data={
                "login_id": admin_data["login_id"],
                "admin_password": hashed_password,
                "created_by": "seed_script",
                "last_updated_by": "seed_script",
            }
        )
        admin_id = admin.id

        # Validate device type images
        for device_type_data in admin_data["device_types"]:
            if not image_to_base64(device_type_data["sample_image_path"]):
                print("invalid sample image blob format: " + device_type_data["sample_image_path"])
                return False

        # Step 4: Populate the data into the created user
        # Insert facility types
        for facility_type_data in admin_data["facility_types"]:
            existing_facility_type = db.facility_type.find_first(
                where={"name": facility_type_data["name"], "admin_id": admin_id}
            )
            if existing_facility_type:
                # Update the existing facility type if needed (no fields to update in this case)
                pass
            else:
                # Create a new facility type
                db.facility_type.create(data={"name": facility_type_data["name"], "admin_id": admin_id})

        # Insert device types
        for device_type_data in admin_data["device_types"]:

            existing_device_type = db.device_type.find_first(
                where={"name": device_type_data["name"], "admin_id": admin_id}
            )
            if existing_device_type:
                # Update the existing device type
                db.device_type.update(
                    where={"id": existing_device_type.id},
                    data={"sample_image_blob": image_to_base64(device_type_data["sample_image_path"])},
                )
            else:
                # Create a new device type
                db.device_type.create(
                    data={
                        "name": device_type_data["name"],
                        "sample_image_blob": image_to_base64(device_type_data["sample_image_path"]),
                        "admin_id": admin_id,
                    }
                )

        # Insert customers
        customer_map = {}
        for customer_data in admin_data["customers"]:
            customer = db.customer.create(
                data={
                    "admin_id": admin_id,
                    "customer_name": customer_data["customer_name"],
                    "customer_uuid": str(uuid.uuid4()),
                    "auth_url": customer_data["auth_url"],
                    "base_url": customer_data["base_url"],
                    "client_id": encrypt_data(customer_data["client_id"]),
                    "client_secret": encrypt_data(customer_data["client_secret"]),
                    "application_id": (
                        encrypt_data(customer_data["application_id"]) if customer_data["application_id"] else None
                    ),
                }
            )
            customer_map[customer_data["customer_name"]] = customer.id

        # Insert facilities
        facility_map = {}
        for customer_data in admin_data["customers"]:
            customer_id = customer_map[customer_data["customer_name"]]
            for facility_data in customer_data["facilities"]:
                facility_type = db.facility_type.find_first(
                    where={"name": facility_data["facility_type_name"], "admin_id": admin_id}
                )
                if not facility_type:
                    print("FACILITY_TYPE_NOT_FOUND, " + facility_data["facility_type_name"])
                    return False

                facility = db.facility.create(
                    data={
                        "customer_id": customer_id,
                        "facility_type_id": facility_type.id,
                        "prefecture": facility_data["prefecture"],
                        "municipality": facility_data["municipality"],
                        "facility_name": facility_data["facility_name"],
                        "effective_start_utc": facility_data["effective_start_utc"],
                        "effective_end_utc": facility_data["effective_end_utc"],
                    }
                )
                facility_map[facility_data["facility_name"]] = facility.id

        # Insert devices
        for customer_data in admin_data["customers"]:
            for facility_data in customer_data["facilities"]:
                facility_id = facility_map[facility_data["facility_name"]]
                for device_data in facility_data["devices"]:
                    device_type = db.device_type.find_first(
                        where={"name": device_data["device_type_name"], "admin_id": admin_id}
                    )
                    if not device_type:
                        print("DEVICE_TYPE_NOT_FOUND, " + device_data["device_type_name"])
                        return False

                    db.device.create(
                        data={
                            "facility_id": facility_id,
                            "device_id": device_data["device_id"],
                            "device_name": device_data["device_name"],
                            "device_type_id": device_type.id,
                            "admin_id": admin_id,
                        }
                    )

    return True


if __name__ == "__main__":
    print("Connecting to DB...")
    db.connect()
    print("DB connection success.")

    print("Clearing DB data...")
    if clear_data():
        print("DB clear success.")

    print("Seeding data to DB...")
    if seed_data():
        print("Data seed success.")
    else:
        print("Data seed failed.")

    print("Disconnecting from DB...")
    db.disconnect()
    print("DB disconnection success.")
