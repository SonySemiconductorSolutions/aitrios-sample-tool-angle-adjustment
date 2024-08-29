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

CONTRACTOR_APP=$CODESPACE_NAME-3000.app.github.dev
echo "Contractor App URL is:: https://"$CONTRACTOR_APP

ADMIN_APP=$CODESPACE_NAME-3001.app.github.dev
echo "Admin App URL is:: https://"$ADMIN_APP
