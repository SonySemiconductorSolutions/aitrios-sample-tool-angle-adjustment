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

"Parser for CSV files"

import sys

import pandas as pd
from src.utils.data_validator_util import (
    validate_date,
    validate_local_url,
    validate_loginid,
    validate_name,
    validate_password,
)
from src.utils.logger import get_json_logger

logger = get_json_logger()

def verify_admin_data(csv_file_path: str):
    """Validates the admin data by Sier in csv.

    ADMIN_CRITERIA_01: Verify login id, name, pass all fields are present for all rows
    ADMIN_CRITERIA_02: Verify login_id has AlphaNumeric Characters only without space
    ADMIN_CRITERIA_03: Verify pass has\n
                          a. AlphaNumeric Characters Only\n
                          b. length more than 8 characters\n
                          c. No space allowed

    Returns:
        bool: True if admin data is valid, False otherwise.
    """
    # Read the csv
    dataframe = pd.read_csv(csv_file_path)

    # ADMIN_CRITERIA_01
    # Check if any row has null values for any column and also for check if the header matches the criteria
    # Define the expected headers
    expected_headers = ["login_id", "admin_password"]

    # Check if the headers match
    actual_headers = list(dataframe.columns)
    if actual_headers != expected_headers:
        for expected, actual in zip(expected_headers, actual_headers):
            if expected != actual:
                logger.error(f"\nError occurred in admin")
                logger.error(f"Header column mismatch in admin: Expected '{expected}' but got '{actual}'")
                sys.exit(1)
    else:
        logger.info(f"Admin Header validation passed.")

    if dataframe.empty:
        logger.error(f"No Admin Records found")
        sys.exit(1)

    # Find all rows with null values
    all_null_rows = dataframe[dataframe.isnull().any(axis=1)].copy()

    # Create a function to identify which columns are null in each row

    def find_null_fields(row):
        return row[row.isnull()].index.tolist()

    # Apply the function to each row and store the result in a new column using .loc
    all_null_rows.loc[:, "null_fields"] = all_null_rows.apply(find_null_fields, axis=1)

    # Display the rows with the columns that have null values
    for index, row in all_null_rows.iterrows():
        adjusted_index = index + 2
        null_fields = row["null_fields"]
        for field in null_fields:
            logger.error(f"\nError occurred in admin")
            logger.error(f"Row {adjusted_index}: Empty field: {field}")
            sys.exit(1)

    logger.info(f"-----------------------------------------------------------")

    # ADMIN_CRITERIA_02
    are_loginid_valid = dataframe["login_id"].apply(validate_loginid)
    # Check if any value is false in the series
    if not are_loginid_valid.all():
        invalid_login_ids = dataframe[~are_loginid_valid]
        logger.error(
            f"Admin login ID should contain only Alpha Numeric Characters. "
            f"Special characters allowed are Underscore (_), Hyphen(-), At (@), and Dot (.)"
        )
        logger.error(f"Following admin login IDs are incorrect:")
        for index, row in invalid_login_ids.iterrows():
            adjusted_index = index + 2
            logger.error(f"Row {adjusted_index}: Invalid login ID: {row['login_id']}")
        sys.exit(1)


    # ADMIN_CRITERIA_03
    are_password_valid = dataframe["admin_password"].apply(validate_password)
    if not are_password_valid.all():
        invalid_passwords = dataframe[~are_password_valid]
        logger.error(
            f"Admin password should contain only Alpha Numeric Characters. "
            f"Special characters allowed are Underscore (_).\n"
            f"The password length should be more than 8."
        )
        logger.error(f"Following admin passwords are incorrect:")
        for index, row in invalid_passwords.iterrows():
            adjusted_index = index + 2
            logger.error(f"Row {adjusted_index}: Invalid admin pass for login ID: {row['login_id']}")
        sys.exit(1)

    return {"is_valid": True, "admin_data": dataframe}


