#!/bin/bash

ENV_FILE=".env"

# Load .env file
if [[ -f $ENV_FILE ]]; then
    export $(cat $ENV_FILE | sed 's/^\s*#.*//g' | xargs)
else
    echo "Error: $ENV_FILE file not found"
    exit 1
fi

POSTGRES_DB_SERVER_URL=$(aws lightsail get-relational-database \
                        --relational-database-name lsdb$APP_NAME \
                        --region $REGION | jq -r '.relationalDatabase.masterEndpoint.address')

# Function to URL encode a string
urlencode() {
    local length="${#1}"
    for (( i = 0; i < length; i++ )); do
        local c="${1:i:1}"
        case "$c" in
            [a-zA-Z0-9.~_-]) printf "$c" ;;
            *) printf '%%%02X' "'$c" ;;
        esac
    done
}

# Get encoded password with %xx
DATABASE_PASSWORD_ENCODED=$(urlencode $POSTGRES_DATABASE_PASSWORD)

export DATABASE_URL="postgresql://postgresadmin:${DATABASE_PASSWORD_ENCODED}@$POSTGRES_DB_SERVER_URL:5432/aatdb"
export APP_SECRET_KEY=${APP_SECRET_KEY}
export APP_ENV="aws"

echo "Following environment variables are set"
echo "DATABASE_URL=\"${DATABASE_URL}\""
echo "APP_SECRET_KEY=\"${APP_SECRET_KEY}\""
echo "APP_ENV=\"${APP_ENV}\""
