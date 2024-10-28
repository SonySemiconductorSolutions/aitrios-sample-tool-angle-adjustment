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
  "REGION"
  "BACKEND_NAME"
  "WEBAPP_NAME"
  "WEBADMIN_NAME"
  "APP_SECRET_KEY"
  "POSTGRES_DATABASE_PASSWORD"
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
}

# ----------------------------------------------------------------------------------------------

validate_aws_region() {
  local variable_name=$1
  local variable_value=$2

  regions=$(aws ssm get-parameters-by-path \
    --path /aws/service/global-infrastructure/regions \
    --query "Parameters[].Value" \
    --region us-east-1 \
    --output text)

  if [ ${#regions[@]} -eq 0 ]; then
      echo "Error: Error retrieving AWS regions. Please check the AWS Login."
      exit 1
  fi

  isValid=false

  # Loop through each region in the output
  for region in $regions; do
      if [[ "$region" == "$variable_value" ]]; then
          isValid=true
          break
      fi
  done

  # Check if the value was isValid
  if ! $isValid; then
      echo "Error: $variable_name value '$variable_value' is not a valid AWS region."
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
    echo "Error: $variable_name value '$variable_value' is not in a valid UUID format. e.g. '12345678-abcd-ef12-3456-789abcdef123'."
    exit 1
  fi
}

validate_aws_lightsail_container() {
  local variable_name=$1
  local variable_value=$2
  local variable_min_length=$3
  local variable_max_length=$4

  if [[ ${#variable_value} -lt $variable_min_length || ${#variable_value} -gt $variable_max_length ]]; then
    echo "Error: $variable_name value '$variable_value' should be $variable_min_length-$variable_max_length characters in length."
    exit 1
  fi

  if [[ ! "$variable_value" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
    echo -e "Error: $variable_name value '$variable_value' can only contain lowercase letters, numbers, hypens."
    echo "Value cannot begin or end with a hyphen and cannot contain consecutive hyphens."
    exit 1
  fi
}


validate_aws_s3_bucket_names() {
  local variable_name=$1
  local variable_value=$2
  local variable_min_length=$3
  local variable_max_length=$4

  if [[ ${#variable_value} -lt $variable_min_length || ${#variable_value} -gt $variable_max_length ]]; then
    echo "Error: $variable_name value '$variable_value' should be $variable_min_length-$variable_max_length characters in length."
    exit 1
  fi

  if [[ ! "$variable_value" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
    echo -e "Error: $variable_name value '$variable_value' can only contain lowercase letters, numbers, hypens."
    echo "Value cannot begin or end with a hyphen and cannot contain consecutive hyphens."
    exit 1
  fi

  # S3 Reserved prefixes and suffixes
  s3_reserved_prefixes=("xn--" "sthree-" "sthree-configurator" "amzn-s3-demo-")
  s3_reserved_suffixes=("-s3-alias" "--ol-s3" ".mrap" "--x-s3")

  # Check if the s3 bucket name starts with any of the prefixes
  for prefix in "${s3_reserved_prefixes[@]}"; do
    if [[ $variable_value == "$prefix"* ]]; then
      echo "Error: $variable_name value '$variable_value' starts with reserved prefix '$prefix'."
      exit 1
    fi
  done

  # Check if the s3 bucket name ends with any of the suffixes
  for suffix in "${s3_reserved_suffixes[@]}"; do
    if [[ $variable_value == *"$suffix" ]]; then
      echo "Error: $variable_name value '$variable_value' ends with reserved suffix '$suffix'."
      exit 1
    fi
  done

  # Check if the S3 bucket exists and capture the error message
  error_message=$(aws s3api head-bucket --bucket "$variable_value" 2>&1)

  # if result is 0 then exists in same AWS account, otherwise bucket exists in another AWS account and access is forbidden.
  if [[ $? -eq 0 || $(echo "$error_message" | grep -q 'Forbidden') ]]; then
    echo "$variable_name value '$variable_value' is not available for AWS S3 Bucket. Please use different value."
    exit 1
  fi

}

validate_postgres_db_password() {
  local variable_name=$1
  local variable_value=$2
  local variable_min_length=$3
  local variable_max_length=$4

  if [[ ${#variable_value} -lt $variable_min_length || ${#variable_value} -gt $variable_max_length ]]; then
    echo "Error: $variable_name value '$variable_value' should be $variable_min_length-$variable_max_length characters in length."
    exit 1
  fi

  if [[ ! "$variable_value" =~ ^[0-9a-zA-Z!\$#%]+$ ]]; then
    echo "Error: $variable_name value '$variable_value' can contain only Alpha Numeric Characters and these special characters '!', '$', '#', '%'."
    exit 1
  fi
}

validate_inputs() {
  # NOTE: Change these variable length values based on the below path
  # 'Environment File' section in docsrc/app-setup-guide-aws/environment-setup.adoc

  if [[ $WEBADMIN_NAME == $WEBAPP_NAME ]]; then
    echo "WEBAPP_NAME value '$WEBAPP_NAME' and WEBADMIN_NAME value '$WEBADMIN_NAME' can not be same."
    exit 1
  fi

  validate_alphanumeric "APP_NAME" $APP_NAME 4 35
  validate_aws_region "REGION" $REGION
  validate_aws_lightsail_container "BACKEND_NAME" $BACKEND_NAME 2 63
  validate_aws_s3_bucket_names "WEBAPP_NAME" $WEBAPP_NAME 3 63
  validate_aws_s3_bucket_names "WEBADMIN_NAME" $WEBADMIN_NAME 3 63
  validate_alphanumeric "APP_SECRET_KEY" $APP_SECRET_KEY 32 32
  validate_postgres_db_password "POSTGRES_DATABASE_PASSWORD" $POSTGRES_DATABASE_PASSWORD 8 128
}

# ----------------------------------------------------------------------------------------------

check_mandatory_vars

validate_inputs
