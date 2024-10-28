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

export const updateDeviceTypeReferenceImage = async (
    deviceTypeId: number | undefined,
    referenceImage: string,
) => {
    try {
        if (!deviceTypeId) return;

        const url = "device-types/" + deviceTypeId.toString() + "/reference-image";
        const res = await client.put(url, {
            reference_image: referenceImage,
        });
        return res.data;
    } catch (err: any) {
        const error = err?.response?.data ?? err;
        console.warn(error.message);
        throw error;
    }
};
