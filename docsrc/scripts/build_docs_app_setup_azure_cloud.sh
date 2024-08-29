#!/bin/bash

# IMPORTANT
# Please execute this script from `docsrc` directory

source ./scripts/convert_adoc.sh

DOCS_DIR="app-setup-guide-azure"
OUTPUT_DIR_HTML="${DOCS_DIR}-output/html"

# Input and Output file names
CLOUD_SETUP_ADOC="index.adoc"
CLOUD_SETUP_HTML="CAAT-App-Setup-Guide-Azure-Cloud-en.html"

CLOUD_SETUP_ADOC_JA="index-ja.adoc"
CLOUD_SETUP_HTML_JA="CAAT-App-Setup-Guide-Azure-Cloud-ja.html"

# Convert cloud setup docs to HTML
# English
convert_to_html $OUTPUT_DIR_HTML $CLOUD_SETUP_HTML ${DOCS_DIR}/$CLOUD_SETUP_ADOC
# Japanese
convert_to_html $OUTPUT_DIR_HTML $CLOUD_SETUP_HTML_JA ${DOCS_DIR}/$CLOUD_SETUP_ADOC_JA

echo "App Setup Guide for Azure has been generated in HTML format."
