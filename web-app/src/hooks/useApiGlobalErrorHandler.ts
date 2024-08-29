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
import { AxiosError, AxiosResponse } from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BaseResPayload } from "src/repositories/api";
import { client } from "src/repositories/client";

const UNAUTHORIZED = 401; // Unauthorized error code
const NO_INTERNET_ERROR_CODE = "ERR_NETWORK"; // No Internet error code
const NO_INTERNET_ERROR_MSG = "Network Error"; // No Internet error message

// API Global error handler to check error and proceed accordingly
export default function useApiGlobalErrorHandler() {
  const navigate = useNavigate();

  // Method to handle navigation to the error page with error data
  const handleNavigation = (error: AxiosError<BaseResPayload, any>) => {
    if (error?.response?.status === UNAUTHORIZED && error?.response?.data?.status_code === UNAUTHORIZED) return error.response.data;
    else if (error?.code === NO_INTERNET_ERROR_CODE && error?.message === NO_INTERNET_ERROR_MSG) return { error_code: error.code };
    return false;
  };

  // Method called to get error from Axios Response and call handleNavigation
  // method to check condition and redirect to error page when required
  useEffect(() => {
    client.interceptors.response.use(
      (response: AxiosResponse<BaseResPayload>) => response,
      async (error: AxiosError<BaseResPayload>) => {
        const getNavError = handleNavigation(error);
        if (getNavError) {
          if (typeof getNavError === "object" && getNavError?.error_code) navigate("/error", { state: getNavError });
          else navigate("/error");
        }
        else return Promise.reject(error);
      },
    );
  });
}
