#!/bin/bash

# IMPORTANT
# Please execute this script from `docsrc` directory

source ./scripts/convert_adoc.sh

DOCS_DIR="apidocs"
OUTPUT_DIR_HTML="${DOCS_DIR}-output/html"

# Create output directories if they do not exist
mkdir -p $OUTPUT_DIR_HTML

# Input and Output file names
API_SPEC_JSON="api-spec.json"
API_SPEC_HTML="CAAT-api-spec.html"

API_WORKFLOW_ADOC="api-workflow.adoc"
API_WORKFLOW_HTML="CAAT-api-workflow.html"

# Build OpenAPI HTML using redocly package
npx @redocly/cli build-docs $DOCS_DIR/$API_SPEC_JSON -o $OUTPUT_DIR_HTML/$API_SPEC_HTML

# Generate workflow images and convert to HTML
# English
convert_to_html $OUTPUT_DIR_HTML $API_WORKFLOW_HTML ${DOCS_DIR}/${API_WORKFLOW_ADOC}

echo "API docs have been generated in HTML format."
