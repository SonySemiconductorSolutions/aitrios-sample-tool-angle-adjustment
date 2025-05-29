# ------------------------------------------------------------------------
# Copyright 2024, 2025 Sony Semiconductor Solutions Corp. All rights reserved.

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
from src.config import SUPPORTED_PREFECTURES_LIST
from src.service.aitrios_service import verify_customer_credentials
from src.utils.data_validator_util import (
    is_nan,
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
    ADMIN_CRITERIA_03: Verify pass has valid characters
                          a. AlphaNumeric Characters Only\n
                          b. length limit between 1-255 characters\n
                          c. Special Characters allowed are Underscore '_' and Hyphen '-'\n
                          d. No space allowed

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
            f"Admin login ID should contain only English AlphaNumeric characters without Space and Japanese Characters except 。"
            f"Special characters allowed are Underscore (_), Hyphen(-) without at start or end."
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
            f"Admin password should contain only Alpha Numeric Characters and Special Characters\n"
            f"The password length should be 8-255 characters.\n"
            f"Password should be combination of any 3 categories:\n"
            f"1. Lowercase (a-z)\n"
            f"2. Uppercase (A-Z)\n"
            f"3. Digits (0-9)\n"
            f"4. Special Characters ('_', '-', '!', '$', '#', '%', '@').\n"
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
    CUSTOMER_CRITERIA_04: Verify that the customer name is unique for given admin login id
    CUSTOMER_CRITERIA_05: Validate customer credentials for each row

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
            logger.error(f"Row {adjusted_index}: Invalid customer name in customer: '{row['customer_name']}'")
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

    # CUSTOMER_CRITERIA_04
    are_customer_unique = cust_dataframe.duplicated(subset=["customer_name", "admin_login_id"], keep=False)
    if are_customer_unique.any():
        duplicated_customers = cust_dataframe[are_customer_unique]
        logger.error(f"Some customer names are not unique for the given admin login ID:")
        for index, row in duplicated_customers.iterrows():
            adjusted_index = index + 2
            logger.error(f"\nError occurred in customer")
            logger.error(
                f"\nRow {adjusted_index}: Customer name '{row['customer_name']}' is not unique for admin login ID '{row['admin_login_id']}'."
            )
        sys.exit(1)

    # CUSTOMER_CRITERIA_05
    for index, row in cust_dataframe.iterrows():
        logger.info(f"\nVerifying customer credentials for customer {row['customer_name']}. This may take some time.")
        customer_data = {
            "customer_name": row["customer_name"] if not is_nan(row["customer_name"]) else "",
            "auth_url": row["auth_url"] if not is_nan(row["auth_url"]) else "",
            "base_url": row["base_url"] if not is_nan(row["base_url"]) else "",
            "client_id": row["client_id"] if not is_nan(row["client_id"]) else "",
            "client_secret": row["client_secret"] if not is_nan(row["client_secret"]) else "",
            "application_id": row["application_id"] if not is_nan(row["application_id"]) else "",
        }

        try:
            if not verify_customer_credentials(customer_data):
                adjusted_index = index + 2
                logger.error(f"\nError occurred in customer")
                logger.error(
                    f"Row {adjusted_index}: Invalid customer credentials for customer {row['customer_name']}, please verify the customer sheet"
                )
                sys.exit(1)
        except Exception:
            adjusted_index = index + 2
            logger.error(
                f"Row {adjusted_index}: Error while validating customer credentials for the customer {customer_data['customer_name']}, please verify the customer sheet"
            )
            sys.exit(1)

    return {"is_valid": True, "customer_data": cust_dataframe}


def verify_device_type_data(csv_file_path: str, valid_customer_list: list, valid_admin_list: list):
    """Validates the device type data by Sier in csv

    DEVICE_TYPE_CRITERIA_01: Verify all fields are present for all rows
    DEVICE_TYPE_CRITERIA_02: Verify device type name is in valid format
    DEVICE_TYPE_CRITERIA_03: Verify sample_image_path is valid
    DEVICE_TYPE_CRITERIA_04: Verify the customer exists or not
    DEVICE_TYPE_CRITERIA_05: Verify the admin login id is present in admin data
    DEVICE_TYPE_CRITERIA_06: Verify that the device type name is unique for given admin login id

    Returns:
        bool: True if device type data is valid, False otherwise.
    """
    # Read the csv
    devicetype_dataframe = pd.read_csv(csv_file_path)

    logger.info(f"-----------------------------------------------------------")

    # DEVICE_TYPE_CRITERIA_01
    # Check if any row has null values for any column and also for check if the header matches the criteria
    expected_headers = ["name", "sample_image_path", "customer_name", "admin_login_id"]

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
            logger.error("\nError occurred in device_type")
            logger.error(f"Row {adjusted_index}: Empty field: {field}")
            sys.exit(1)

    # DEVICE_TYPE_CRITERIA_02
    are_names_valid = devicetype_dataframe["name"].apply(validate_name)
    if not are_names_valid.all():
        invalid_names = devicetype_dataframe[~are_names_valid]
        for index, row in invalid_names.iterrows():
            adjusted_index = index + 2
            logger.error("\nError occurred in device_type")
            logger.error(f"\nRow {adjusted_index}: Invalid name in device_type: '{row['name']}'")
            sys.exit(1)

    # DEVICE_TYPE_CRITERIA_03
    are_local_url_valid = devicetype_dataframe["sample_image_path"].apply(validate_local_url)
    if not are_local_url_valid.all():
        invalid_local_urls = devicetype_dataframe[~are_local_url_valid]
        logger.error("Some device type sample images are incorrect:")
        logger.error("\nError occurred in device_type")
        for index, row in invalid_local_urls.iterrows():
            adjusted_index = index + 2
            logger.error(f"Row {adjusted_index}: Invalid sample image in device_type: {row['sample_image_path']}")
        sys.exit(1)

    # DEVICE_TYPE_CRITERIA_04
    are_custnames_valid = devicetype_dataframe["customer_name"].isin(valid_customer_list)
    if not are_custnames_valid.all():
        invalid_custnames = devicetype_dataframe[~are_custnames_valid]
        logger.error("Some customer names do not match customer data:")
        for index, row in invalid_custnames.iterrows():
            adjusted_index = index + 2
            logger.error("\nError occurred in device_type")
            logger.error(
                f"\nRow {adjusted_index}: Invalid customer name in device_type: {row['customer_name']}. "
                f"Please check if customer_name '{row['customer_name']}' exists in the customer table."
            )
            sys.exit(1)

    # DEVICE_TYPE_CRITERIA_05
    are_adminid_valid = devicetype_dataframe["admin_login_id"].isin(valid_admin_list)
    if not are_adminid_valid.all():
        invalid_admin_ids = devicetype_dataframe[~are_adminid_valid]
        logger.error("Some admin login IDs do not match admin data:")
        for index, row in invalid_admin_ids.iterrows():
            adjusted_index = index + 2
            logger.error("\nError occurred in device_type")
            logger.error(
                f"\nRow {adjusted_index}: Invalid admin login ID in device_type: {row['admin_login_id']}. "
                f"Please verify that login ID '{row['admin_login_id']}' exists in the admin table."
            )
            sys.exit(1)

    # DEVICE_TYPE_CRITERIA_06
    are_device_type_unique = devicetype_dataframe.duplicated(subset=["name", "admin_login_id"], keep=False)
    if are_device_type_unique.any():
        duplicated_device_types = devicetype_dataframe[are_device_type_unique]
        logger.error("Some device type names are not unique for the given admin login ID:")
        for index, row in duplicated_device_types.iterrows():
            adjusted_index = index + 2
            logger.error("\nError occurred in device_type")
            logger.error(
                f"\nRow {adjusted_index}: Device type name '{row['name']}' is not unique for admin login ID '{row['admin_login_id']}'."
            )
        sys.exit(1)

    return {"is_valid": True, "devicetype_data": devicetype_dataframe}


def verify_facility_type_data(csv_file_path: str, valid_admin_list: list):
    """Validates the facility type data by Sier in csv

    FACILITY_TYPE_CRITERIA_01: Verify all fields are present for all rows
    FACILITY_TYPE_CRITERIA_02: Verify facility type name is in valid format
    FACILITY_TYPE_CRITERIA_03: Verify admin login id is present in admin data
    FACILITY_TYPE_CRITERIA_04: Verify that the facility type name is unique for given admin login id

    Returns:
        bool: True if facility type data is valid, False otherwise.
    """
    # Read the csv
    facilitytype_dataframe = pd.read_csv(csv_file_path)

    logger.info(f"-----------------------------------------------------------")

    # FACILITY_TYPE_CRITERIA_01
    # Check if any row has null values for any column and also for check if the header matches the criteria
    expected_headers = ["name", "admin_login_id"]

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
            logger.error(f"\nRow {adjusted_index}: Invalid facility type name in facility_type: '{row['name']}'")
            sys.exit(1)

    # FACILITY_TYPE_CRITERIA_03
    are_adminid_valid = facilitytype_dataframe["admin_login_id"].isin(valid_admin_list)
    if not are_adminid_valid.all():
        invalid_admin_ids = facilitytype_dataframe[~are_adminid_valid]
        logger.error(f"Some admin login IDs do not match admin data:")
        for index, row in invalid_admin_ids.iterrows():
            adjusted_index = index + 2
            logger.error(f"\nError occurred in facility_type")
            logger.error(
                f"\nRow {adjusted_index}: Invalid admin login ID in facility type: {row['admin_login_id']}. "
                f"Please verify that login ID '{row['admin_login_id']}' exists in the admin table."
            )
            sys.exit(1)

    # FACILITY_TYPE_CRITERIA_04
    are_facility_type_unique = facilitytype_dataframe.duplicated(subset=["name", "admin_login_id"], keep=False)
    if are_facility_type_unique.any():
        duplicated_facility_types = facilitytype_dataframe[are_facility_type_unique]
        logger.error(f"Some facility type names are not unique for the given admin login ID:")
        for index, row in duplicated_facility_types.iterrows():
            adjusted_index = index + 2
            logger.error(f"\nError occurred in facility_type")
            logger.error(
                f"\nRow {adjusted_index}: Facility type name '{row['name']}' is not unique for admin login ID '{row['admin_login_id']}'."
            )
        sys.exit(1)

    return {"is_valid": True, "facilitytype_data": facilitytype_dataframe}


def verify_facility_data(
    csv_file_path: str, valid_customer_list: list, valid_facilitytype_list: list, valid_admin_list: list
):
    """Validates the facility data by Sier in csv

    FACILITY_CRITERIA_01: Verify all fields are present for all rows
    FACILITY_CRITERIA_02: Verify facility name is in valid format
    FACILITY_CRITERIA_03: Verify customer_id is valid and existing or not
    FACILITY_CRITERIA_04: Verify effective start date is valid date and in future
    FACILITY_CRITERIA_05: Verify effective end is valid date and in future
    FACILITY_CRITERIA_06: Verify facility type is valid and existing or not
    FACILITY_CRITERIA_07: Verify prefecture is in valid format and from supported list
    FACILITY_CRITERIA_08: Verify municipality is in valid format
    FACILITY_CRITERIA_09: Verify facility, prefecture and municipality combination is unique
    FACILITY_CRITERIA_10: Verify admin login id is present in admin data

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
            logger.error(f"\nRow {adjusted_index}: Invalid facility name in facility: '{row['facility_name']}'")
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
    are_start_dates_valid = facility_dataframe["effective_start_jst"].apply(validate_date)
    if not are_start_dates_valid.all():
        invalid_start_dates = facility_dataframe[~are_start_dates_valid]
        logger.error("Some facility effective start dates are incorrectly formatted:")
        for index, row in invalid_start_dates.iterrows():
            adjusted_index = index + 2
            logger.error(
                f"Row {adjusted_index}: Invalid effective start date in facility: {row['effective_start_jst']}"
            )
            sys.exit(1)

    # FACILITY_CRITERIA_05
    are_end_dates_valid = facility_dataframe["effective_end_jst"].apply(lambda x: validate_date(x, True))
    if not are_end_dates_valid.all():
        invalid_end_dates = facility_dataframe[~are_end_dates_valid]
        logger.error(f"Some facility effective end dates are incorrect:")
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

    # FACILITY_CRITERIA_07
    are_prefectures_format_valid = facility_dataframe["prefecture"].apply(validate_name)
    if not are_prefectures_format_valid.all():
        invalid_prefectures = facility_dataframe[~are_prefectures_format_valid]
        logger.error(f"Some facility prefectures are incorrect:")
        for index, row in invalid_prefectures.iterrows():
            adjusted_index = index + 2
            logger.error(f"\nError occurred in facility")
            logger.error(f"\nRow {adjusted_index}: Invalid facility prefecture in facility: '{row['prefecture']}'")
            sys.exit(1)

    are_prefectures_supported = facility_dataframe["prefecture"].isin(SUPPORTED_PREFECTURES_LIST)
    if not are_prefectures_supported.all():
        not_supported_prefectures = facility_dataframe[~are_prefectures_supported]
        logger.error(f"Some facility prefectures are not supported:")
        logger.error(f"Supported prefectures are:" + str(SUPPORTED_PREFECTURES_LIST))
        for index, row in not_supported_prefectures.iterrows():
            adjusted_index = index + 2
            logger.error(f"\nError occurred in facility")
            logger.error(f"\nRow {adjusted_index}: Unsupported prefecture in facility: '{row['prefecture']}'")
            sys.exit(1)

    # FACILITY_CRITERIA_08
    are_municipalities_format_valid = facility_dataframe["municipality"].apply(validate_name)
    if not are_municipalities_format_valid.all():
        invalid_municipalities = facility_dataframe[~are_municipalities_format_valid]
        logger.error(f"Some facility municipalities are incorrect:")
        for index, row in invalid_municipalities.iterrows():
            adjusted_index = index + 2
            logger.error(f"\nError occurred in facility")
            logger.error(f"\nRow {adjusted_index}: Invalid facility municipality in facility: '{row['municipality']}'")
            sys.exit(1)

    # FACILITY_CRITERIA_09
    facility_dataframe["facility_details"] = (
        facility_dataframe["customer_name"]
        + " "
        + facility_dataframe["facility_name"]
        + " "
        + facility_dataframe["prefecture"]
        + " "
        + facility_dataframe["municipality"]
    )
    are_facility_details_unique = facility_dataframe["facility_details"].duplicated()
    if are_facility_details_unique.any():
        duplicated_facility_details = facility_dataframe[are_facility_details_unique]
        logger.error(f"Some facility names, prefectures and municipalities are not unique:")
        for index, row in duplicated_facility_details.iterrows():
            adjusted_index = index + 2
            logger.error(f"\nError occurred in facility")
            logger.error(
                f"\nRow {adjusted_index}: Customer Name, Facility name, prefecture and municipality combination is not unique in facility: '{row['customer_name']}', '{row['facility_name']}', '{row['prefecture']}', '{row['municipality']}'"
            )
            sys.exit(1)

    # FACILITY_CRITERIA_10
    are_adminid_valid = facility_dataframe["admin_login_id"].isin(valid_admin_list)
    if not are_adminid_valid.all():
        invalid_admin_ids = facility_dataframe[~are_adminid_valid]
        logger.error(f"Some admin login IDs do not match admin data:")
        for index, row in invalid_admin_ids.iterrows():
            adjusted_index = index + 2
            logger.error(f"\nError occurred in facility")
            logger.error(
                f"\nRow {adjusted_index}: Invalid admin login ID in facility: {row['admin_login_id']}. "
                f"Please verify that login ID '{row['admin_login_id']}' exists in the admin table."
            )
            sys.exit(1)

    return {"is_valid": True, "facility_data": facility_dataframe}


def verify_device_data(
    csv_file_path: str,
    valid_customer_list: list,
    valid_facility_dataframe: pd.DataFrame,
    valid_devicetype_list: list,
    valid_admin_list: list,
):
    """Validates the device data by Sier in csv

    DEVICE_CRITERIA_01: Verify all fields are present for all rows
    DEVICE_CRITERIA_02: Verify device name is in valid format
    DEVICE_CRITERIA_03: Verify facility name existing or not
    DEVICE_CRITERIA_04: Verify device type existing or not
    DEVICE_CRITERIA_05: Verify customer name existing or not
    DEVICE_CRITERIA_06: Verify facility details are valid, verify the facility_municipality and facility_prefecture
                        are present in valid_facility_dataframe
    DEVICE_CRITERIA_07: Verify admin login id is present in admin data

    Returns:
        bool: True if device type data is valid, False otherwise.
    """
    # Read the csv
    device_dataframe = pd.read_csv(csv_file_path)

    # logger.error(device_dataframe)
    logger.info(f"-----------------------------------------------------------")

    # DEVICE_CRITERIA_01
    # Check if any row has null values for any column and also for check if the header matches the criteria
    expected_headers = [
        "device_name",
        "device_id",
        "customer_name",
        "facility_name",
        "device_type_name",
        "facility_prefecture",
        "facility_municipality",
        "admin_login_id",
    ]

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
            logger.error(f"\nRow {adjusted_index}: Invalid device name in device: '{row['device_name']}'")
            sys.exit(1)

    # DEVICE_CRITERIA_03
    are_facility_valid = device_dataframe["facility_name"].isin(list(valid_facility_dataframe["facility_name"]))
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

    # DEVICE_CRITERIA_06
    # Check if the combination of customer_name, facility_name, prefecture, municipality exists in valid_facility_dataframe
    device_column_data = device_dataframe[
        ["customer_name", "facility_name", "facility_prefecture", "facility_municipality"]
    ]
    facility_column_data = valid_facility_dataframe[["customer_name", "facility_name", "prefecture", "municipality"]]

    # Build a set of valid facility tuples for fast lookup
    facility_tuples = set(tuple(row) for row in facility_column_data.values)

    # Find device rows whose facility combination does not exist in facility_tuples
    invalid_rows = []
    for idx, row in device_column_data.iterrows():
        if tuple(row) not in facility_tuples:
            invalid_rows.append(idx)

    if invalid_rows:
        logger.error(f"Some facility details are not valid:")
        for index in invalid_rows:
            row = device_column_data.loc[index]
            adjusted_index = index + 2
            logger.error(f"\nError occurred in device")
            logger.error(
                f"\nRow {adjusted_index}: Invalid facility combination in device: customer_name='{row['customer_name']}', facility_name='{row['facility_name']}', facility_prefecture='{row['facility_prefecture']}', facility_municipality='{row['facility_municipality']}'."
            )
        sys.exit(1)

    # DEVICE_CRITERIA_07
    are_adminid_valid = device_dataframe["admin_login_id"].isin(valid_admin_list)
    if not are_adminid_valid.all():
        invalid_admin_ids = device_dataframe[~are_adminid_valid]
        logger.error(f"Some admin login IDs do not match admin data:")
        for index, row in invalid_admin_ids.iterrows():
            adjusted_index = index + 2
            logger.error(f"\nError occurred in device")
            logger.error(
                f"\nRow {adjusted_index}: Invalid admin login ID in device: {row['admin_login_id']}. "
                f"Please verify that login ID '{row['admin_login_id']}' exists in the admin table."
            )
            sys.exit(1)

    return {"is_valid": True, "device_data": device_dataframe}
