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
import axios, { AxiosError, AxiosInstance } from "axios";

class ApiClient {
  client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL, // Base URL from environment variables
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      timeout: 60000, // API requests timeout set to 60 seconds
    });

    this.client.interceptors.request.use(function (config) {
      // Attach token from localStorage to Authorization header
      const token = JSON.parse(localStorage.getItem("storage") ?? "{}").state
        ?.currentAccount?.token;

      config.headers.Authorization = token ? `Bearer ${token}` : "";
      return config;
    });

    this.client.interceptors.response.use(
      function (response) {
        return response;
      },
      function (error: AxiosError) {
        // If unauthorized error, clear storage and redirect to home
        if (error?.response?.status === 401 && error?.config?.url !== "auth/login") {
          // Application store is managed by zustand package which uses the localStorage.
          // Please make necessary changes to the JSON object if zustand version is
          // upgrade and it has changes in the application store data structure.
          const currentState = JSON.parse(localStorage.getItem("storage") || "{}")?.state;
          if (currentState) {
            // Preserve 'currentLanguage' and 'gridLine'
            const preservedState = {
              currentLanguage: currentState.currentLanguage,
              gridLine: currentState.gridLine,
            };
            // Overwrite the state with only the preserved properties
            localStorage.setItem("storage", JSON.stringify({ state: preservedState }));
          } else {
            localStorage.clear();
          }
          location.replace("/");
        }

        // Handle network error
        if (error?.code === "ERR_NETWORK") {
          return Promise.reject({ error_code: "ERR_NETWORK", message: error.message });
        }

        return Promise.reject(error);
      },
    );
  }
}

export const client = new ApiClient().client; // Export the Axios client instance
