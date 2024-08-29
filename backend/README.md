# Backend Server

## Requirements

- Python 3.10
- Pipenv
- Docker

## Quick start

### Prepare environment

> The following commands assume `backend` as current working directory.

Make a copy of example env as following:
   ```
   # from backend
   $ cp .env.example .env
   ```

Populate following mandatory variables:
* DATABASE_URL
* APP_SECRET_KEY

> NOTE: There are other optional environment variable, if changes, please be careful to modify at other places.

#### Get DATABASE_URL

Postgres Database is used for local development.

1. Run docker command to start Postgres Server (DB Server instance) container
   ```
   # from backend
   $ docker run --env "POSTGRES_USER=postgres" --env "POSTGRES_PASSWORD=V3ry5tr0ndbServerPa55" --env "POSTGRES_DB=caatdb" --publish 5432:5432 --name postgres-container --detach postgres:13
   ```

2. The DATABASE_URL would look like following:
   ```
   DATABASE_URL="postgresql://postgres:V3ry5tr0ndbServerPa55@localhost:5432/caatdb"
   ```
3. Replace the DATABASE_URL value in `.env` file.

#### Get APP_SECRET_KEY

1. To generate App secret key of 32 characters in length (to sign the JWT and encrypt/decrypt the credentials), use following command:
   ```
   # from backend
   $ openssl rand -base64 24
   ```
2. Copy the output and Replace the secret key value.
   Example APP_SECRET_KEY:
   ```
   APP_SECRET_KEY="hMnkHhOm6oh3w63zzu6s8FmHRQnreWrh"
   ```
    Use the generated Key instead of copying the example key. It is only for reference.

3. Replace the APP_SECRET_KEY value in `.env` file.

> Note: If the secret key is changed, the data already signed/encrypted will be of no use (redo the setup).


### Run Backend Server

1. Create virtual environment

   ```shell
   # from backend
   $ pipenv shell
   $ pipenv install

   # Install dev packages
   $ pipenv install --dev
    ```

2. Generate ORM code (run only whenever there is change in Database schema). Additional details about prisma, [see here](./prisma/README.md).
   ```
   # from backend
   $ make model
   ```

3. Apply schema changes into the database. (run for the first time or only whenever there is change in Database schema)
    * Define database schema in [schema.local.prisma](./prisma/schema.local.prisma). [Reference](https://www.prisma.io/docs/concepts/components/prisma-schema)
    * Apply schema changes into the database.

   ```
   # from backend
   $ make migrate
   ```

4. Start development server
   ```
   # from backend
   $ make dev
   ```

    > NOTE: Make a note of the backend server URL with the port which is required while setting contractor app and admin app.
    > NOTE: Also make backend URL accessible from  contractor app and admin app. If using codespaces, set port visibility to `public`.

    > TIP: If there is change in environment variables (`.env`) and would like to export them to current terminal, run following command:
   ```
   # from backend
   $ export $(grep -v '^#' .env | xargs)
   ```

### DB Operations

Utility scripts are provided to perform following:

1. Populate data to DB

   * When DB is created for the first time, it is empty.
   * Data needs to be filled.
   * Fill the [JSON template](./scripts/SIer-Data.json)
   * Edit [script](./scripts/seed.py) and provide the APP_SECRET_KEY value as generated in previous [step](#get-app_secret_key)
   * Execute following [script](./scripts/seed.py) (set the secret key and json file in the script)

   </br>

   > NOTE: Executing following scripts would first clear the data from Database if any.

   ```shell
   # from backend
   $ python scripts/seed.py
   ```

   > Alternatively,  [CAAT Helper](./../tools/caat-helper/README.md) can be used to populate the initial data to Database. <br>
   > If caat-helper is used for local development/hosting, please set BUILD_ENV variable before using any caat-helper commands. <br>
   > `$ export BUILD_ENV=local`

   * View the populated data using prisma studio

   ```
   # from backend
   $ prisma studio --schema=./prisma/schema.local.prisma
   ```

2. Generate QR codes

   * After DB is created and data is populated, a QR code is needed to open the contractor App.
   * Make sure to [setup the contractor app](../web-app/README.md) and copy the URL of contractor app.
   * Edit URL variable in the [script](./scripts/generate_qr.py) and replace with Contractor App URL
   * Edit [script](./scripts/generate_qr.py) and provide the APP_SECRET_KEY value as generated in previous [step](#get-app_secret_key)
   * Execute following [script](./scripts/generate_qr.py) to generate all the QR codes (all the facility QR codes) of Contractor app URL.

   ```shell
   $ python scripts/generate_qr.py
   ```

3. Reset Admin Login Password (Optional)

   * To reset admin password execute following script.

   ```shell
   $ python scripts/reset_pass.py --login-id <login ID> --pwd <new password>
   ```
