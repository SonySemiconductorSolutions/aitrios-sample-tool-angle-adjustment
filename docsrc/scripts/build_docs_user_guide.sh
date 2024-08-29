#!/bin/bash

# IMPORTANT
# Please execute this script from `docsrc` directory

source ./scripts/convert_adoc.sh

DOCS_DIR="user-guide"
OUTPUT_DIR_PDF="${DOCS_DIR}-output/pdf"
OUTPUT_DIR_HTML="${DOCS_DIR}-output/html"

# Input and Output file names
# Admin English I/O
ADMIN_APP_USER_GUIDE_ADOC="CAAT-Admin-App-User-Guide.adoc"
ADMIN_APP_USER_GUIDE_PDF="CAAT-Admin-App-User-Guide-en.pdf"
ADMIN_APP_USER_GUIDE_HTML="CAAT-Admin-App-User-Guide-en.html"

# Admin Japanese I/O
ADMIN_APP_USER_GUIDE_ADOC_JA="CAAT-Admin-App-User-Guide-ja.adoc"
ADMIN_APP_USER_GUIDE_PDF_JA="CAAT-Admin-App-User-Guide-ja.pdf"
ADMIN_APP_USER_GUIDE_HTML_JA="CAAT-Admin-App-User-Guide-ja.html"

# Contractor English I/O
CONTRACTOR_APP_USER_GUIDE_ADOC="CAAT-Contractor-App-User-Guide.adoc"
CONTRACTOR_APP_USER_GUIDE_PDF="CAAT-Contractor-App-User-Guide-en.pdf"
CONTRACTOR_APP_USER_GUIDE_HTML="CAAT-Contractor-App-User-Guide-en.html"

# Contractor Japanese I/O
CONTRACTOR_APP_USER_GUIDE_ADOC_JA="CAAT-Contractor-App-User-Guide-ja.adoc"
CONTRACTOR_APP_USER_GUIDE_PDF_JA="CAAT-Contractor-App-User-Guide-ja.pdf"
CONTRACTOR_APP_USER_GUIDE_HTML_JA="CAAT-Contractor-App-User-Guide-ja.html"

# Convert contractor app user guide PDF/HTML
# English
convert_to_pdf $OUTPUT_DIR_PDF ${CONTRACTOR_APP_USER_GUIDE_PDF} ${DOCS_DIR}/${CONTRACTOR_APP_USER_GUIDE_ADOC}
convert_to_html $OUTPUT_DIR_HTML ${CONTRACTOR_APP_USER_GUIDE_HTML} ${DOCS_DIR}/${CONTRACTOR_APP_USER_GUIDE_ADOC}
# Japanese
convert_to_pdf $OUTPUT_DIR_PDF ${CONTRACTOR_APP_USER_GUIDE_PDF_JA} ${DOCS_DIR}/${CONTRACTOR_APP_USER_GUIDE_ADOC_JA}
convert_to_html $OUTPUT_DIR_HTML ${CONTRACTOR_APP_USER_GUIDE_HTML_JA} ${DOCS_DIR}/${CONTRACTOR_APP_USER_GUIDE_ADOC_JA}

# Convert admin app user guide PDF/HTML
# English
convert_to_pdf $OUTPUT_DIR_PDF ${ADMIN_APP_USER_GUIDE_PDF} ${DOCS_DIR}/${ADMIN_APP_USER_GUIDE_ADOC}
convert_to_html $OUTPUT_DIR_HTML ${ADMIN_APP_USER_GUIDE_HTML} ${DOCS_DIR}/${ADMIN_APP_USER_GUIDE_ADOC}
# Japanese
convert_to_pdf $OUTPUT_DIR_PDF ${ADMIN_APP_USER_GUIDE_PDF_JA} ${DOCS_DIR}/${ADMIN_APP_USER_GUIDE_ADOC_JA}
convert_to_html $OUTPUT_DIR_HTML ${ADMIN_APP_USER_GUIDE_HTML_JA} ${DOCS_DIR}/${ADMIN_APP_USER_GUIDE_ADOC_JA}

echo "User Guides for Admin App and Contractor App has been generated in PDF/HTML format."
