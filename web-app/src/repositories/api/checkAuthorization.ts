/*
------------------------------------------------------------------------
Copyright 2024 Sony Semiconductor Solutions Corp. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
------------------------------------------------------------------------
*/
import { client } from "../client";
import { BaseResPayload } from "./common";

// Type of Request Params object
type ReqParams = {
  token: string; // Auth token
};

// Type of Response Payload object
type ResPayload = BaseResPayload & {
  message: string; // message
  status_code: number; // HTTP status code
  error_code: number; // Custom error status code
  facility_name: string; // facility name
  municipality: string; // municipality
  prefecture: string; // prefecture
};

// Validating auth API
export function checkAuth(params: ReqParams) {
  setAccessToken(params.token);
  return client
    .post<ResPayload>(`auth/facility`)
    .then((response) => response.data)
    .catch((error) => {
      throw error.response?.data?.error_code || 10000;
    });
}

// Method to set authorization token in all the request headers
export function setAccessToken(token?: string): void {
  if (token) {
    client.defaults.headers["Authorization"] = "Bearer " + token;
    return;
  }
  client.defaults.headers["Authorization"] = "";
}

// Retrying auth API
export function retryAuth() {
  return client
    .post<ResPayload>(`auth/facility`)
    .then((response) => response?.data);
}
