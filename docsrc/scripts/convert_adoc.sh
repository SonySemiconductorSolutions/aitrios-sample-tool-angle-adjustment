#!/bin/bash

convert_to_pdf(){
  OUTPUT_DIR=$1
  OUTPUT_PDF_FILE=$2
  INPUT_ADOC=$3

  asciidoctor-pdf -a scripts=cjk -a pdf-theme=default-with-fallback-font \
    -D $OUTPUT_DIR \
    -o ${OUTPUT_PDF_FILE} \
    ${INPUT_ADOC}
}

convert_to_html(){
  OUTPUT_DIR=$1
  OUTPUT_HTML_FILE=$2
  INPUT_ADOC=$3

  asciidoctor -a scripts=cjk -r asciidoctor-multipage -r asciidoctor-diagram \
    -D $OUTPUT_DIR \
    -o ${OUTPUT_HTML_FILE} \
    ${INPUT_ADOC}
}
