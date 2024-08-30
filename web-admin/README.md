# Admin App - Frontend

## Requirements

- node >= 18.19
- npm

## Quick start

### Prepare environment

> The following commands assume `web-admin` as current working directory.

1. Make a copy of example env as following
   ```
   # from web-admin
   $ cp .env.example .env
   ```

2. populate environment variables (`.env`)
   * Replace VITE_API_URL value with server URL that is hosted.
   Example VITE_API_URL looks like:
   ```
   # if localhost
   VITE_API_URL=http://localhost:8000
   # or
   VITE_API_URL=http://127.0.0.1:8000
   # if IP
   VITE_API_URL=http://172.16.5.4:8000
   # if GitHub codespaces
   VITE_API_URL=https://effective-space-garbanzo-7jwgv746j9q3rqqr-8000.app.github.dev
   ```

### Start development server

#### Using npm

1. Install dependencies
  ```
  # from web-admin
  $ npm install
  ```

2. Build and Serve App
  ```
  # from web-admin
  $ npm run dev
  ```

#### Using docker

1. Build docker image

  ```shell
  # from web-admin
  $ docker build -f Dockerfile -t caat-webadmin:latest .
  ```

2. Run docker container

  ```shell
  # from web-admin
  $ docker run -p 3001:3000 caat-webadmin:latest
  ```

> Note: Forward port 3001 from the host machine

## Linting and Formatting

### Linting

ESLint is used to maintain a consistent code style and catch potential issues in JavaScript/TypeScript code.

To run ESLint and check for any linting errors, use the following command:
  ```
  # from web-admin
  $ npm run lint
  ```

### Formatting

Prettier is used to format code and ensure a consistent style.

To check if code is properly formatted, use the following command:
  ```
  # from web-admin
  $ npm run format
  ```
