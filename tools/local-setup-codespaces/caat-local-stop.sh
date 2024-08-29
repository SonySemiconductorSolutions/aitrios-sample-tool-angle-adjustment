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

CAAT_LOCAL_CODESPACES_DIR="${CODESPACE_VSCODE_FOLDER}/tools/local-setup-codespaces"
# Check if CODESPACE_VSCODE_FOLDER is available and non-empty
if [[ ! $CODESPACE_VSCODE_FOLDER ]] || [ ! -d "$CAAT_LOCAL_CODESPACES_DIR" ]  ; then
    echo "$CAAT_LOCAL_CODESPACES_DIR does not exists or is empty. Exiting."
    exit 1
else
    echo "Using $CODESPACE_VSCODE_FOLDER as Codespaces root directory"
fi

source set-env-var.sh

docker-compose down

# Make Codespaces ports private
# Backend Server
gh codespace ports visibility 8000:private -c $CODESPACE_NAME
# Contractor App
gh codespace ports visibility 3000:private -c $CODESPACE_NAME
# Admin App
gh codespace ports visibility 3001:private -c $CODESPACE_NAME
