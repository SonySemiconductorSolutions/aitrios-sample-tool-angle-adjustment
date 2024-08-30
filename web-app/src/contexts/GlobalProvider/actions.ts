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
import { GlobalContextState } from "./states";

export const setCameraImage = (payload: GlobalContextState["cameraImage"]) => ({
  type: "setCameraImage" as const,
  payload,
});

export const setSampleImage = (payload: GlobalContextState["sampleImage"]) => ({
  type: "setSampleImage" as const,
  payload,
});

export const setFetchingImage = (
  payload: GlobalContextState["fetchingImage"],
) => ({
  type: "setFetchingImage" as const,
  payload,
});

export const setFacilityDetail = (payload: GlobalContextState["facility"]) => ({
  type: "setFacilityDetail" as const,
  payload,
});

export const setSelectedLanguage = (
  payload: GlobalContextState["selectedLanguage"],
) => ({
  type: "setSelectedLanguage" as const,
  payload,
});

export const setSelectedDevice = (payload: GlobalContextState["selectedDevice"]) => ({
  type: "setSelectedDevice" as const,
  payload,
});

export const unsetSelectedDevice = () => ({
  type: "unsetSelectedDevice" as const,
});

export const setAuthorized = (payload: GlobalContextState["isAuthorized"]) => ({
  type: "setAuthorized" as const,
  payload,
});

export type GlobalContextAction =
  | ReturnType<typeof setCameraImage>
  | ReturnType<typeof setSampleImage>
  | ReturnType<typeof setFetchingImage>
  | ReturnType<typeof setSelectedLanguage>
  | ReturnType<typeof setFacilityDetail>
  | ReturnType<typeof setSelectedDevice>
  | ReturnType<typeof unsetSelectedDevice>
  | ReturnType<typeof setAuthorized>;
