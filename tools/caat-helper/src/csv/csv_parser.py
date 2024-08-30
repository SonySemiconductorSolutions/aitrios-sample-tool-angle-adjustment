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

"""CSV Parser """

import os

import pandas as pd

from src.config import CSV_OUTPUT_DIR
from src.utils.logger import get_json_logger

logger = get_json_logger()

def convert_excel_to_csv(excel_file_path: str, excel_sheet_names: list):
    """Convert Excel sheet to CSV files

    Args:
        xls_file_path (str): path of the excel file
        excel_sheet_names (list): names of the excel sheets (same as db table names)
    """

    # Read all sheets into a dictionary
    all_sheets = pd.read_excel(excel_file_path, sheet_name=None)

    # Verify all the sheets are present in excel
    for sheet_name, sheet_df in all_sheets.items():
        if sheet_name not in excel_sheet_names:
            return {'result' : False}

    os.makedirs(CSV_OUTPUT_DIR, exist_ok=True)

    # Iterate through each sheet and save it as a CSV
    for sheet_name, sheet_df in all_sheets.items():
        sheet_df.to_csv(f'{CSV_OUTPUT_DIR}/{sheet_name}.csv', index=False)


def check_csv_files(csv_dir_path: str, csv_files_list: list):
    """Check the csv files """

    # csv file names validation
    if sorted(os.listdir(csv_dir_path)) != sorted(csv_files_list):
        logger.error(f"The CSV directory does not contain all the data files.")