def verify_customer_data(csv_file_path: str, valid_admin_list: list):
    """Validates the customer data by Sier in csv.

    CUSTOMER_CRITERIA_01: Verify values are present for all columns
    CUSTOMER_CRITERIA_02: Verify customer name AlphaNumeric Characters only
    CUSTOMER_CRITERIA_03: Verify admin login id is present in admin data
    CUSTOMER_CRITERIA_04: Verify auth_url and base_url are valid URLs
    CUSTOMER_CRITERIA_05: Verify client id is in valid format
    CUSTOMER_CRITERIA_06: Verify client secret is in valid format
    CUSTOMER_CRITERIA_07: Verify application ID is in valid format

    Returns:
        bool: True if customer data is valid, False otherwise.
    """
    # Read the csv
    cust_dataframe = pd.read_csv(csv_file_path)

    logger.info(f"-----------------------------------------------------------")

    # CUSTOMER_CRITERIA_01
    # Check if any row has null values for any column and also for check if the header matches the criteria
    expected_headers = [
        "customer_name",
        "admin_login_id",
        "auth_url",
        "base_url",
        "client_id",
        "client_secret",
        "application_id",
    ]

    # Check if the headers match
    actual_headers = list(cust_dataframe.columns)
    if actual_headers != expected_headers:
        for expected, actual in zip(expected_headers, actual_headers):
            if expected != actual:
                logger.error(f"\nError occurred in customer")
                logger.error(f"Header column mismatch in customer: Expected '{expected}', but got '{actual}'")
                sys.exit(1)
    else:
        logger.info(f"Customer Header validation passed.")

    if cust_dataframe.empty:
        logger.error(f"No Customer Records found")
        sys.exit(1)

    # Find all rows with null values
    all_null_rows = cust_dataframe[cust_dataframe.isnull().any(axis=1)].copy()

    # Create a function to identify which columns are null in each row

    def find_null_fields(row):
        return row[row.isnull()].index.tolist()

    # Apply the function to each row and store the result in a new column using .loc
    all_null_rows.loc[:, "null_fields"] = all_null_rows.apply(find_null_fields, axis=1)

    # Display the rows with the columns that have null values
    for index, row in all_null_rows.iterrows():
        adjusted_index = index + 2
        null_fields = row["null_fields"]

        ignore_empty_fields = {"application_id", "auth_url", "base_url", "client_id", "client_secret"}
        for field in null_fields:
            if field not in ignore_empty_fields:
                logger.error(f"\nError occurred in customer")
                logger.error(f"Row {adjusted_index}: Empty field: {field}")
                sys.exit(1)

    # CUSTOMER_CRITERIA_02
    are_names_valid = cust_dataframe["customer_name"].apply(validate_name)
    if not are_names_valid.all():
        invalid_names = cust_dataframe[~are_names_valid]
        for index, row in invalid_names.iterrows():
            adjusted_index = index + 2
            logger.error(f"\nError occurred in customer")
            logger.error(f"Row {adjusted_index}: Invalid customer name in customer: {row['customer_name']}")
            sys.exit(1)

    # CUSTOMER_CRITERIA_03
    are_adminid_valid = cust_dataframe["admin_login_id"].isin(valid_admin_list)
    if not are_adminid_valid.all():
        invalid_admin_ids = cust_dataframe[~are_adminid_valid]
        for index, row in invalid_admin_ids.iterrows():
            adjusted_index = index + 2
            logger.error(f"\nError occurred in customer")
            logger.error(
                f"\nRow {adjusted_index}: Invalid admin login ID in customer: {row['admin_login_id']}. "
                f"Please verify that login ID '{row['admin_login_id']}' exists in the admin table."
            )
            sys.exit(1)

    return {"is_valid": True, "customer_data": cust_dataframe}


