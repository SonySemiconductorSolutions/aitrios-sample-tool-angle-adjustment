#!/bin/bash

# IMPORTANT
# Please execute this script from `docsrc` directory
source ./scripts/convert_adoc.sh

DOCS_DIR="app-setup-guide-codespaces"
OUTPUT_DIR_HTML="${DOCS_DIR}-output/html"

# Input and Output file names
GHCODE_SETUP_ADOC="index.adoc"
GHCODE_SETUP_HTML="CAAT-App-Setup-Guide-Codespaces-en.html"

GHCODE_SETUP_ADOC_JA="index-ja.adoc"
GHCODE_SETUP_HTML_JA="CAAT-App-Setup-Guide-Codespaces-ja.html"

# Convert GitHub Codespaces setup docs to HTML
# English
convert_to_html $OUTPUT_DIR_HTML $GHCODE_SETUP_HTML ${DOCS_DIR}/$GHCODE_SETUP_ADOC

# Japanese
convert_to_html $OUTPUT_DIR_HTML $GHCODE_SETUP_HTML_JA ${DOCS_DIR}/$GHCODE_SETUP_ADOC_JA

echo "App Setup Guide for Codespaces has been generated in HTML format."
