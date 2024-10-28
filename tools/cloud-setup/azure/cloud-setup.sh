#!/bin/bash

bash scripts/validate-inputs.sh
status=$?  # Get the exit status of validation script

# Check the exit status
if [ $status -eq 0 ]; then
    echo "Input validation completed successfully."
else
    echo "Input validation failed. Aborting Cloud Setup."
    exit 1
fi

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

rg_status=$(az group show --name $RESOURCE_GROUP | jq -r '.properties.provisioningState')

echo $rg_status

# Checking status case-insensitively 
if [[ "${rg_status,,}" != "succeeded" ]]; then
  echo "Error: Resource group '$RESOURCE_GROUP' could not be created. Aborting Cloud Setup."
  exit 1
fi

# Deploy ARM template
echo "Deploying ARM template..."

az deployment group create \
  --name "$DEPLOYMENT_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --template-file arm-template-caat.json \
  --parameters \
    appName="$APP_NAME" \
    location="$LOCATION" \
    backendServerName="$BACKEND_NAME" \
    webAppName="$WEBAPP_NAME" \
    webAdminName="$WEBADMIN_NAME" \
    appSecretKey="$APP_SECRET_KEY" \
    sqlServerPassword="$SQL_DATABASE_PASSWORD"

echo "ARM template deployment completed."

arm_deployment_status=$(az deployment group show -g $RESOURCE_GROUP -n $DEPLOYMENT_NAME | jq -r '.properties.provisioningState')

# Checking status case-insensitively 
if [[ "${arm_deployment_status,,}" != "succeeded" ]]; then
  echo "Error: ARM Template deployment failed. Aborting Cloud Setup."
  exit 1
fi

# ------------------------------------------------------------------------------------

#Retrieve ACR credentials
ACR_USERNAME=$(az acr credential show --name cr$APP_NAME --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name cr$APP_NAME --query passwords[0].value -o tsv)

# ------------------------------------------------------------------------------------

# Set Docker credentials for Backend
az webapp config container set \
  --name $BACKEND_NAME \
  --resource-group rg-$APP_NAME \
  --container-registry-url cr$APP_NAME.azurecr.io \
  --container-registry-user $ACR_USERNAME \
  --container-registry-password $ACR_PASSWORD

# Verification Step for Backend ACR Settings
backend_settings=$(az webapp config appsettings list \
  --name $BACKEND_NAME \
  --resource-group $RESOURCE_GROUP)

backend_acr_url=$(echo "$backend_settings" | jq -r '.[] | select(.name == "DOCKER_REGISTRY_SERVER_URL") | .value')

# Check if the backend acr url starts with the ACR username
if [[ $backend_acr_url =~ ^{$ACR_USERNAME} ]]; then
    echo "Error: Backend Server settings could not be set. Aborting Cloud Setup"
    exit 1
fi

# ------------------------------------------------------------------------------------

# Set Docker credentials for WebApp
az webapp config container set \
  --name $WEBAPP_NAME \
  --resource-group rg-$APP_NAME \
  --container-registry-url cr$APP_NAME.azurecr.io \
  --container-registry-user $ACR_USERNAME \
  --container-registry-password $ACR_PASSWORD

# Verification Step for ContractorApp ACR Settings
contractor_settings=$(az webapp config appsettings list \
  --name $WEBAPP_NAME \
  --resource-group $RESOURCE_GROUP)

contractor_acr_url=$(echo "$contractor_settings" | jq -r '.[] | select(.name == "DOCKER_REGISTRY_SERVER_URL") | .value')

# Check if the ContractorApp ACR url starts with the ACR username
if [[ $contractor_acr_url =~ ^{$ACR_USERNAME} ]]; then
    echo "Error: ContractorApp Server settings could not be set. Aborting Cloud Setup"
    exit 1
fi
# ------------------------------------------------------------------------------------

# Set Docker credentials for WebAdmin
az webapp config container set \
  --name $WEBADMIN_NAME \
  --resource-group rg-$APP_NAME \
  --container-registry-url cr$APP_NAME.azurecr.io \
  --container-registry-user $ACR_USERNAME \
  --container-registry-password $ACR_PASSWORD

# Verification Step for AdminApp ACR Settings
admin_settings=$(az webapp config appsettings list \
  --name $WEBADMIN_NAME \
  --resource-group $RESOURCE_GROUP)

admin_acr_url=$(echo "$admin_settings" | jq -r '.[] | select(.name == "DOCKER_REGISTRY_SERVER_URL") | .value')

# Check if the AdminApp ACR url starts with the ACR username
if [[ $admin_acr_url =~ ^{$ACR_USERNAME} ]]; then
    echo "Error: AdminApp Server settings could not be set. Aborting Cloud Setup"
    exit 1
fi

# ------------------------------------------------------------------------------------
SQL_SERVER_NAME='sqlserver-'$APP_NAME
SUBNET_NAME=subnet-$APP_NAME

az webapp vnet-integration add \
  --resource-group $RESOURCE_GROUP \
  --name $BACKEND_NAME \
  --vnet vnet-$APP_NAME \
  --subnet $SUBNET_NAME

az network vnet subnet update \
  --resource-group $RESOURCE_GROUP \
  --vnet-name vnet-$APP_NAME \
  --name $SUBNET_NAME \
  --service-endpoints "Microsoft.Sql"

az sql server vnet-rule create \
  --resource-group $RESOURCE_GROUP \
  --server $SQL_SERVER_NAME \
  --name 'vnetrule-sql-appservice' \
  --vnet-name vnet-$APP_NAME \
  --subnet $SUBNET_NAME

vnet_integration_status=$(az network vnet subnet show \
  --resource-group $RESOURCE_GROUP \
  --vnet-name vnet-$APP_NAME \
  --name $SUBNET_NAME \
  --query "serviceEndpoints[?service=='Microsoft.Sql']" | jq -r '.[0].provisioningState')

if [[ "${vnet_integration_status,,}" != "succeeded" ]]; then
  echo "Error: SQLServer and VirtualNetwork integration failed. Aborting Cloud Setup"
  exit 1
fi

PUBLIC_IP=$(curl -s checkip.amazonaws.com)
echo "$PUBLIC_IP"

az sql server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --server $SQL_SERVER_NAME \
  --name CloudSetupHostIP \
  --start-ip-address $PUBLIC_IP \
  --end-ip-address $PUBLIC_IP

sql_rules=$(az sql server vnet-rule list \
  --resource-group $RESOURCE_GROUP \
  --server $SQL_SERVER_NAME)

# Check if the specified subnet is in the list of virtual network rules
if ! (echo "$sql_rules" | grep -q "$SUBNET_NAME"); then
  echo "Error: The '$SUBNET_NAME' is NOT integrated with the SQL Server '$SQL_SERVER_NAME'."
  echo "Aborting Cloud setup."
  exit 1
fi

echo "Azure Cloud Setup has completed successfully."
