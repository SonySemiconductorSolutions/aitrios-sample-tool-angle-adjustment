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

"""Data Manager for database"""

import uuid
from datetime import datetime, timedelta

import pandas as pd
from prisma import errors
from src.db.connection_manager import get_db_instance
from src.utils.data_validator_util import is_nan
from src.utils.security_util import encrypt_data
from src.utils.util_resources import image_to_base64
from werkzeug.security import generate_password_hash
from src.utils.logger import get_json_logger

logger = get_json_logger()

def add_admin_data(admin_dataframe: pd.DataFrame) -> bool:
    """Adds Admin data in Database

    Args:
        admin_dataframe (DataFrame): admin data

    Returns:
        bool: Returns true if DB update is success
    """
    db = get_db_instance()

    # Track if any new admins were added
    new_admins_added = False

    for index in range(len(admin_dataframe)):
        row = admin_dataframe.iloc[index]

        try:
            # Check if the customer already exists based on customer_name only
            existing_admin = db.admin.find_first(where={"login_id": row["login_id"]})

            if not existing_admin:
                db.admin.create(
                    {
                        "login_id": row["login_id"],
                        "admin_password": generate_password_hash(row["admin_password"]),
                    }
                )

                logger.info(f"Admin '{row['login_id']}' added to the DB.")
                new_admins_added = True

        except Exception as exception:
            logger.exception(str(exception))
            raise exception

    if not new_admins_added:
        logger.info(f"All the admins are already present in the DB.\nNo new admins were added.")
        return False
    return True


def get_admin_data_from_db():
    """
    Fetch admin data (many) from DB
    """
    db = get_db_instance()
    admin_data_list = db.admin.find_many()
    return admin_data_list


def get_admin_by_login_id(login_id):
    """
    Get admin data from Database for a given login_id
    """
    db = get_db_instance()
    admin_data = db.admin.find_first(where={"login_id": login_id})
    return admin_data


def update_admin_by_id(admin_id, hashed_passwd):
    """
    Update Admin pass by login ID
    """
    db = get_db_instance()
    admin_data = db.admin.update(where={"id": admin_id}, data={"admin_password": hashed_passwd})
    if admin_data:
        return True
    return False


def add_facilitytype_data(facilitytype_dataframe: pd.DataFrame) -> bool:
    """Adds FacilityType data in Database

    Args:
        facilitytype_data (DataFrame): facility type data

    Returns:
        bool: Returns true if DB update is success
    """

    db = get_db_instance()

    # Track if any new facility type were added
    new_facility_type_added = False

    for index in range(len(facilitytype_dataframe)):
        row = facilitytype_dataframe.iloc[index]

        # print(row['name'] + row['note'])
        try:
            # Check if the facility_type already exists based on name and note
            existing_facility_type = db.facility_type.find_first(where={"name": row["name"]})

            if not existing_facility_type:
                db.facility_type.create({"name": row["name"]})

                logger.info(f"Facility Type with '{row['name']}' added to the DB.")
                new_facility_type_added = True
        except Exception as exception:
            logger.exception(str(exception))
            raise exception

    if not new_facility_type_added:
        logger.info(f"All the facility types are already present in the DB.\nNo new facility types were added.")
        return False
    return True


def add_customer_data(customer_dataframe: pd.DataFrame) -> bool:
    """Adds customer data in Database

    Args:
        customer_data (DataFrame): customer data

    Returns:
        bool: Returns true if DB update is success
    """

    db = get_db_instance()

    # Track if any new customers were added
    new_customers_added = False

    # Returns the list of admin objects
    existing_admins = db.admin.find_many()

    for index in range(len(customer_dataframe)):
        row = customer_dataframe.iloc[index]

        admin_id_for_customer = None
        for admin in existing_admins:
            if admin.login_id == row["admin_login_id"]:
                admin_id_for_customer = admin.id
                break

        if admin_id_for_customer is None:
            logger.error(f"admin_id for {row['customer_name']} customer is incorrect.")
            return False
        try:
            if pd.isna(row["application_id"]):
                application_id = ""
            else:
                application_id = encrypt_data(row["application_id"])

            if pd.isna(row["client_id"]):
                client_id = ""
            else:
                client_id = encrypt_data(row["client_id"])

            if pd.isna(row["client_secret"]):
                client_secret = ""
            else:
                client_secret = encrypt_data(row["client_secret"])

            # Check if the customer already exists based on customer_name only
            existing_customer = db.customer.find_first(where={"customer_name": row["customer_name"]})

            # Initialize values
            auth_url = ""
            base_url = ""

            # Check and assign values from the row
            if "auth_url" in row and not is_nan(row["auth_url"]):
                auth_url = row["auth_url"]
            if "base_url" in row and not is_nan(row["base_url"]):
                base_url = row["base_url"]

            if not existing_customer:
                db.customer.create(
                    {
                        "customer_uuid": str(uuid.uuid4()),
                        "admin_id": admin_id_for_customer,
                        "customer_name": row["customer_name"],
                        "auth_url": auth_url,
                        "base_url": base_url,
                        "client_id": client_id,
                        "client_secret": client_secret,
                        "application_id": application_id,
                    }
                )
                logger.info(f"Customer '{row['customer_name']}' added to the DB.")
                new_customers_added = True

        except Exception as exception:
            logger.exception(str(exception))
            raise exception
    if not new_customers_added:
        logger.info(f"All the customers are already present in the DB.\nNo new customers were added.")
        return False

    return True


