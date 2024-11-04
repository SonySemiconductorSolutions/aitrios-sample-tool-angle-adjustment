#!/bin/bash

ENV_FILE=".env"

# Load .env file
if [[ -f $ENV_FILE ]]; then
    export $(cat $ENV_FILE | sed 's/^\s*#.*//g' | xargs)
else
    echo "Error: $ENV_FILE file not found"
    exit 1
fi

# List distributions and filter by Admin App S3 bucket
admin_cloudfront_id=$(aws cloudfront list-distributions --query "DistributionList.Items[?Origins.Items[?DomainName=='$WEBADMIN_NAME.s3.$REGION.amazonaws.com']].{Id:Id,DomainName:Origins.Items[0].DomainName}" --output json --region $REGION | jq -r '.[0].Id')

# Get details of admin distribution
ADMINAPP_URL=$(aws cloudfront get-distribution --id $admin_cloudfront_id --region $REGION | jq -r '.Distribution.DomainName')

echo "Admin App URL is:: https://"$ADMINAPP_URL

# List distributions and filter by Contractor App S3 bucket
contractor_cloudfront_id=$(aws cloudfront list-distributions --query "DistributionList.Items[?Origins.Items[?DomainName=='$WEBAPP_NAME.s3.$REGION.amazonaws.com']].{Id:Id,DomainName:Origins.Items[0].DomainName}" --output json --region $REGION | jq -r '.[0].Id')

# Get details of contractor distribution
CONTRACTOR_APP_URL=$(aws cloudfront get-distribution --id $contractor_cloudfront_id --region $REGION | jq -r '.Distribution.DomainName')

echo "Contractor App URL is:: https://"$CONTRACTOR_APP_URL
