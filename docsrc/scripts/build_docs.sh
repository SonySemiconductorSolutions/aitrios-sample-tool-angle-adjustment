#!/bin/bash

# Delete and Create output directory
rm -rf output-docs && mkdir -p output-docs
rm -rf about-output apidocs-output app-setup-guide-azure-output app-setup-guide-aws-output user-guide-output

# Execute scripts
bash scripts/build_docs_about.sh
bash scripts/build_docs_apidoc.sh
bash scripts/build_docs_app_setup_azure_cloud.sh
bash scripts/build_docs_app_setup_aws.sh
bash scripts/build_docs_app_setup_codespaces.sh
bash scripts/build_docs_user_guide.sh

# Copy the built docs to output directory
cp about-output/html/CAAT-*.html output-docs/.
cp apidocs-output/html/CAAT-*.html output-docs/.
cp app-setup-guide-azure-output/html/CAAT-*.html output-docs/.
cp app-setup-guide-aws-output/html/CAAT-*.html output-docs/.
cp app-setup-guide-codespaces-output/html/CAAT-*.html output-docs/.
cp user-guide-output/pdf/CAAT-*.pdf output-docs/.
cp user-guide-output/html/CAAT-*.html output-docs/.

# Remove intermediate output directories
rm -rf about-output apidocs-output app-setup-guide-azure-output app-setup-guide-aws-output app-setup-guide-codespaces-output user-guide-output

# Copy base index.html file to output-docs directory
cp index.html output-docs