def add_devicetype_data(devicetype_dataframe: pd.DataFrame) -> bool:
    """Adds DeviceType data in Database

    Args:
        devicetype_data (DataFrame): device type data

    Returns:
        bool: Returns true if DB update is success
    """

    db = get_db_instance()

    # Track if any new device types were added
    new_device_type_added = False

    # Retrieve the list of customer objects
    existing_customers = db.customer.find_many()

    for index in range(len(devicetype_dataframe)):
        row = devicetype_dataframe.iloc[index]

        # print(row['name'] + row['note'] + row['sample_image_path'] + row['customer_name'])

        customer_uuid_for_devicetype = None
        for customer in existing_customers:
            if customer.customer_name == row["customer_name"]:
                customer_uuid_for_devicetype = customer.customer_uuid
                break

        if customer_uuid_for_devicetype is None:
            logger.error(f"customer uuid could not be loaded for DeviceType: {row['name']}")
            continue

        binary_data = None
        with open(row["sample_image_path"], "rb") as image_file:
            # Read the binary data
            binary_data = image_file.read()

        if binary_data is None:
            logger.error(f"image could not be loaded for DeviceType: {row['name']}")
            continue

        sample_image_b64 = image_to_base64(row["sample_image_path"])

        try:

            # Check if the device type already exists based on device type name and note.
            existing_device_type = db.device_type.find_first(where={"name": row["name"]})

            if not existing_device_type:
                db.device_type.create({"name": row["name"], "sample_image_blob": sample_image_b64})

                logger.info(f"Device Type '{row['name']}' added to the DB.")
                new_device_type_added = True
        except Exception as exception:
            logger.exception(str(exception))
            raise exception

    if not new_device_type_added:
        logger.info(f"All the Device types are already present in the DB.\nNo new device types were added.")
        return False
    return True


def add_facility_data(facility_dataframe: pd.DataFrame) -> bool:
    """Adds facility data in Database

    Args:
        facility_data (DataFrame): facility data

    Returns:
        bool: Returns true if DB update is success
    """

    db = get_db_instance()

    # Track if any new facility were added
    new_facility_added = False

    # Retrieve the list of customer objects
    existing_customers = db.customer.find_many()

    # Retrieve the list of facilitytype objects
    existing_facilitytypes = db.facility_type.find_many()

    for index in range(len(facility_dataframe)):
        row = facility_dataframe.iloc[index]

        # print(row['customer_name'] + row['prefecture'] +
        #       row['municipality'] + row['facility_name'] + row['effective_start_jst'] +
        #       row['effective_end_jst'] + row['facility_type'])

        customer_id_for_facility = None
        for customer in existing_customers:
            if customer.customer_name == row["customer_name"]:
                customer_id_for_facility = customer.id
                break

        if customer_id_for_facility is None:
            logger.error(f"customer_id for {row['facility_name']} facility is incorrect.")
            return False

        facilitytype_id_for_facility = None
        for facilitytype in existing_facilitytypes:
            if facilitytype.name == row["facility_type"]:
                facilitytype_id_for_facility = facilitytype.id
                break

        if facilitytype_id_for_facility is None:
            logger.error(f"facilitytype_id for {row['facility_name']} facility is incorrect.")
            return False

        effective_start_jst = datetime.strptime(row["effective_start_jst"], "%Y-%m-%dT%H:%M:%S%z")
        effective_end_jst = datetime.strptime(row["effective_end_jst"], "%Y-%m-%dT%H:%M:%S%z")

        try:

            # Check if the facility already exists based on facility_name, customer_id, prefecture and municipality.
            existing_facility = db.facility.find_first(where={"facility_name": row["facility_name"], 
                                                              "customer_id": customer.id,
                                                              "prefecture": row["prefecture"],
                                                              "municipality": row["municipality"]})

            if not existing_facility:
                db.facility.create(
                    {
                        "customer_id": customer_id_for_facility,
                        "prefecture": row["prefecture"],
                        "municipality": row["municipality"],
                        "effective_start_utc": effective_start_jst - timedelta(hours=9),
                        "effective_end_utc": effective_end_jst - timedelta(hours=9),
                        "facility_name": row["facility_name"],
                        "facility_type_id": facilitytype_id_for_facility,
                    }
                )
                logger.info(f"Facility '{row['facility_name']}' added to the DB.")
                new_facility_added = True

        except Exception as exception:
            logger.exception(str(exception))
            raise exception

    if not new_facility_added:
        logger.info(f"All the facilities are already present in the DB.\nNo new facilities were added.")
        return False
    return True


