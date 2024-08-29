#!/bin/bash

ENV_FILE=".env"

# Load .env file
if [[ -f $ENV_FILE ]]; then
    export $(cat $ENV_FILE | sed 's/^\s*#.*//g' | xargs)
else
    echo "Error: $ENV_FILE file not found"
    exit 1
fi

export DATABASE_URL="sqlserver://sqlserver-${APP_NAME}.database.windows.net:1433;user=sqlserveradmin;password={${SQL_DATABASE_PASSWORD}};database=db${APP_NAME};encrypt=true;trustServerCertificate=true;"
export APP_SECRET_KEY=${APP_SECRET_KEY}
echo "Following environment variables are set"
echo "DATABASE_URL=${DATABASE_URL}"
echo "APP_SECRET_KEY=${APP_SECRET_KEY}"