def verify_device_type_data(csv_file_path: str, valid_customer_list: list):
    """Validates the device type data by Sier in csv

    DEVICE_TYPE_CRITERIA_01: Verify all fields are present for all rows
    DEVICE_TYPE_CRITERIA_02: Verify device type name is in valid format
    DEVICE_TYPE_CRITERIA_03: Verify sample_image_path is valid
    DEVICE_TYPE_CRITERIA_04: Verify the customer exists or not

    Returns:
        bool: True if device type data is valid, False otherwise.
    """
    # Read the csv
    devicetype_dataframe = pd.read_csv(csv_file_path)

    logger.info(f"-----------------------------------------------------------")

    # DEVICE_TYPE_CRITERIA_01
    # Check if any row has null values for any column and also for check if the header matches the criteria
    expected_headers = ["name", "sample_image_path", "customer_name"]

    # Check if the headers match
    actual_headers = list(devicetype_dataframe.columns)
    if actual_headers != expected_headers:
        for expected, actual in zip(expected_headers, actual_headers):
            if expected != actual:
                logger.error(f"\nError occurred in device_type")
                logger.error(f"Header column mismatch in device type: Expected '{expected}', but got '{actual}'")
                sys.exit(1)
    else:
        logger.info(f"Device Type Header validation passed.")

    if devicetype_dataframe.empty:
        logger.error(f"No Device Type Records found")
        sys.exit(1)

    # Find all rows with null values
    all_null_rows = devicetype_dataframe[devicetype_dataframe.isnull().any(axis=1)].copy()

    # Create a function to identify which columns are null in each row

    def find_null_fields(row):
        return row[row.isnull()].index.tolist()

    # Apply the function to each row and store the result in a new column using .loc
    all_null_rows.loc[:, "null_fields"] = all_null_rows.apply(find_null_fields, axis=1)

    # Display the rows with the columns that have null values
    for index, row in all_null_rows.iterrows():
        adjusted_index = index + 2
        null_fields = row["null_fields"]
        for field in null_fields:
            logger.error(f"\nError occurred in device_type")
            logger.error(f"Row {adjusted_index}: Empty field: {field}")
            sys.exit(1)

    # DEVICE_TYPE_CRITERIA_02
    are_names_valid = devicetype_dataframe["name"].apply(validate_name)
    if not are_names_valid.all():
        invalid_names = devicetype_dataframe[~are_names_valid]
        for index, row in invalid_names.iterrows():
            adjusted_index = index + 2
            logger.error(f"\nError occurred in device_type")
            logger.error(f"\nRow {adjusted_index}: Invalid device type name in device_type: {row['name']}")
            sys.exit(1)

    # DEVICE_TYPE_CRITERIA_03
    are_local_url_valid = devicetype_dataframe["sample_image_path"].apply(validate_local_url)
    if not are_local_url_valid.all():
        invalid_local_urls = devicetype_dataframe[~are_local_url_valid]
        logger.error(f"Some device type local URLs are incorrect:")
        for index, row in invalid_local_urls.iterrows():
            adjusted_index = index + 2
            logger.error(f"\nError occurred in device_type")
            logger.error(f"\nRow {adjusted_index}: Invalid device type local URL in device_type: {row['sample_image_path']}")
            sys.exit(1)

    # DEVICE_TYPE_CRITERIA_04
    are_custnames_valid = devicetype_dataframe["customer_name"].isin(valid_customer_list)
    if not are_custnames_valid.all():
        invalid_custnames = devicetype_dataframe[~are_custnames_valid]
        logger.error(f"Some customer names do not match customer data:")
        for index, row in invalid_custnames.iterrows():
            adjusted_index = index + 2
            logger.error(f"\nError occurred in device_type")
            logger.error(
                f"\nRow {adjusted_index}: Invalid customer name in device_type: {row['customer_name']}. "
                f"Please check if customer_name '{row['customer_name']}' exists in the customer table."
            )
            sys.exit(1)

    return {"is_valid": True, "devicetype_data": devicetype_dataframe}


