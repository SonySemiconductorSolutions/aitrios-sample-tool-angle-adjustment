#!/bin/bash

webAppName=$1
webAppValue=$2
subscriptionId=$3

echo "Checking availability of the '$webAppValue' name for Azure App Service."

# Check if the web app name is globally available using Azure REST API
availabilityCheck=$(az rest --method POST \
  --url "https://management.azure.com/subscriptions/$subscriptionId/providers/Microsoft.Web/checkNameAvailability?api-version=2021-02-01" \
  --headers "Content-Type=application/json" \
  --body @- <<EOF
{
  "name": "$webAppValue",
  "type": "Microsoft.Web/sites"
}
EOF
)

# Parse the result to check if the web app name is available
isAvailable=$(echo "$availabilityCheck" | jq -r '.nameAvailable')

if [ "$isAvailable" == "true" ]; then
  # "Web app name is available, exit with success."
  exit 0
else
  echo "$webAppName value '$webAppValue' is not available for Azure App Service. Please use different value."
  exit 1
fi
