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
import shutil

import click
from src.config import APP_SECRET_KEY, DATABASE_URL
from src.csv.main import db_clear, db_populate, list_admin_data, reset_password
from src.qr.main import generate_qr
from src.utils.util_resources import get_resource_path
from src.utils.logger import get_json_logger

logger = get_json_logger()

@click.group()
def cli():
    """Main entry point"""
    pass


@cli.group()
def db():
    """Database Related options"""
    pass


@db.command()
def export_template():
    """
    Export a template file and the sample file.
    """

    template_excel_path = get_resource_path("data/excel/SIerData_template.xlsx")
    sample_excel_path = get_resource_path("data/excel/SIerData_sample.xlsx")

    shutil.copy(template_excel_path, os.getcwd())
    shutil.copy(sample_excel_path, os.getcwd())

    click.echo(f"Data template and Data Sample files are exported and saved at: {str(os.getcwd())}")


@db.command()
@click.option("-e", "--excel-path", nargs=1, required=False, type=str, help="Excel File Path")
@click.option("-c", "--csv-dir", nargs=1, required=False, type=str, help="CSV Directory Path")
def populate(excel_path, csv_dir):
    """
    Populates all the data from either an excel or CSV

    $ caat-helper db populate --excel-path '/path/to/excel'

    $ caat-helper db populate --csv-dir '/path/to/csv'

    """
    if not excel_path and not csv_dir:
        click.echo("At least one argument is required. Use --help for details", err=True)
        return

    # Validate Database URL
    if not DATABASE_URL:
        logger.error(f"DATABASE_URL is not provided in environment variables.")
        return

    # Validate Application Secret Key
    if not APP_SECRET_KEY:
        logger.error(f"APP_SECRET_KEY is not provided in environment variables.")
        return

    result, tables_added = db_populate(excel_path, csv_dir)

    if tables_added:
        tables_str = ", ".join(tables_added)

    if not result["is_valid"]:
        click.echo(("Populating in Database Failed"))
    else:
        if tables_added:
            click.echo(f"Populating {tables_str} in Database is Successful")
        else:
            click.echo(f"\nNo new data is added to the Database")


@db.command()
def list_admin():
    """
    List Admin details
    """

    list_admin_data()


@db.command()
@click.option("-l", "--login-id", required=True, type=str, help="Admin Login ID")
@click.option("-p", "--password", required=True, type=str, help="Admin Password")
def reset_pass(login_id, password):
    """
    Method to reset admin's credentials
    """

    result = reset_password(login_id, password)
    click.echo("Admin password reset is " + "Successful" if result else "Failed")

def confirm_alert(alert_text):
    """
    Shows the confirmation alert with yes no
    """
    while True:
        response = input(alert_text + " (y/n): ").lower()
        if response in ['y', 'n']:
            return response == 'y'
        else:
            logger.info(f"Please respond with 'y' or 'n'.")

@db.command()
def clear():
    """
    Clears all the data from database
    """
    # Validate Database URL
    if not DATABASE_URL:
        logger.error(f"DATABASE_URL is not provided in environment variables.")
        return

    # Validate Application Secret Key
    if not APP_SECRET_KEY:
        logger.error(f"APP_SECRET_KEY is not provided in environment variables.")
        return
    
    if (confirm_alert("This will delete all the data from Database. Are you sure?")):
        result = db_clear()
        click.echo("Database Data Clear is " + "Successful" if result else "Failed")


@cli.group()
def qr():
    """
    QR code generation command.
    """
    pass


@qr.command()
@click.option("-u", "--url", required=True, type=str, help="Web App URL")
def generate(url):
    """
    Generate QR codes for a facility (Url and Facility QR codes).
    """

    # Validate Database URL
    if not DATABASE_URL:
        logger.error(f"DATABASE_URL is not provided in environment variables.")
        return

    # Validate Application Secret Key
    if not APP_SECRET_KEY:
        logger.error(f"APP_SECRET_KEY is not provided in environment variables.")
        return

    generate_qr(url=url)


if __name__ == "__main__":
    cli()