def add_device_data(device_dataframe: pd.DataFrame) -> bool:
    """Adds device data in Database

    Args:
        device_data (DataFrame): device data

    Returns:
        bool: Returns true if DB update is success
    """

    db = get_db_instance()

    # Track if any new devices were added
    new_devices_added = False

    # Retrieve the list of facility objects
    existing_facilities = db.facility.find_many()

    # Retrieve the list of devicetype objects
    existing_devicetypes = db.device_type.find_many()

    # Retrieve the list of customer objects
    existing_customers = db.customer.find_many()

    for index in range(len(device_dataframe)):
        row = device_dataframe.iloc[index]

        # print(row['device_name'] + row['device_id'] + row['facility_name'] +
        #       row['device_type_name'])

        # Look up customer_id based on customer_name from the row
        for customer in existing_customers:
            if customer.customer_name == row["customer_name"]:
                customer_id_for_row = customer.id
                break

        facility_id_for_device = None
        for facility in existing_facilities:
            if (facility.facility_name == row["facility_name"] and
                facility.customer_id == customer_id_for_row and
                facility.prefecture == row["facility_prefecture"] and
                facility.municipality == row["facility_municipality"]):
                facility_id_for_device = facility.id
                break

        if facility_id_for_device is None:
            logger.error(f"facility_id for {row['device_name']} device is incorrect.")
            return False

        devicetype_id_for_device = None
        for devicetype in existing_devicetypes:
            if devicetype.name == row["device_type_name"]:
                devicetype_id_for_device = devicetype.id
                break

        if devicetype_id_for_device is None:
            logger.error(f"devicetype_id for {row['device_name']} device is incorrect.")
            return False

        try:
            # Check if the customer already exists based on device_name only
            existing_device = db.device.find_first(where={"device_name": row["device_name"]})

            if not existing_device:
                db.device.create(
                    {
                        "device_id": row["device_id"],
                        "device_name": row["device_name"],
                        "facility_id": facility_id_for_device,
                        "device_type_id": devicetype_id_for_device,
                    }
                )

                logger.info(f"Device '{row['device_name']}' added to the DB.")
                new_devices_added = True

        except Exception as exception:
            logger.exception(str(exception))
            raise exception

    if not new_devices_added:
        logger.info(f"All the devices are already present in the DB.\nNo new devices were added.")
        return False
    return True


async def clear_all_data() -> bool:
    """Clears All table data from database if tables exist.

    Returns:
        bool: True if success otherwise False
    """
    db = get_db_instance()

    try:
        # List of tables to clear
        tables = ["review", "device", "device_type", "facility", "facility_type", "customer", "admin"]

        for table in tables:
            try:
                model = getattr(db, table)
                model.delete_many()
                logger.info(f"Cleared data from {table}.")
            except AttributeError:
                # Handle case where the table does not exist
                logger.exception(f"Table {table} does not exist, skipping.")
            except errors.PrismaError as e:
                # Handle Prisma errors
                logger.exception(f"Failed to clear data from {table}. Error: {e}")
                return False

    except errors.PrismaError as e:
        logger.exception(f"Clear DB Failed {str(e)}")
        return False

    return True
