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

// Type of Device object
type device = {
  id: number;
  result: number;
  device_name: string;
  submission_status: number;
};

// Type of Response Payload object
type ResPayload = {
  status_code: number;
  error_code: number;
  message?: string;
  devices: device[];
};

// Fetch Devices API
export async function fetchFacilityDevices() {
  return client
    .get<ResPayload>("facility/devices")
    .then((response) => {
      if (response?.data?.devices?.length) return response.data;
      else return { devices: [] };
    })
    .catch((err) => {
      console.error(
        "Error in get facility devices: ",
        err?.response?.data?.message,
      );
      throw err?.response?.data?.error_code || 10000;
    });
}
