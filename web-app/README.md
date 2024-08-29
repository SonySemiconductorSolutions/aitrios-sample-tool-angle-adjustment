# Contractor App - Frontend

## Requirements

- node >= 18.19
- npm

## Quick start

### Prepare environment

> The following commands assume `web-app` as current working directory.

1. Make a copy of example env as following
   ```
   # from web-app
   $ cp .env.example .env
   ```

2. populate environment variables (`.env`)
  * Replace REACT_APP_API_BASE_URL value with server URL that is hosted.
  Example REACT_APP_API_BASE_URL looks like:
  ```
  # from web-app
  # if localhost
  REACT_APP_API_BASE_URL=http://localhost:8000
  # or
  REACT_APP_API_BASE_URL=http://127.0.0.1:8000
  # if IP
  REACT_APP_API_BASE_URL=http://172.16.5.4:8000
  # if GitHub codespaces
  REACT_APP_API_BASE_URL=https://effective-space-garbanzo-7jwgv746j9q3rqqr-8000.app.github.dev
  ```


### Start development server

#### Using npm

1. Install dependencies
  ```
  # from web-app
  $ npm install
  ```

2. Build and Serve App
  ```
  # from web-app
  $ npm run dev
  ```

#### Using docker

1. Build docker image

  ```shell
  # from web-app
  $ docker build -f Dockerfile -t caat-webapp:latest .
  ```

2. Run docker container

  ```shell
  # from web-app
  $ docker run -p 3001:3000 caat-webapp:latest
  ```

## Linting and Formatting

### Linting

ESLint is used to maintain a consistent code style and catch potential issues in JavaScript/TypeScript code.

To run ESLint and check for any linting errors, use the following command:
  ```
  # from web-app
  $ npm run lint
  ```

### Formatting

Prettier is used to format code and ensure a consistent style.

To check if code is properly formatted, use the following command:
  ```
  # from web-app
  $ npm run format
  ```
