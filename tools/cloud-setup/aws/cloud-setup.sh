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

# -------------------------------------------------------------------

TF_FILE="variables.tf"
PLACEHOLDER_TEXT="PLACEHOLDER"

# Check if the tffile does contain the placeholder text
if ! grep -q "$PLACEHOLDER_TEXT" "$TF_FILE"; then
    echo "Error: The tf variable file does not contain the word '$PLACEHOLDER_TEXT'. Aborting the Cloud Setup"
    exit 1
fi

cp variables.tf variables.tf.orig

# Replace the value in the variables.tf file
sed -i -e "s/PLACEHOLDER_REGION/$REGION/" $TF_FILE
sed -i -e "s/PLACEHOLDER_APP_NAME/$APP_NAME/" $TF_FILE
sed -i -e "s/PLACEHOLDER_BACKEND_NAME/$BACKEND_NAME/" $TF_FILE
sed -i -e "s/PLACEHOLDER_ADMIN_APP_NAME/$WEBADMIN_NAME/" $TF_FILE
sed -i -e "s/PLACEHOLDER_CONTRACTOR_APP_NAME/$WEBAPP_NAME/" $TF_FILE
sed -i -e "s/PLACEHOLDER_DB_PASSWORD/$POSTGRES_DATABASE_PASSWORD/" $TF_FILE

# Check if the tffile does not contain the placeholder text
if grep -q "$PLACEHOLDER_TEXT" "$TF_FILE"; then
    echo "The tf variable file is not updated successfully. Aborting the Cloud Setup"
    exit 1
fi

reset_setup() {
    rm index.html
    rm variables.tf
    mv variables.tf.orig variables.tf
}

# -------------------------------------------------------------------

# Create a dummy index.html file for CloudFront distribution
echo "Creating dummy index.html file..."
cat <<EOF > index.html
<html>
<head><title>AAT</title></head>
<body><h1>Hello from AAT!</h1></body>
</html>
EOF

# -------------------------------------------------------------------

# Initialize Terraform
echo "Initializing Terraform..."
terraform init
TF_INIT_EXIT_CODE=$?

if [ $TF_INIT_EXIT_CODE -ne 0 ]; then
    echo "Error: Terraform init failed with code ($TF_INIT_EXIT_CODE). Aborting Cloud Setup."
    reset_setup
    exit 1
fi

# -------------------------------------------------------------------

# Plan the Terraform deployment
echo "Planning Terraform deployment..."
terraform plan -out=tfplan
TF_PLAN_EXIT_CODE=$?

if [ $TF_PLAN_EXIT_CODE -ne 0 ]; then
    echo "Error: Terraform plan failed with code ($TF_PLAN_EXIT_CODE). Aborting Cloud Setup."
    reset_setup
    exit 1
fi

# -------------------------------------------------------------------

# Apply the Terraform plan
echo "Applying Terraform deployment..."
terraform apply "tfplan"
TF_APPLY_EXIT_CODE=$?

if [ $TF_APPLY_EXIT_CODE -ne 0 ]; then
    echo "Error: Terraform apply failed with code ($TF_APPLY_EXIT_CODE). Aborting Cloud Setup."
    reset_setup
    exit 1
fi

echo "Terraform deployment completed!"

# -------------------------------------------------------------------

rm index.html
rm variables.tf
mv variables.tf.orig variables.tf

echo "AWS Cloud Setup has completed successfully."
