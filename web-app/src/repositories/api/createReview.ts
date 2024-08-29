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

// Type of Request Params object
type ReqParams = {
  image: string;
  deviceId: number;
};

// Type of Response Payload object
type ResPayload = {
  data?: {
    review_id?: number;
  };
  message?: string;
  status_code: number;
  error_code: number;
};

// Create Review API
export async function createReview(params: ReqParams) {
  return client
    .post<ResPayload>("reviews", {
      image: params.image,
      device_id: params.deviceId,
    })
    .then((response) => {
      if (response?.data?.data?.review_id)
        return { reviewId: response.data.data.review_id, message: "" };
      else return { reviewId: null, message: response.data.message };
    })
    .catch((err) => {
      throw err.response.data.error_code || 10000;
    });
}
