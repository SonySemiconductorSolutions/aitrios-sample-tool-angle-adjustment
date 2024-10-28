#!/bin/bash

ENV_FILE=".env"

# Load .env file
if [[ -f $ENV_FILE ]]; then
  export $(cat $ENV_FILE | sed 's/^\s*#.*//g' | xargs)
else
  echo "Error: $ENV_FILE file not found"
  exit 1
fi

mandatory_vars=(
  "APP_NAME"
  "LOCATION"
  "BACKEND_NAME"
  "WEBAPP_NAME"
  "WEBADMIN_NAME"
  "APP_SECRET_KEY"
  "AZURE_SUBSCRIPTION_ID"
  "SQL_DATABASE_PASSWORD"
)

# ----------------------------------------------------------------------------------------------

check_mandatory_vars() {

  for var in "${mandatory_vars[@]}"; do
    value="${!var}"
    if [[ -z "$value" ]]; then
      echo "Error: $var is mandatory input for the Setup. Please provide the value."
      exit 1
    fi
  done

  if [[ $BACKEND_NAME == $WEBAPP_NAME ]]; then
    echo "BACKEND_NAME value '$BACKEND_NAME' and WEBAPP_NAME value '$WEBAPP_NAME' can not be same."
    exit 1
  fi

  if [[ $WEBAPP_NAME == $WEBADMIN_NAME ]]; then
    echo "WEBAPP_NAME value '$WEBAPP_NAME' and WEBADMIN_NAME value '$WEBADMIN_NAME' can not be same."
    exit 1
  fi

  if [[ "$BACKEND_NAME" == "$WEBADMIN_NAME" ]]; then
    echo "BACKEND_NAME value '$BACKEND_NAME' and WEBADMIN_NAME value '$WEBADMIN_NAME' can not be same."
    exit 1
  fi
}

# ----------------------------------------------------------------------------------------------

validate_azure_location() {
  local variable_name=$1
  local variable_value=$2

  locations=($(az account list-locations | jq -r '.[].name'))

  if [ ${#locations[@]} -eq 0 ]; then
      echo "Error: Error retrieving Azure locations. Please check the Azure Login."
      exit 1
  fi

  if [[ ! " ${locations[@]} " =~ " ${variable_value} " ]]; then
      echo "Error: $variable_name value '$variable_value' is not a valid Azure location."
      exit 1
  fi
}

validate_alphanumeric() {
  local variable_name=$1
  local variable_value=$2
  local variable_min_length=$3
  local variable_max_length=$4

  if [[ ${#variable_value} -lt $variable_min_length || ${#variable_value} -gt $variable_max_length ]]; then
      if [[ $variable_min_length == $variable_max_length ]]; then
        echo "Error: $variable_name value '$variable_value' should be exact $variable_min_length characters in length."
      else
        echo "Error: $variable_name value '$variable_value' should be $variable_min_length-$variable_max_length characters in length."
      fi
      exit 1
  fi

  if [[ ! "$variable_value" =~ ^[0-9a-zA-Z]+$ ]]; then
      echo "Error: $variable_name value '$variable_value' can contain only Alpha Numeric Characters."
      exit 1
  fi
}

validate_uuid() {
  local variable_name=$1
  local variable_value=$2

  if [[ ! "$variable_value" =~ ^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$ ]]; then
      echo "Error: $variable_name value '$variable_value' is not in a valid UUID format. \
        e.g. '12345678-abcd-ef12-3456-789abcdef123'."
      exit 1
  fi
}

validate_azure_subscription() {
  local variable_name=$1
  local variable_value=$2

  validate_uuid "AZURE_SUBSCRIPTION_ID" $AZURE_SUBSCRIPTION_ID

  read subscriptionId subscriptionStatus <<< "$(az account list --query "[?isDefault].{id: id, status: state}" --output tsv)"

  if [[ "$subscriptionId" == "$AZURE_SUBSCRIPTION_ID" ]]; then
    if [ ! "$subscriptionStatus" == "Enabled" ]; then
        echo "Error: The Subscription ID provided is not enabled."
        exit 1
    fi
  else
    echo "Error: AZURE_SUBSCRIPTION_ID value $AZURE_SUBSCRIPTION_ID is invalid, Please provide correct value."
    exit 1
  fi
}

validate_azure_webapps() {
  local variable_name=$1
  local variable_value=$2
  local variable_min_length=$3
  local variable_max_length=$4

  if [[ ${#variable_value} -lt $variable_min_length || ${#variable_value} -gt $variable_max_length ]]; then
      echo "Error: $variable_name value '$variable_value' should be \
        $variable_min_length-$variable_max_length characters in length."
      exit 1
  fi

  if [[ ! "$variable_value" =~ ^[A-Za-z0-9]+(-[A-Za-z0-9]+)*$ ]]; then
      echo -e "Error: $variable_name value '$variable_value' can only contain alphanumeric characters and hyphens."
      echo "Value cannot begin or end with a hyphen and cannot contain consecutive hyphens."
      exit 1
  fi

  bash scripts/check-web-app.sh $variable_name $variable_value $AZURE_SUBSCRIPTION_ID 
  webapp_available_status=$?

  if [ $webapp_available_status -ne 0 ]; then
      exit 1
  fi
}

validate_sql_db_password() {
  local variable_name=$1
  local variable_value=$2
  local variable_min_length=$3
  local variable_max_length=$4

  if [[ ${#variable_value} -lt $variable_min_length || ${#variable_value} -gt $variable_max_length ]]; then
      echo "Error: $variable_name value '$variable_value' should be \
        $variable_min_length-$variable_max_length characters in length."
      exit 1
  fi

  if [[ ! "$variable_value" =~ ^[0-9a-zA-Z!\$#%@]+$ ]]; then
      echo "Error: $variable_name value '$variable_value' can contain only Alpha Numeric Characters and these special characters  '!', '$', '#', '%', '@'."
      exit 1
  fi
}

validate_inputs() {
  # NOTE: Change these variable length values based on the below path
  # 'Environment File' section in docsrc/app-setup-guide-azure/environment-setup.adoc

  validate_alphanumeric "APP_NAME" $APP_NAME 4 40
  validate_azure_subscription "AZURE_SUBSCRIPTION_ID" $AZURE_SUBSCRIPTION_ID
  validate_azure_location "LOCATION" $LOCATION
  validate_azure_webapps "BACKEND_NAME" $BACKEND_NAME 2 60
  validate_azure_webapps "WEBAPP_NAME" $WEBAPP_NAME 2 60
  validate_azure_webapps "WEBADMIN_NAME" $WEBADMIN_NAME 2 60
  validate_alphanumeric "APP_SECRET_KEY" $APP_SECRET_KEY 32 32
  validate_sql_db_password "SQL_DATABASE_PASSWORD" $SQL_DATABASE_PASSWORD 8 128
}

# ----------------------------------------------------------------------------------------------

check_mandatory_vars

validate_inputs
