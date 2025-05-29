/*
------------------------------------------------------------------------
Copyright 2025 Sony Semiconductor Solutions Corp. All rights reserved.

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

// API call to create new admin user
export const createNewAdmin = async (userId: string, password: string) => {
  try {
    const res = await client.post("admins", {
      login_id: userId,
      password,
    });
    return res.data;
  } catch (err: any) {
    const error = err?.response?.data ?? err;
    console.warn(error.message);
    throw error;
  }
};
