# Documentation

The documents are written in ["Asciidoc"](https://asciidoc.org/).

Following documents are available:

* [About](./about/home.adoc)
* [Development](./about/development-setup.adoc)
* [Admin App User Guide](./user-guide/CAAT-Admin-App-User-Guide.adoc)
* [Contractor App User Guide](./user-guide/CAAT-Contractor-App-User-Guide.adoc)
* [App Setup Guide (Azure Cloud)](./app-setup-guide-azure/index.adoc)
* [How to run the app on Codespaces](./app-setup-guide-codespaces/index.adoc)
* [API Docs](./apidocs/README.md)


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
   $ sudo gem install asciidoctor asciidoctor-diagram asciidoctor-multipage asciidoctor-pdf
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
