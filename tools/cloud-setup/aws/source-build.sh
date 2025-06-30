#!/bin/bash

ENV_FILE=".env"

# Load .env file
if [[ -f $ENV_FILE ]]; then
    export $(cat $ENV_FILE | sed 's/^\s*#.*//g' | xargs)
else
    echo "Error: $ENV_FILE file not found"
    exit 1
fi

# TODO Edit this based on the final location
SOURCE_DIR=$(cd "$PWD"/../../../ && pwd)

echo $SOURCE_DIR

## ==============================================
# Build Backend Server and push to Lightsail
## ==============================================

echo "Building Backend Source.."

cd $SOURCE_DIR/backend

docker build -f Dockerfile-base -t caat-backend-base .

docker build --build-arg APP_ENV=aws -f Dockerfile -t caat-backend-service .

CONTAINER_SERVICE_NAME=$BACKEND_NAME
BACKEND_SERVER_IMAGE="caat-backend-service"
DEFAULT_JWT_EXPIRED_MINUTES=1440

aws lightsail push-container-image \
  --service-name $CONTAINER_SERVICE_NAME \
  --label $BACKEND_SERVER_IMAGE \
  --image $BACKEND_SERVER_IMAGE:latest \
  --region $REGION

db_output=$(aws lightsail get-relational-database \
        --relational-database-name "lsdb$APP_NAME" \
        --region $REGION)

DATABASE_DOMAIN=$(echo $db_output | jq -r '.relationalDatabase.masterEndpoint.address')

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

export DATABASE_URL="postgresql://postgresadmin:${DATABASE_PASSWORD_ENCODED}@$DATABASE_DOMAIN:5432/aatdb"


# List distributions and filter by Admin App S3 bucket
admin_cloudfront_id=$(aws cloudfront list-distributions --query "DistributionList.Items[?Origins.Items[?DomainName=='$WEBADMIN_NAME.s3.$REGION.amazonaws.com']].{Id:Id,DomainName:Origins.Items[0].DomainName}" --output json --region $REGION | jq -r '.[0].Id')
# Get details of admin distribution
ADMIN_APP_URL=$(aws cloudfront get-distribution --id $admin_cloudfront_id --region $REGION | jq -r '.Distribution.DomainName')
ADMIN_APP_URL="https://$ADMIN_APP_URL"


# List distributions and filter by Contractor App S3 bucket
contractor_cloudfront_id=$(aws cloudfront list-distributions --query "DistributionList.Items[?Origins.Items[?DomainName=='$WEBAPP_NAME.s3.$REGION.amazonaws.com']].{Id:Id,DomainName:Origins.Items[0].DomainName}" --output json --region $REGION | jq -r '.[0].Id')

# Get details of contractor distribution
CONTRACTOR_APP_URL=$(aws cloudfront get-distribution --id $contractor_cloudfront_id --region $REGION | jq -r '.Distribution.DomainName')
CONTRACTOR_APP_URL="https://$CONTRACTOR_APP_URL"


container_output=$(aws lightsail create-container-service-deployment \
  --service-name $CONTAINER_SERVICE_NAME \
  --containers "{
        \"caat-backend-container\": {
            \"image\": \":$CONTAINER_SERVICE_NAME.$BACKEND_SERVER_IMAGE.latest\",
            \"ports\": {
                \"8000\": \"HTTP\"
            },
            \"environment\": {
                \"DATABASE_URL\": \"${DATABASE_URL}\",
                \"APP_SECRET_KEY\": \"${APP_SECRET_KEY}\",
                \"ADMIN_APP_URL\": \"${ADMIN_APP_URL}\",
                \"CONTRACTOR_APP_URL\": \"${CONTRACTOR_APP_URL}\",
                \"DEFAULT_JWT_EXPIRED_MINUTES\": \"${DEFAULT_JWT_EXPIRED_MINUTES}\",
                \"DEFAULT_PAGE_SIZE\": \"100\"
            }
        }
    }" \
  --public-endpoint "containerName=caat-backend-container,containerPort=8000,healthCheck={healthyThreshold=0,unhealthyThreshold=0,timeoutSeconds=10,intervalSeconds=30,path='/',successCodes=200}" \
  --region $REGION)

