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
import { client } from "./client";
import throttle from "lodash/throttle";

// API call to fetch the device connection state of all the devices associated to a customer
export const getDeviceStatus = async (
  customerId: number | null,
  currentPage: number,
  perPage: number,
  facilityName?: string,
  prefecture?: string | null,
  municipality?: string,
  status?: string | null,
) => {
  try {
    if (customerId === null) return null;

    // Params are provided from the Dashboard search filter
    const res = await client.get("devices/status", {
      params: {
        customer_id: customerId,
        page: currentPage,
        page_size: perPage,
        facility_name: facilityName,
        prefecture: prefecture,
        municipality: municipality,
        status: status,
      },
    });
    return res.data;
  } catch (err: any) {
    const error = err?.response?.data ?? err;
    console.warn(error.message);
    throw error;
  }
};

// A new request won't be created since 500ms from previous request for avoid spaming
export const getDeviceStatusThrottled = throttle(getDeviceStatus, 500, {
  trailing: false,
});
