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

// インターフェース定義
export interface DeviceType {
  id: number;
  name: string;
  sample_image_blob?: string;
}

interface BaseResponse<T> {
  data: T;
  message: string;
  status_code: number;
  total?: number;
}

export interface DeviceTypeListResponse extends BaseResponse<DeviceType[]> {}
export interface DeviceTypeResponse extends BaseResponse<DeviceType> {}

// デバイスタイプ一覧取得
export const getDeviceTypes = async (): Promise<DeviceType[]> => {
  try {
    const res = await client.get("device-types");
    return res.data.data;
  } catch (err: any) {
    const error = err?.response?.data ?? err;
    console.warn("Error fetching device types:", error);
    throw error;
  }
};

// デバイスタイプ取得
export const getDeviceTypeById = async (
  deviceTypeId: number,
): Promise<DeviceType | null> => {
  try {
    const res = await client.get(`device-types/${deviceTypeId}`);
    return res.data.data;
  } catch (err: any) {
    const error = err?.response?.data ?? err;
    console.warn("Error fetching device type:", error);
    throw error;
  }
};

// デバイスタイプ作成
export const createDeviceType = async (
  name: string,
  referenceImage: string,
): Promise<DeviceType> => {
  try {
    if (!name || name.trim() === "") {
      throw new Error("Device type name is required and cannot be empty");
    }
    if (!referenceImage || referenceImage.trim() === "") {
      throw new Error("Reference image is required and cannot be empty");
    }

    const res = await client.post("device-types", {
      name,
      reference_image: referenceImage,
    });
    return res.data.data;
  } catch (err: any) {
    const error = err?.response?.data ?? err;
    console.warn("Error creating device type:", error);
    throw error;
  }
};

// デバイスタイプ編集
export const editDeviceType = async (
  id: number,
  name: string,
  referenceImage: string,
): Promise<DeviceType> => {
  try {
    if (!name || name.trim() === "") {
      throw new Error("Device type name is required and cannot be empty");
    }
    if (!referenceImage || referenceImage.trim() === "") {
      throw new Error("Reference image is required and cannot be empty");
    }

    const res = await client.put(`device-types/${id}`, {
      name,
      reference_image: referenceImage,
    });
    return res.data.data;
  } catch (err: any) {
    const error = err?.response?.data ?? err;
    console.warn("Error editing device type:", error);
    throw error;
  }
};