echo "Backend docker image pushed to Lightsail"

# Poll deployment status until it is ACTIVE or FAILED
while true; do
    deployment_state=$(aws lightsail get-container-service-deployments \
        --service-name $CONTAINER_SERVICE_NAME \
        --query "deployments[0].state" \
        --region $REGION)

    if [ "${deployment_state,,}" == "\"active\"" ]; then
        echo "Backend Image deployed successfully."
        break
    elif [ "${deployment_state,,}" == "\"failed\"" ]; then
        echo "Backend Deployment failed. Please execute the script again."
        exit 1
    else
        echo "Deployment is $deployment_state. Waiting to be active.."
        sleep 10  # wait for 10 seconds before checking again
    fi
done

# Poll the service status until it is 'RUNNING'
while true; do
    STATUS=$(aws lightsail get-container-services \
        --service-name $CONTAINER_SERVICE_NAME \
        --query "containerServices[0].state" \
        --output text \
        --region $REGION)

    if [ "${STATUS,,}" == "running" ]; then
        echo "Backend Server is running successfully."
        break
    else
        echo "Waiting for instance to be running..."
        sleep 10  # wait for 10 seconds before checking again
    fi
done

service_output=$(aws lightsail get-container-services \
        --service-name $CONTAINER_SERVICE_NAME \
        --region $REGION)

BACKEND_DOMAIN=$(echo "$service_output" | jq -r '.containerServices[0].url' | awk -F/ '{print $3}')

echo $BACKEND_DOMAIN

## ==============================================
# Build Admin App and Upload to S3
## ==============================================

echo "Building Admin Source.."

cd $SOURCE_DIR/web-admin

# delete old .env and make a new copy
rm -f .env
cp .env.example .env

# Replace backend domain
sed -i "s/API_SERVER_DOMAIN/$BACKEND_DOMAIN/g" .env

# Install dependencies for Admin app
npm install

# Build the Admin app source code
npm run build

# Push the Admin build files/output to s3
aws s3 sync build/ s3://$WEBADMIN_NAME --region $REGION
echo "Admin Source built and uploaded successfully to s3."

# List distributions and filter by Admin App S3 bucket
admin_cloudfront_id=$(aws cloudfront list-distributions --query "DistributionList.Items[?Origins.Items[?DomainName=='$WEBADMIN_NAME.s3.$REGION.amazonaws.com']].{Id:Id,DomainName:Origins.Items[0].DomainName}" --output json --region $REGION | jq -r '.[0].Id')

aws cloudfront create-invalidation --distribution-id $admin_cloudfront_id --paths '/*'

## ==============================================
# Build Contractor App and Upload to S3
## ==============================================

echo "Building Contractor Source.."

cd $SOURCE_DIR/web-app

# delete old .env and make a new copy
rm -f .env
cp .env.example .env

# Replace backend domain
sed -i "s/API_SERVER_DOMAIN/$BACKEND_DOMAIN/g" .env

# Install dependencies for Contractor app
npm install

# Build the Contractor app source code
npm run build

# Push the Contractor build files/output to s3
aws s3 sync build/ s3://$WEBAPP_NAME --region $REGION

echo "Contractor Source built and uploaded successfully to s3."

# List distributions and filter by Contractor App S3 bucket
contractor_cloudfront_id=$(aws cloudfront list-distributions --query "DistributionList.Items[?Origins.Items[?DomainName=='$WEBAPP_NAME.s3.$REGION.amazonaws.com']].{Id:Id,DomainName:Origins.Items[0].DomainName}" --output json --region $REGION | jq -r '.[0].Id')

aws cloudfront create-invalidation --distribution-id $contractor_cloudfront_id --paths '/*'
