# Angle Adjustment Tool (AAT)

## Contents
- [Overview](#overview)
    - [Entities using the AAT](#entities-using-the-aat)
- [Components](#components)
- [System requirements (Local Development)](#system-requirements-local-development)
    - [Hardware requirements](#hardware-requirements)
    - [Software requirements](#software-requirements)
- [Documentation](#documentation)
    - [Release Artifact](#release-artifact)
    - [Build documentation (Optional)](#build-documentation-optional)
- [Tested on](#tested-on)
- [License](#license)
- [Get support](#get-support)
- [See also](#see-also)
- [Trademark](#trademark)
- [Versioning](#versioning)
- [Branch](#branch)
- [Security](#security)

## Overview

* AAT is a web-based application designed to streamline the adjustment and verification of camera angle of devices connected to AITRIOS.

## Entities using the AAT

AAT involves following entities:
* Contractor - The one who adjusts the camera angle in the actual facilities.
* Admin - The one who verifies the camera angle.

## Components

AAT involves following components:

* [Backend Server](./backend/): A common backend server to serve contractor and admin API requests.
* [Admin App](./web-admin/): Desktop web application for admin to verify the angle of view and either approve or reject the review request.
* [Contractor App](./web-app/): Mobile web application for contractor to adjust the camera angle and submit the angle of view for review.

## System requirements (Local Development)

### Hardware requirements

* 16GB RAM or more

### Software requirements

* Ubuntu 20.04 or higher
* Node.js (v20.x)
* Python 3.10.x
* Docker CLI

## Documentation

Documentation contains following:
* Instructions to setup the development environment
* User Guide for both Contractor and Admin App
* Instructions to host app in Azure Cloud
* Instructions to host app in AWS Cloud
* Instructions to host app in GitHub Codespaces


### Release Artifact

* To view the documents locally, download the artifact `User-Documentation-Guide-HTML.zip` from the latest releases.
* Extract the downloaded artifact and files will be extracted to `User-Documentation-Guide-HTML` directory.
* Open `index.html` in any browser to view the documents.

### Build documentation (Optional)

* To build and view the documents, please see: [Docs](./docsrc/README.md)

## Tested on

AAT is tested on AITRIOS DirectDeveloper_ed_v1.8.1 and Enterprise_ed_v1.7.0.

## License

* This repository is licensed under Apache 2.0. See: [Apache License](./LICENSE)

## Get support
- [Contact us](https://developer.aitrios.sony-semicon.com/en/edge-ai-sensing/contact-us/)

## See also
- [Developer Site](https://developer.aitrios.sony-semicon.com/en/edge-ai-sensing/)

## Trademark
- [Read This First](https://developer.aitrios.sony-semicon.com/en/edge-ai-sensing/documents/read-this-first/)

## Versioning

This repository aims to adhere to Semantic Versioning 2.0.0.

## Branch

See the "**Release Note**" from [**Releases**] for this repository.

Each release is generated in the main branch. Pre-releases are generated in the develop branch. Releases will not be provided by other branches.

## Security
Before using Codespaces, please read the Site Policy of GitHub and understand the usage conditions.
