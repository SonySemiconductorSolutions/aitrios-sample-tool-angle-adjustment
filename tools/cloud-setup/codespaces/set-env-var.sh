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

ENV_FILE=".env"

# Load .env file
if [[ -f $ENV_FILE ]]; then
    export $(cat $ENV_FILE | sed 's/^\s*#.*//g' | xargs)
else
    echo "Error: $ENV_FILE file not found"
    exit 1
fi

DATABASE_SERVER_IP=$(ifconfig eth0 | grep -oP 'inet \K[\d.]+')
echo "$DATABASE_SERVER_IP"

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
DATABASE_PASSWORD_ENCODED=$(urlencode $DATABASE_PASSWORD)


export DATABASE_URL="postgresql://postgres:${DATABASE_PASSWORD_ENCODED}@${DATABASE_SERVER_IP}:5432/caatdb"
export APP_SECRET_KEY=${APP_SECRET_KEY}

# Set APP_ENV to local so that postgres prisma file is referred.
export APP_ENV="local"

# Set contractor app URL
CONTRACTOR_APP=$CODESPACE_NAME-3000.app.github.dev
CONTRACTOR_APP_URL="https://$CONTRACTOR_APP"
export CONTRACTOR_APP_URL="$CONTRACTOR_APP_URL"

# Set admin app URL
ADMIN_APP=$CODESPACE_NAME-3001.app.github.dev
ADMIN_APP_URL="https://$ADMIN_APP"
export ADMIN_APP_URL="$ADMIN_APP_URL"

echo "Following environment variables are set"
echo "DATABASE_URL=${DATABASE_URL}"
echo "APP_SECRET_KEY=${APP_SECRET_KEY}"
echo "APP_ENV=${APP_ENV}"
echo "CONTRACTOR_APP_URL=${CONTRACTOR_APP_URL}"
echo "ADMIN_APP_URL=${ADMIN_APP_URL}"
