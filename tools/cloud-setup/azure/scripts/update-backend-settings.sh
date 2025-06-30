#!/bin/bash

ENV_FILE=".env"

# Load .env file
if [[ -f $ENV_FILE ]]; then
    export $(cat $ENV_FILE | sed 's/^\s*#.*//g' | xargs)
else
    echo "Error: $ENV_FILE file not found"
    exit 1
fi

RESOURCE_GROUP=rg-$APP_NAME

ADMIN_APP_URL=$(az webapp show --name $WEBADMIN_NAME --resource-group $RESOURCE_GROUP --query defaultHostName --output tsv)

# Set admin app URL as backend app settings
az webapp config appsettings set \
  --name $BACKEND_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings "ADMIN_APP_URL=https://$ADMIN_APP_URL"


BACKEND_SERVER_URL="https://${BACKEND_NAME}.azurewebsites.net"

echo $BACKEND_SERVER_URL

echo "Backend Server validation in Progress.."

while :
do
    # Hit Backend Server and capture JSON response
    response=$(curl -s "$BACKEND_SERVER_URL")

    # Check if backend server hit is successful
    if [ $? -ne 0 ]; then
        echo "Error: Failed to check the backend server. Please execute the script again."
        exit 1
    fi

    # check if Response contains the status code otherwise retry
    if [[ $response == *status_code* ]]; then

        status_code=$(echo "$response" | jq -r '.status_code')

        # check if Response is in expected format
        if [[ -z "$status_code" ]]; then
            echo "Waiting for backend server to be available. Sleeping for 5 seconds..."
            sleep 5
            continue
        fi
    else
        if [[ -z "$status_code" ]]; then
            echo "Waiting for backend server to be available. Sleeping for 5 seconds..."
            sleep 5
            continue
        fi
    fi

    status_code=$(echo "$response" | jq -r '.status_code')

    if [ "$status_code" -eq 200 ]; then
        echo "Backend Server is running successfully."
        break
    else
        echo "Waiting for backend server to be available. Sleeping for 5 seconds..."
        sleep 5
    fi
done