def verify_facility_type_data(csv_file_path: str):
    """Validates the facility type data by Sier in csv

    FACILITY_TYPE_CRITERIA_01: Verify all fields are present for all rows
    FACILITY_TYPE_CRITERIA_02: Verify facility type name is in valid format

    Returns:
        bool: True if facility type data is valid, False otherwise.
    """
    # Read the csv
    facilitytype_dataframe = pd.read_csv(csv_file_path)

    logger.info(f"-----------------------------------------------------------")

    # FACILITY_TYPE_CRITERIA_01
    # Check if any row has null values for any column and also for check if the header matches the criteria
    expected_headers = ["name"]

    # Check if the headers match
    actual_headers = list(facilitytype_dataframe.columns)
    if actual_headers != expected_headers:
        for expected, actual in zip(expected_headers, actual_headers):
            if expected != actual:
                logger.error(f"\nError occurred in facility_type")
                logger.error(f"\nHeader column mismatch in facility type: Expected '{expected}', but got '{actual}'")
                sys.exit(1)
    else:
        logger.info(f"Facility Type Header validation passed.")

    if facilitytype_dataframe.empty:
        logger.error("No Facility Type Records found")
        sys.exit(1)

    # Find all rows with null values
    all_null_rows = facilitytype_dataframe[facilitytype_dataframe.isnull().any(axis=1)].copy()

    # Create a function to identify which columns are null in each row

    def find_null_fields(row):
        return row[row.isnull()].index.tolist()

    # Apply the function to each row and store the result in a new column using .loc
    all_null_rows.loc[:, "null_fields"] = all_null_rows.apply(find_null_fields, axis=1)

    # Display the rows with the columns that have null values
    for index, row in all_null_rows.iterrows():
        adjusted_index = index + 2
        null_fields = row["null_fields"]
        for field in null_fields:
            logger.error(f"\nError occurred in facility_type")
            logger.error(f"\nRow {adjusted_index}: Empty field: {field}")
            sys.exit(1)

    # FACILITY_TYPE_CRITERIA_02
    are_names_valid = facilitytype_dataframe["name"].apply(validate_name)
    if not are_names_valid.all():
        invalid_names = facilitytype_dataframe[~are_names_valid]
        logger.error(f"Some facility type names are incorrect:")
        for index, row in invalid_names.iterrows():
            adjusted_index = index + 2
            logger.error(f"\nError occurred in facility_type")
            logger.error(f"\nRow {adjusted_index}: Invalid facility type name in facility_type: {row['name']}")
            sys.exit(1)

    return {"is_valid": True, "facilitytype_data": facilitytype_dataframe}


