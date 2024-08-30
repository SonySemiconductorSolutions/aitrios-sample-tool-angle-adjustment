#!/bin/bash

# IMPORTANT
# Please execute this script from `docsrc` directory

source ./scripts/convert_adoc.sh

DOCS_DIR="about"
OUTPUT_DIR_HTML="${DOCS_DIR}-output/html"

# Create output directories if they do not exist
mkdir -p $OUTPUT_DIR_HTML

# Input and Output file names
ABOUT_ADOC="home.adoc"
ABOUT_HTML="CAAT-home-en.html"

ABOUT_ADOC_JA="home-ja.adoc"
ABOUT_HTML_JA="CAAT-home-ja.html"

DEVELOPMENT_ADOC="development-setup.adoc"
DEVELOPMENT_HTML="CAAT-development-setup-en.html"

DEVELOPMENT_ADOC_JA="development-setup-ja.adoc"
DEVELOPMENT_HTML_JA="CAAT-development-setup-ja.html"

# Convert Home(about) document to HTML
# English
convert_to_html $OUTPUT_DIR_HTML $ABOUT_HTML ${DOCS_DIR}/${ABOUT_ADOC}
# Japanese
convert_to_html $OUTPUT_DIR_HTML $ABOUT_HTML_JA ${DOCS_DIR}/${ABOUT_ADOC_JA}

# Convert Develoment setup document to HTML
# English
convert_to_html $OUTPUT_DIR_HTML $DEVELOPMENT_HTML ${DOCS_DIR}/${DEVELOPMENT_ADOC}
# Japanese
convert_to_html $OUTPUT_DIR_HTML $DEVELOPMENT_HTML_JA ${DOCS_DIR}/${DEVELOPMENT_ADOC_JA}

echo "About docs has been generated in HTML format."
