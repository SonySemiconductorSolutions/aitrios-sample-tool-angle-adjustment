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

"""DB main"""

import os
import sys
import asyncio

from src.config import CSV_OUTPUT_DIR
from src.csv.csv_parser import check_csv_files, convert_excel_to_csv
from src.csv.csv_validator import (
    validate_password,
    verify_admin_data,
    verify_customer_data,
    verify_device_data,
    verify_device_type_data,
    verify_facility_data,
    verify_facility_type_data,
)
from src.db.data_manager import (
    add_admin_data,
    add_customer_data,
    add_device_data,
    add_devicetype_data,
    add_facility_data,
    add_facilitytype_data,
    clear_all_data,
    get_admin_by_login_id,
    get_admin_data_from_db,
    update_admin_by_id,
)
from tabulate import tabulate
from werkzeug.security import generate_password_hash

from src.utils.logger import get_json_logger

logger = get_json_logger()

# pylint: disable = line-too-long
# pylint: disable = too-many-return-statements

db_table_names = ["admin", "device_type", "facility_type", "customer", "facility", "device"]


def db_populate(excel_path: str, csv_dir_path: str):
    """Function to populate the Data from excel/csv to database"""

    csv_files_list = [name + ".csv" for name in db_table_names]

    tables_added = set()

    if excel_path is not None:
        if os.path.exists(excel_path):
            convert_excel_to_csv(excel_path, db_table_names)
        else:
            logger.error(f"Excel file doesn't exist")
            raise FileNotFoundError(f"Excel file: {excel_path} doesn't exist")
    elif csv_dir_path is not None:
        if os.path.exists(csv_dir_path):
            check_csv_files(csv_dir_path, csv_files_list)
        else:
            logger.error(f"CSV Dir doesn't exist")

    else:
        logger.error(f"provide either excel path or csv path as the data source")
        return {"is_valid": False}

    # validate csv and retrieve data

    admin_dataframe = get_admin_data_from_csv(CSV_OUTPUT_DIR + "/admin.csv")

    facilitytype_dataframe = get_facilitytype_data(CSV_OUTPUT_DIR + "/facility_type.csv")
    if "is_valid" in facilitytype_dataframe and not facilitytype_dataframe["is_valid"]:
        return facilitytype_dataframe

    customer_dataframe = get_customer_data(CSV_OUTPUT_DIR + "/customer.csv", list(admin_dataframe["login_id"]))
    if "is_valid" in customer_dataframe and not customer_dataframe["is_valid"]:
        return customer_dataframe

    devicetype_dataframe = get_devicetype_data(
        CSV_OUTPUT_DIR + "/device_type.csv", list(customer_dataframe["customer_name"])
    )
    if "is_valid" in devicetype_dataframe and not devicetype_dataframe["is_valid"]:
        return devicetype_dataframe

    facility_dataframe = get_facility_data(
        CSV_OUTPUT_DIR + "/facility.csv",
        list(customer_dataframe["customer_name"]),
        list(facilitytype_dataframe["name"]),
    )
    if "is_valid" in facility_dataframe and not facility_dataframe["is_valid"]:
        return facility_dataframe

    device_dataframe = get_device_data(
        CSV_OUTPUT_DIR + "/device.csv",
        list(customer_dataframe["customer_name"]),
        list(facility_dataframe["facility_name"]),
        list(devicetype_dataframe["name"]),
    )
    if "is_valid" in device_dataframe and not device_dataframe["is_valid"]:
        return device_dataframe

    logger.info(f"-----------------------------------------------------------")

    # populate to db

    admin_db_result = add_admin_data(admin_dataframe)
    if admin_db_result:
        logger.info(f"Admin data is successfully added in Database")
        tables_added.add("admin")

    facilitytype_db_result = add_facilitytype_data(facilitytype_dataframe)
    if facilitytype_db_result:
        logger.info(f"FacilityType data is successfully added in Database")
        tables_added.add("facility_type")

    customer_db_result = add_customer_data(customer_dataframe)
    if customer_db_result:
        logger.info(f"Customer data is successfully added in Database")
        tables_added.add("customer")

    devicetype_db_result = add_devicetype_data(devicetype_dataframe)
    if devicetype_db_result:
        logger.info(f"DeviceType data is successfully added in Database")
        tables_added.add("device_type")


    facility_db_result = add_facility_data(facility_dataframe)
    if facility_db_result:
        logger.info(f"Facility data is successfully added in Database")
        tables_added.add("facility")


    device_db_result = add_device_data(device_dataframe)
    if device_db_result:
        logger.info(f"Device data is successfully added in Database")
        tables_added.add("device")

    return {"is_valid": True}, tables_added


def get_admin_data_from_csv(admin_csv_path: str):
    """Get the Admin Data from CSV

    Args:
        admin_csv_path (str): CSV path

    Returns:
        PD.Dataframe: returns dataframe with data from CSV
    """
    admin_result = verify_admin_data(admin_csv_path)
    if not admin_result["is_valid"]:
        logger.error(f"Admin validation failed.")
        sys.exit(1)

    logger.info(f"Admin validation is Successful.")
    admin_dataframe = admin_result["admin_data"]
    logger.debug(f"Valid Admins are {list(admin_dataframe['login_id'])}")

    return admin_dataframe


