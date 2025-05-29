# Documentation

The documents are written in ["Asciidoc"](https://asciidoc.org/).

Following documents are available:

* [About](./about/home.adoc)
* [Development](./about/development-setup.adoc)
* [Admin App User Guide](./user-guide/CAAT-Admin-App-User-Guide.adoc)
* [Contractor App User Guide](./user-guide/CAAT-Contractor-App-User-Guide.adoc)
* [App Setup Guide (Azure Cloud)](./app-setup-guide-azure/index.adoc)
* [App Setup Guide (AWS Cloud)](./app-setup-guide-aws/index.adoc)
* [How to run the app on Codespaces](./app-setup-guide-codespaces/index.adoc)
* [API Docs](./apidocs/README.md)

## Prerequisites

* [Install Java Runtime Environment](https://ubuntu.com/tutorials/install-jre#2-installing-openjdk-jre) (Tested on v11.0.24)
* Python 3.10 (Tested on v3.10.12)
* [Install Node with nvm](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating) (Tested on v20.12.1)

## Installation

Install asciidoctor and other packages to build the Asciidocs and OpenAPI docs.

1. Update system
   ```shell
   $ sudo apt update
   $ sudo apt upgrade -y
   ```

2. Install Required Dependencies
   ```shell
   $ sudo apt install -y ruby ruby-dev build-essential
   ```

3. Install Asciidoctor and multipage extension
   ```shell
   $ sudo gem install css_parser -v 1.17.1
   $ sudo gem install public_suffix -v 5.1.1
   $ sudo gem install asciidoctor asciidoctor-diagram asciidoctor-diagram-plantuml asciidoctor-multipage asciidoctor-pdf
   ```

4. Install redocly npm package
   ```shell
   $ npm install -g @redocly/cli
   ```

## Build Documents

1. Execute following script to generate documents.
   ```shell
   # from docsrc
   $ bash scripts/build_docs.sh
   ```

The documents are generated and saved in `output-docs` directory.


## View Documents

1. To view documents in browser, serve them by running following command.
   ```shell
   # from docsrc
   # to run server with custom port
   # python3 -m http.server PORT -d directory
   $ python3 -m http.server 7007 -d output-docs
   ```
