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

// API call to fetch the application list (latest reviews)
export const getLatestReviews = async (
  customerId: number | null,
  facilityName?: string,
  prefecture?: string | null,
  municipality?: string | null,
) => {
  try {
    if (customerId === null) return null;

    // Params are provided from the Dashboard search filter
    const res = await client.get("reviews/customers/" + customerId.toString() + "/latest", {
      params: {
        facility_name: facilityName,
        prefecture: prefecture,
        municipality: municipality,
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
export const getLatestReviewsThrottled = throttle(getLatestReviews, 500, {
  trailing: false,
});


// API call to fetch review details by id
export const getReviewById = async (id: number) => {
  try {
    const url = "reviews/" + id.toString();
    const res = await client.get(url);
    return res.data;
  } catch (err: any) {
    const error = err?.response?.data ?? err;
    console.warn(error.message);
    throw error;
  }
};


// API call to submit a review
const submitReview = async (reviewId: number, result: number, comment: string | null = null) => {
  try {
    const url = "reviews/" + reviewId.toString();
    const res = await client.put(url, {
      result: result,
      comment: comment,
    });
    return res.data;
  } catch (err: any) {
    const error = err?.response?.data ?? err;
    console.warn(error.message);
    throw error;
  }
};

export const approveReview = async (reviewId: number, result: number) => {
  return submitReview(reviewId, result, null)
};

export const rejectReview = async (reviewId: number, result: number, comment: string) => {
  return submitReview(reviewId, result, comment)
};


// API call to fetch the review history of a device
export const getDeviceReviewsHistory = async (
  deviceId: number,
  currentPage: number,
  perPage: number,
) => {
  try {
    const url = "reviews/devices/" + deviceId.toString() + "/history";
    // Pagination values are provided as params
    const res = await client.get(url, {
      params: {
        page: currentPage,
        page_size: perPage,
      }
    });
    return res.data;
  } catch (err: any) {
    const error = err?.response?.data ?? err;
    console.warn(error.message);
    throw error;
  }
};
