# CAAT Helper Setup and Usage Guide

* CAAT Helper(`caat-helper`) is a python package. It provides command line interface to interact with the AAT Database.
* CAAT Helper can do following:
  * Read excel data (Admin and customer details) to be populated into DB
  * Reset Admin Password
  * Clean the DB
  * Generate QR Code for Contractor App URL

CAAT Helper can be used to populate DB in local (during development) and DB in cloud (during production/actual setup).


## Setup

### Installation
Run following commands to create virtual environment and install `caat-helper` package.

```shell
# from tools/caat-helper
# Create virtual environment
$ python3 -m venv .venv
# Activate virtual environment
$ source .venv/bin/activate
# Upgrade pip
(.venv) $ pip install -U pip

# Install in standard mode (if intention is only to use the package)
(.venv) $ pip install .
# Install in editable mode (Helpful during development)
(.venv) $ pip install -e .
```


### Setting of Env variables

Following environment variables are required to execute the commands.

- DATABASE_URL (Database Server Connection String)
- APP_SECRET_KEY (Encryption KEY for Customer details encryption)
- APP_ENV (Variable to identify App Environment based on respective DB server will be used)

#### Obtaining environment variables - Local Setup

##### Set DATABASE_URL

* Install local database for testing

1. Run docker command to start Postgres Server (DB Server instance) container
   ```
   # from backend
   $ docker run --env "POSTGRES_USER=postgres" --env "POSTGRES_PASSWORD=V3ry5tr0ndbServerPa55" --env "POSTGRES_DB=caatdb" --publish 5432:5432 --name postgres-container --detach postgres:13
   ```

2. The DATABASE_URL would look like following:
   ```
   $ export DATABASE_URL="postgresql://postgres:V3ry5tr0ndbServerPa55@localhost:5432/caatdb"
   ```

   > NOTE: If SQLserver DB is used, which is hosted in cloud, form the DATABASE_URL and set accordingly as environment variable. <br>
   > Format: <br>
   > `$ export DATABASE_URL="sqlserver://HOST:PORT;user=USER;password={PASSWORD};database=DB_NAME;encrypt=true;trustServerCertificate=true;"`

##### Set APP_SECRET_KEY

1. To generate App secret key of 32 characters in length (to sign the JWT and encrypt/decrypt the credentials), use following command:
    ```shell
    $ openssl rand -base64 24
    ```
2. Copy the output and Replace the secret key value.
    ```shell
    $ export APP_SECRET_KEY="hMnkHhOm6oh3w63zzu6s8FmHRQnreWrh"
    ```

##### Set APP_ENV

1. Set APP_ENV to local for local development. Postgres DB will be used.
    ```shell
    $ export APP_ENV=local
    ```

> NOTE: If `caat-helper` will be used to interact with cloud Database (aws/azure), set APP_ENV variable accordingly 'azure' in case of Azure and 'aws' in case of AWS.

## Usage guide for Database Operations

### Generate prisma client (only once)

Run following commands to generate prisma client.

> WARNING: Please make sure to execute this command before executing any other.

  ```shell
  (.venv) $ caat-helper-init
  ```

### Generate excel file

* Generate excel template and excel sample files.

* Run following command to generate excel files in current working directory:
  ```shell
  (.venv) $ caat-helper db export-template
  ```

### Generate excel file

* Once the excel template is generated to fill the sheets with valid data.
* A sample excel file with pre-filled data is also generated, please use it as reference.
* Refer following section to understand what each sheet contains and the purpose.

Excel template is explained here [EXCEL](EXCEL_README.md)

### Populate Data to DB

* Once the generated template is filled with necessary details, run following command to populate the data to DB.

* Particularly in the sheet: `customer` Customer credentials like auth_url, base_url, client_id, client_secret can be added/updated later in the Admin Application UI.


#### Populate all the data using Excel
  ```shell
  (.venv) $ caat-helper db populate --excel-path '/path/to/excel'
  ```

### View DB data using Prisma Studio

* To view/confirm the data that is populated in the Database, run following command:

  ```shell
  # from tools/caat-helper
  # To view data if postgres DB is used - local/aws
  (.venv) $ prisma studio --schema=./src/data/prisma/schema.postgres.prisma

  # To view data if sqlserver DB is used - azure
  (.venv) $ prisma studio --schema=./src/data/prisma/schema.prisma
   ```

* The above command execution opens/prompts to open the studio viewer in web browser, please allow.
* Once prisma studio is opened, models list is displayed.
* Click any model to view the data.
* To close the studio instance, run `ctrl+c` in the terminal where above command was executed.


### Reset Admin Password

* To reset Admin Password, there is no such feature in the Admin App.
* Instead a command line utility is provided to reset the password.
* Use reset command, when Admin requests to reset the password (in case, when forgotten)

> NOTE: Password rules: 8 characters or more, combination of alphanumeric and special characters.

1. List Admin to know the Admin ID
  ```shell
  (.venv) $ caat-helper db list-admin
  ```

2. Reset Password for a given Admin
  ```shell
  (.venv) $ caat-helper db reset-pass --login-id {admin-login-id} --password {new-pasword-value}
  ```

### Clear DB data

* For some reason, if one would like to erase the data in DB, use following command line function.

> WARNING: Please be careful while executing DB Clear command as it will erase full data. (irreversible).

  ```shell
  (.venv) $ caat-helper db clear
  ```

## Usage guide for QR Generation

### Generate the QR code for Contractor App URL

* As there is no user based authentication of Contractor App users, to limit the access, a token based authentication is implemented.
* To access Contractor App, a QR code must be generated and scanned in the mobile app.
* QR Code contains following information:
  * Facility ID
  * Customer ID of Facility Owner
  * Start and End time to setup the cameras at the facility


  ```shell
  (.venv) $ caat-helper qr generate -u "REPLACE-WITH-CONTRACTOR-APP-URL"
  ```

* The above command generates all the QR codes of customers facilities.

#### Output

- QR codes will be saved in the `QRCodes` folder. Inside that folder, there will be a subdirectory for each customer name, and within each customer's subdirectory, there will be a QR code image in PNG file format.

  ```
  QRCodes/
  └── CustomerName/
      └── `QRCode+<CustomerName>+<FacilityName>+<DeviceCount>+url.png`
  ```

- The file follow a specific naming pattern:
  1. `QRCode+<CustomerName>+<FacilityName>+<DeviceCount>+url.png`
     - This file contains the QR code for the selected customer name, facility name, device count.
