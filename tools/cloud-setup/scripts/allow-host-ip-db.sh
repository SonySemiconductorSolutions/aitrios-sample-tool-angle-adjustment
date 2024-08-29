#!/bin/bash

ENV_FILE=".env"

# Load .env file
if [[ -f $ENV_FILE ]]; then
    export $(cat $ENV_FILE | sed 's/^\s*#.*//g' | xargs)
else
    echo "Error: $ENV_FILE file not found"
    exit 1
fi

# Set subscription
if [[ -n "$AZURE_SUBSCRIPTION_ID" ]]; then
  az account set --subscription "$AZURE_SUBSCRIPTION_ID"
fi

RESOURCE_GROUP=rg-$APP_NAME

SQL_SERVER_NAME='sqlserver-'$APP_NAME

PUBLIC_IP=$(curl -s checkip.amazonaws.com)
echo "$PUBLIC_IP"

az sql server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --server $SQL_SERVER_NAME \
  --name CloudSetupHostIP \
  --start-ip-address $PUBLIC_IP \
  --end-ip-address $PUBLIC_IP

echo "IP Address added to Database Whitelist successfully."
