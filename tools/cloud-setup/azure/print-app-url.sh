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

ADMINAPP_URL=$(az webapp show --name $WEBADMIN_NAME --resource-group $RESOURCE_GROUP --query defaultHostName --output tsv)
echo "Admin App URL is:: https://"$ADMINAPP_URL

CONTRACTOR_APP_URL=$(az webapp show --name $WEBAPP_NAME --resource-group $RESOURCE_GROUP --query defaultHostName --output tsv)
echo "Contractor App URL is:: https://"$CONTRACTOR_APP_URL
