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

DEPLOYMENT_NAME=$APP_NAME"armdeployment"

RESOURCE_GROUP=rg-$APP_NAME

# Create Resource Group
az group create --name $RESOURCE_GROUP --location $LOCATION --tags Environment=$APP_NAME || true

# Deploy ARM template
echo "Deploying ARM template..."

az deployment group create \
  --name "$DEPLOYMENT_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --template-file azure/arm-template-caat.json \
  --parameters \
    appName="$APP_NAME" \
    location="$LOCATION" \
    backendServerName="$BACKEND_NAME" \
    webAppName="$WEBAPP_NAME" \
    webAdminName="$WEBADMIN_NAME" \
    appSecretKey="$APP_SECRET_KEY" \
    sqlServerPassword="$SQL_DATABASE_PASSWORD"

echo "ARM template deployment completed."

#Retrieve ACR credentials
ACR_USERNAME=$(az acr credential show --name cr$APP_NAME --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name cr$APP_NAME --query passwords[0].value -o tsv)

# Set Docker credentials for Backend
az webapp config container set \
  --name $BACKEND_NAME \
  --resource-group rg-$APP_NAME \
  --container-registry-url cr$APP_NAME.azurecr.io \
  --container-registry-user $ACR_USERNAME \
  --container-registry-password $ACR_PASSWORD

# Set Docker credentials for WebApp
az webapp config container set \
  --name $WEBAPP_NAME \
  --resource-group rg-$APP_NAME \
  --container-registry-url cr$APP_NAME.azurecr.io \
  --container-registry-user $ACR_USERNAME \
  --container-registry-password $ACR_PASSWORD

# Set Docker credentials for WebAdmin
az webapp config container set \
  --name $WEBADMIN_NAME \
  --resource-group rg-$APP_NAME \
  --container-registry-url cr$APP_NAME.azurecr.io \
  --container-registry-user $ACR_USERNAME \
  --container-registry-password $ACR_PASSWORD

az webapp vnet-integration add \
  --resource-group $RESOURCE_GROUP \
  --name $BACKEND_NAME \
  --vnet vnet-$APP_NAME \
  --subnet subnet-$APP_NAME

SQL_SERVER_NAME='sqlserver-'$APP_NAME

az network vnet subnet update \
  --resource-group $RESOURCE_GROUP \
  --vnet-name vnet-$APP_NAME \
  --name subnet-$APP_NAME \
  --service-endpoints "Microsoft.Sql"

az sql server vnet-rule create \
  --resource-group $RESOURCE_GROUP \
  --server $SQL_SERVER_NAME \
  --name 'vnetrule-sql-appservice' \
  --vnet-name vnet-$APP_NAME \
  --subnet subnet-$APP_NAME

PUBLIC_IP=$(curl -s checkip.amazonaws.com)
echo "$PUBLIC_IP"

az sql server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --server $SQL_SERVER_NAME \
  --name CloudSetupHostIP \
  --start-ip-address $PUBLIC_IP \
  --end-ip-address $PUBLIC_IP
