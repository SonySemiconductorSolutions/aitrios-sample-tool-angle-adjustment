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

# -----------------------------------------------

#Retrieve ACR credentials
ACR_USERNAME=$(az acr credential show --name cr$APP_NAME --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name cr$APP_NAME --query passwords[0].value -o tsv)

# Login to ACR
docker login cr$APP_NAME.azurecr.io -u $ACR_USERNAME -p $ACR_PASSWORD
echo "Docker Login Successful."

# -----------------------------------------------

SOURCE_DIR=$(cd "$PWD"/../../../ && pwd)

echo "Building Backend Source.."

cd $SOURCE_DIR/backend

docker build -f Dockerfile-base -t caat-backend-base .

docker build -f Dockerfile -t cr$APP_NAME.azurecr.io/caat-backend-service .

echo "Deploying Backend Server.."

docker push cr$APP_NAME.azurecr.io/caat-backend-service

az webapp restart --resource-group $RESOURCE_GROUP --name $BACKEND_NAME

echo "Backend Server Deployment Completed."

# Sleeping to make sure the docker image is fetched by Backend App Service
sleep 10

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

# -----------------------------------------------

echo "Building Contractor App Source.."

cd $SOURCE_DIR/web-app
cp .env.example .env
sed -i "s/API_SERVER_DOMAIN/${BACKEND_NAME}.azurewebsites.net/g" .env
docker build -f Dockerfile -t cr$APP_NAME.azurecr.io/caat-webapp .

echo "Deploying Contractor App.."

docker push cr$APP_NAME.azurecr.io/caat-webapp

echo "Contractor App Deployment Completed."

az webapp restart --resource-group $RESOURCE_GROUP --name $WEBAPP_NAME

# -----------------------------------------------

echo "Building Admin App Source.."

cd $SOURCE_DIR/web-admin
cp .env.example .env
sed -i "s/API_SERVER_DOMAIN/${BACKEND_NAME}.azurewebsites.net/g" .env

docker build -f Dockerfile -t cr$APP_NAME.azurecr.io/caat-webadmin .

echo "Deploying Admin App.."

docker push cr$APP_NAME.azurecr.io/caat-webadmin

az webapp restart --resource-group $RESOURCE_GROUP --name $WEBADMIN_NAME

echo "Admin App Deployment Completed."

# -----------------------------------------------
