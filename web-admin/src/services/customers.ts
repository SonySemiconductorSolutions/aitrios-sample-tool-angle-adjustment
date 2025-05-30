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

// Interface for Customer console credentials
interface ConsoleCredentials {
  customerName: string;
  authUrl: string;
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  applicationId: string;
}

// API call to fetch the customers associated to admin
export const getCustomers = async () => {
  try {
    const res = await client.get("customers");
    return res.data;
  } catch (err: any) {
    const error = err?.response?.data ?? err;
    console.warn(error.message);
    return null;
  }
};

// API call to fetch console credentials of a customer
export const getConsoleCredentials = async (customerId: number) => {
  try {
    const url = "customers/" + customerId.toString() + "/console_credentials";
    const res = await client.get(url);
    return res.data;
  } catch (err: any) {
    const error = err?.response?.data ?? err;
    console.warn(error.message);
    throw error;
  }
};

// API call to update console credentials of a customer
export const updateConsoleCredentials = async (
  customerId: number,
  credentials: ConsoleCredentials,
) => {
  try {
    const url = "customers/" + customerId.toString() + "/console_credentials";
    const res = await client.put(url, {
      customer_name: credentials.customerName,
      auth_url: credentials.authUrl,
      base_url: credentials.baseUrl,
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      application_id: credentials.applicationId,
    });
    return res.data;
  } catch (err: any) {
    const error = err?.response?.data ?? err;
    console.warn(error.message);
    throw error;
  }
};

// API call to add new customer
export const addNewCustomer = async (credentials: ConsoleCredentials) => {
  try {
    const url = "customers";
    const res = await client.post(url, {
      customer_name: credentials.customerName,
      auth_url: credentials.authUrl,
      base_url: credentials.baseUrl,
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      application_id: credentials.applicationId,
    });
    return res.data;
  } catch (err: any) {
    const error = err?.response?.data ?? err;
    console.warn(error.message);
    throw error;
  }
};
