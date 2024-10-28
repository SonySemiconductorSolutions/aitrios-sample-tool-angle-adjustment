#!/bin/bash

# Check CODESPACES is true
if [[ ! $CODESPACES ]]; then
    echo "Not Codespaces environment. Exiting."
    exit 1
fi

# Check if CODESPACE_NAME is available and non-empty
if [ -z "$CODESPACE_NAME" ]; then
  echo "CODESPACE_NAME is not set or is empty. Exiting..."
  exit 1
else
  echo "CODESPACE_NAME is '$CODESPACE_NAME'."
fi

CAAT_LOCAL_CODESPACES_DIR="${CODESPACE_VSCODE_FOLDER}/tools/cloud-setup/codespaces"
# Check if CODESPACE_VSCODE_FOLDER is available and non-empty
if [[ ! $CODESPACE_VSCODE_FOLDER ]] || [ ! -d "$CAAT_LOCAL_CODESPACES_DIR" ]  ; then
    echo "$CAAT_LOCAL_CODESPACES_DIR does not exists or is empty. Exiting."
    exit 1
else
    echo "Using $CODESPACE_VSCODE_FOLDER as Codespaces root directory"
fi

cd $CODESPACE_VSCODE_FOLDER/tools/cloud-setup/codespaces

ENV_FILE=".env"

# Load .env file
if [[ -f $ENV_FILE ]]; then
    export $(cat $ENV_FILE | sed 's/^\s*#.*//g' | xargs)
else
    echo "Error: $ENV_FILE file not found"
    exit 1
fi

BACKEND_SERVER_DOMAIN="${CODESPACE_NAME}-8000.app.github.dev"
echo "$BACKEND_SERVER_DOMAIN"

source set-env-var.sh

cd $CODESPACE_VSCODE_FOLDER/web-admin
rm -f .env
cp .env.example .env
sed -i "s/API_SERVER_DOMAIN/$BACKEND_SERVER_DOMAIN/g" .env

cd $CODESPACE_VSCODE_FOLDER/web-app
rm -f .env
cp .env.example .env
sed -i "s/API_SERVER_DOMAIN/$BACKEND_SERVER_DOMAIN/g" .env

cd $CODESPACE_VSCODE_FOLDER/tools/cloud-setup/codespaces

source .env

mkdir -p caatdbdata/data

docker compose up --build -d

# Make Codespaces ports public
# Backend Server
gh codespace ports visibility 8000:public -c $CODESPACE_NAME
# Contractor App
gh codespace ports visibility 3000:public -c $CODESPACE_NAME
# Admin App
gh codespace ports visibility 3001:public -c $CODESPACE_NAME
