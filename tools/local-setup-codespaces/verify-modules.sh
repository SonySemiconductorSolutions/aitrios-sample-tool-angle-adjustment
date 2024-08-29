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

BACKEND_SERVER=$CODESPACE_NAME-8000.app.github.dev
backend_response=$(curl -o /dev/null -s -w "%{http_code}\n" https://$BACKEND_SERVER)
if [[ $backend_response == 200 ]]; then
    echo "Backend Server running Successfully at https://"$BACKEND_SERVER
else
    echo "Backend Server is NOT running at https://${BACKEND_SERVER}"
fi

CONTRACTOR_APP=$CODESPACE_NAME-3000.app.github.dev
contractor_response=$(curl -o /dev/null -s -w "%{http_code}\n" https://$CONTRACTOR_APP)
if [[ $contractor_response == 200 ]]; then
    echo "Contractor App running Successfully at https://"$CONTRACTOR_APP
else
    echo "Contractor App is NOT running at https://${CONTRACTOR_APP}"
fi

ADMIN_APP=$CODESPACE_NAME-3001.app.github.dev
admin_response=$(curl -o /dev/null -s -w "%{http_code}\n" https://$ADMIN_APP)
if [[ $contractor_response == 200 ]]; then
    echo "Admin App running Successfully at https://"$ADMIN_APP
else
    echo "Admin App is NOT running at https://${ADMIN_APP}"
fi