def verify_facility_data(csv_file_path: str, valid_customer_list: list, valid_facilitytype_list: list):
    """Validates the facility data by Sier in csv

    FACILITY_CRITERIA_01: Verify all fields are present for all rows
    FACILITY_CRITERIA_02: Verify facility name is in valid format
    FACILITY_CRITERIA_03: Verify customer_id is valid and existing or not
    FACILITY_CRITERIA_04: Verify effective start date is valid date and in future
    FACILITY_CRITERIA_05: Verify effective end is valid date and in future
    FACILITY_CRITERIA_06: Verify facility type is valid and existing or not

    Returns:
        bool: True if facility data is valid, False otherwise.
    """
    # Read the csv
    facility_dataframe = pd.read_csv(csv_file_path)

    # logger.error(facility_dataframe)
    logger.info(f"-----------------------------------------------------------")

    # FACILITY_CRITERIA_01
    # Check if any row has null values for any column and also for check if the header matches the criteria
    expected_headers = [
        "facility_name",
        "prefecture",
        "municipality",
        "effective_start_jst",
        "effective_end_jst",
        "customer_name",
        "facility_type",
    ]

    # Check if the headers match
    actual_headers = list(facility_dataframe.columns)
    if actual_headers != expected_headers:
        for expected, actual in zip(expected_headers, actual_headers):
            if expected != actual:
                logger.error(f"\nError occurred in facility")
                logger.error(f"\nHeader column mismatch in facility: Expected '{expected}', but got '{actual}'")
                sys.exit(1)
    else:
        logger.info(f"Facility Header validation passed.")

    if facility_dataframe.empty:
        logger.error(f"No Facility Records found")
        sys.exit(1)

    # Find all rows with null values
    all_null_rows = facility_dataframe[facility_dataframe.isnull().any(axis=1)].copy()

    # Create a function to identify which columns are null in each row

    def find_null_fields(row):
        return row[row.isnull()].index.tolist()

    # Apply the function to each row and store the result in a new column using .loc
    all_null_rows.loc[:, "null_fields"] = all_null_rows.apply(find_null_fields, axis=1)

    # Display the rows with the columns that have null values
    for index, row in all_null_rows.iterrows():
        adjusted_index = index + 2
        null_fields = row["null_fields"]
        for field in null_fields:
            logger.error(f"\nError occurred in facility")
            logger.error(f"\nRow {adjusted_index}: Empty field: {field}")
            sys.exit(1)

    # FACILITY_CRITERIA_02
    are_names_valid = facility_dataframe["facility_name"].apply(validate_name)
    if not are_names_valid.all():
        invalid_names = facility_dataframe[~are_names_valid]
        logger.error(f"Some facility names are incorrect:")
        for index, row in invalid_names.iterrows():
            adjusted_index = index + 2
            logger.error(f"\nError occurred in facility")
            logger.error(f"\nRow {adjusted_index}: Invalid facility name in facility: {row['facility_name']}")
            sys.exit(1)

    # FACILITY_CRITERIA_03
    are_custnames_valid = facility_dataframe["customer_name"].isin(valid_customer_list)
    if not are_custnames_valid.all():
        invalid_custnames = facility_dataframe[~are_custnames_valid]
        logger.error(f"Some customer names do not match customer data:")
        for index, row in invalid_custnames.iterrows():
            adjusted_index = index + 2
            logger.error(f"\nError occurred in facility")
            logger.error(
                f"\nRow {adjusted_index}: Invalid customer name in facility: {row['customer_name']}, so please check if customer_name: {row['customer_name']} exists in customer table"
            )
            sys.exit(1)

    # FACILITY_CRITERIA_04
    # are_start_dates_valid = facility_dataframe['effective_start_jst'].apply(
    #     validate_date)
    # if not are_start_dates_valid.all():
    #     invalid_start_dates = facility_dataframe[~are_start_dates_valid]
    #     logger.error("Some facility effective start dates are incorrectly formatted or time has passed:")
    #     for index, row in invalid_start_dates.iterrows():
    #         adjusted_index = index + 2
    #         logger.error(
    #             f"Row {adjusted_index}: Invalid effective start date in facility: {row['effective_start_jst']}")
    #         sys.exit(1)

    # FACILITY_CRITERIA_05
    are_end_dates_valid = facility_dataframe["effective_end_jst"].apply(validate_date)
    if not are_end_dates_valid.all():
        invalid_end_dates = facility_dataframe[~are_end_dates_valid]
        logger.error(f"Some facility effective end dates are incorrectly formatted or time has passed:")
        for index, row in invalid_end_dates.iterrows():
            adjusted_index = index + 2
            logger.error(f"\nError occurred in facility")
            logger.error(f"\nRow {adjusted_index}: Invalid effective end date in facility: {row['effective_end_jst']}")
            sys.exit(1)

    # FACILITY_CRITERIA_06
    are_facilitytype_valid = facility_dataframe["facility_type"].isin(valid_facilitytype_list)
    if not are_facilitytype_valid.all():
        invalid_facilitytypes = facility_dataframe[~are_facilitytype_valid]
        logger.error(f"Some facility types do not match available data:")
        for index, row in invalid_facilitytypes.iterrows():
            adjusted_index = index + 2
            logger.error(f"\nError occurred in facility")
            logger.error(
                f"\nRow {adjusted_index}: Invalid facility type in facility: {row['facility_type']}, so please check if facility_type: {row['facility_type']} exists in the facility_type table"
            )
            sys.exit(1)

    return {"is_valid": True, "facility_data": facility_dataframe}