def get_devicetype_data(devicetype_csv_path: str, valid_customer_list: list):
    """Get the DeviceType Data from CSV

    Args:
        devicetype_csv_path (str): CSV path

    Returns:
        PD.Dataframe: returns dataframe with data from CSV
    """

    devicetype_result = verify_device_type_data(devicetype_csv_path, valid_customer_list)

    if not devicetype_result["is_valid"]:
        logger.error(f"DeviceType validation failed.")
        return devicetype_result

    logger.info(f"DeviceType validation is Successful")

    devicetypes_dataframe = devicetype_result["devicetype_data"]
    logger.debug(f"Valid DeviceType are {list(devicetypes_dataframe['name'])}")

    return devicetypes_dataframe


def get_facilitytype_data(facilitytype_csv_path: str):
    """Get the FacilityType Data from CSV

    Args:
        facilitytype_csv_path (str): CSV path

    Returns:
        PD.Dataframe: returns dataframe with data from CSV
    """
    facilitytype_result = verify_facility_type_data(facilitytype_csv_path)
    if not facilitytype_result["is_valid"]:
        logger.error(f"FacilityType validation failed.")
        return facilitytype_result

    logger.info(f"FacilityType validation is Successful")

    facilitytypes_dataframe = facilitytype_result["facilitytype_data"]
    logger.debug(f"Valid FacilityType are {list(facilitytypes_dataframe['name'])}")

    return facilitytypes_dataframe


def get_customer_data(customer_csv_path: str, valid_admin_list: list):
    """Get the Customer Data from CSV

    Args:
        customer_csv_path (str): CSV path
        valid_admin_list (list): list of the admins

    Returns:
        PD.Dataframe: returns dataframe with data from CSV
    """

    cust_result = verify_customer_data(customer_csv_path, valid_admin_list)
    if not cust_result["is_valid"]:
        logger.error(f"Customer validation failed.")
        return cust_result

    logger.info(f"Customer validation is Successful")

    customers_dataframe = cust_result["customer_data"]
    logger.debug(f"Valid Customer are {list(customers_dataframe['customer_name'])}")

    return customers_dataframe


def get_facility_data(facility_csv_path: str, valid_customer_list: list, valid_facilitytype_list):
    """Get Facility Data from the CSV

    Args:
        facility_csv_path (str): Path of the CSV
        valid_customer_list (list): list of customers
        valid_facilitytype_list (_type_): list of facility types

    Returns:
        PD.Dataframe: returns dataframe with data from CSV
    """
    facility_result = verify_facility_data(facility_csv_path, valid_customer_list, valid_facilitytype_list)

    if not facility_result["is_valid"]:
        logger.error(f"Facility validation failed.")
        return facility_result

    logger.info(f"Facility validation is Successful")

    facility_dataframe = facility_result["facility_data"]
    logger.debug(f"Valid Facility are {list(facility_dataframe['facility_name'])}")

    return facility_dataframe


def get_device_data(
    device_csv_path: str, valid_customer_list: list, valid_facility_list: list, valid_devicetype_list: list
):
    """Get Device Data from the CSV

    Args:
        device_csv_path (str): CSV Path
        valid_customer_list (list): list of customers
        valid_facility_list (list): list of facilities
        valid_devicetype_list (list): list of device types

    Returns:
        PD.Dataframe: returns dataframe with data from CSV
    """
    device_result = verify_device_data(device_csv_path, valid_customer_list, valid_facility_list, valid_devicetype_list)

    if not device_result["is_valid"]:
        logger.error(f"Device validation failed.")
        return device_result

    logger.info(f"Device validation is Successful")

    device_dataframe = device_result["device_data"]
    logger.debug(f"Valid Device are  {list(device_dataframe['device_name'])}")

    return device_dataframe


def list_admin_data():
    """
    List admin data from DB
    """
    admin_data_list = get_admin_data_from_db()

    if not admin_data_list:
        logger.error(f"No admin Data found")

    _admin_list = []
    headers = ["login_id"]

    for admin in admin_data_list:
        temp_list = [admin.login_id]
        _admin_list.append(temp_list)

    logger.info(tabulate(_admin_list, headers=headers))


def reset_password(login_id, passwd):
    """
    Reset pass for a selected admin
    """

    if not validate_password(passwd):
        logger.error("Pass does not meet the requirements")
        return False

    admin_data = get_admin_by_login_id(login_id)
    if not admin_data:
        logger.error(f"No admin found with login ID: {login_id}")
        return False

    hashed_password = generate_password_hash(passwd)

    result = update_admin_by_id(admin_data.id, hashed_password)

    if result:
        logger.info(f"Password reset for `{admin_data.login_id}` is success !!")
        return True

    logger.error(f"Password reset for `{login_id}` is failed !!")
    return False


async def db_clear():
    """Function to clear all the records from all tables

    Returns:
        bool: True if operation is success or otherwise False.
    """
    # Added 5 max retries
    max_retries = 5
    for attempt in range(max_retries):
        try:
            # Added timeout of 60 secs
            return await asyncio.wait_for(clear_all_data(), timeout=60)
        except asyncio.TimeoutError:
            logger.error(
                f"Attempt {attempt + 1} of {max_retries} failed: DB clear operation took too long and was terminated.")
        except Exception as e:
            logger.error(
                f"Attempt {attempt + 1} of {max_retries} failed: An error occurred - {e}")
        if attempt < max_retries - 1:
            logger.info(f"Retrying... ({attempt + 2}/{max_retries})")
    return False
