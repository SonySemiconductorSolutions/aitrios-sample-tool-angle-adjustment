#!/bin/bash

ENV_FILE=".env"

# Load .env file
if [[ -f $ENV_FILE ]]; then
    export $(cat $ENV_FILE | sed 's/^\s*#.*//g' | xargs)
else
    echo "Error: $ENV_FILE file not found"
    exit 1
fi

DB_SERVER_NAME=lsdb$APP_NAME

# Poll the Access status
while true; do
    current_db_state=$(aws lightsail get-relational-database \
                    --relational-database-name "$DB_SERVER_NAME" \
                    --query "relationalDatabase.state" \
                    --region "$REGION" 2>&1)

    if [ "${current_db_state,,}" == "\"modifying\"" ]; then
        echo "Database is in $current_db_state state. Waiting for 10 seconds to become available"
        sleep 10
    elif [ "${current_db_state,,}" == "\"available\"" ]; then
        echo "Database is $current_db_state now. Disabling Public access."
        break
    fi
done

output=$(aws lightsail update-relational-database \
            --relational-database-name $DB_SERVER_NAME \
            --no-publicly-accessible \
            --region $REGION)

# To wait for triggering the DB modification
sleep 5

# Poll the Access status
while true; do
    current_db_state=$(aws lightsail get-relational-database \
                    --relational-database-name "$DB_SERVER_NAME" \
                    --query "relationalDatabase.state" \
                    --region "$REGION" 2>&1)

    if [ "${current_db_state,,}" == "\"modifying\"" ]; then
        echo "Database is in $current_db_state state. Waiting for 10 seconds to become available"
        sleep 10
    elif [ "${current_db_state,,}" == "\"available\"" ]; then
        echo "Public access is disabled now."
        exit 0
    fi
done