def verify_device_data(
    csv_file_path: str, valid_customer_list: list, valid_facility_list: list, valid_devicetype_list: list
):
    """Validates the device data by Sier in csv

    DEVICE_CRITERIA_01: Verify all fields are present for all rows
    DEVICE_CRITERIA_02: Verify device name is in valid format
    DEVICE_CRITERIA_03: Verify facility name existing or not
    DEVICE_CRITERIA_04: Verify device type existing or not
    DEVICE_CRITERIA_05: Verify customer name existing or not

    Returns:
        bool: True if device type data is valid, False otherwise.
    """
    # Read the csv
    device_dataframe = pd.read_csv(csv_file_path)

    # logger.error(device_dataframe)
    logger.info(f"-----------------------------------------------------------")

    # DEVICE_CRITERIA_01
    # Check if any row has null values for any column and also for check if the header matches the criteria
    expected_headers = ["device_name", "device_id", "customer_name", "facility_name", "device_type_name"]

    # Check if the headers match
    actual_headers = list(device_dataframe.columns)
    if actual_headers != expected_headers:
        for expected, actual in zip(expected_headers, actual_headers):
            if expected != actual:
                logger.error("\nError occurred in device")
                logger.error(f"\nHeader column mismatch in device: Expected '{expected}', but got '{actual}'")
                sys.exit(1)
    else:
        logger.info(f"Device Header validation passed.")

    if device_dataframe.empty:
        logger.error("No Device Records found")
        sys.exit(1)

    # Find all rows with null values
    all_null_rows = device_dataframe[device_dataframe.isnull().any(axis=1)].copy()

    # Create a function to identify which columns are null in each row

    def find_null_fields(row):
        return row[row.isnull()].index.tolist()

    # Apply the function to each row and store the result in a new column using .loc
    all_null_rows.loc[:, "null_fields"] = all_null_rows.apply(find_null_fields, axis=1)

    # Display the rows with the columns that have null values
    for index, row in all_null_rows.iterrows():
        adjusted_index = index + 2
        null_fields = row["null_fields"]
        for field in null_fields:
            logger.error(f"\nError occurred in device")
            logger.error(f"\nRow {adjusted_index}: Empty field: {field}")
            sys.exit(1)

    # DEVICE_CRITERIA_02
    are_names_valid = device_dataframe["device_name"].apply(validate_name)
    if not are_names_valid.all():
        invalid_names = device_dataframe[~are_names_valid]
        logger.error(f"Some device names are incorrect:")
        for index, row in invalid_names.iterrows():
            adjusted_index = index + 2
            logger.error(f"\nError occurred in device")
            logger.error(f"\nRow {adjusted_index}: Invalid device name in device: {row['device_name']}")
            sys.exit(1)

    # DEVICE_CRITERIA_03
    are_facility_valid = device_dataframe["facility_name"].isin(valid_facility_list)
    if not are_facility_valid.all():
        invalid_facilities = device_dataframe[~are_facility_valid]
        logger.error(f"Some facility names do not match available data:")
        for index, row in invalid_facilities.iterrows():
            adjusted_index = index + 2
            logger.error(f"\nError occurred in device")
            logger.error(
                f"\nRow {adjusted_index}: Invalid facility name in device: {row['facility_name']}, so please check facility_name: {row['facility_name']} exists in the facility table"
            )
            sys.exit(1)

    # DEVICE_CRITERIA_04
    are_devicetype_valid = device_dataframe["device_type_name"].isin(valid_devicetype_list)
    if not are_devicetype_valid.all():
        invalid_devicetypes = device_dataframe[~are_devicetype_valid]
        logger.error(f"Some device type names do not match available data:")
        for index, row in invalid_devicetypes.iterrows():
            adjusted_index = index + 2
            logger.error(f"\nError occurred in device")
            logger.error(f"\nRow {adjusted_index}: Invalid device type name in device: {row['device_type_name']}")
            sys.exit(1)

    # DEVICE_CRITERIA_05
    are_customer_valid = device_dataframe["customer_name"].isin(valid_customer_list)
    if not are_customer_valid.all():
        invalid_customers = device_dataframe[~are_customer_valid]
        logger.error(f"Some customer names do not match available data:")
        for index, row in invalid_customers.iterrows():
            adjusted_index = index + 2
            logger.error(f"\nError occurred in device")
            logger.error(
                f"\nRow {adjusted_index}: Invalid customer name in device: {row['customer_name']}, so please check customer_name: {row['customer_name']} exists in the customer table"
            )
            sys.exit(1)

    return {"is_valid": True, "device_data": device_dataframe}
