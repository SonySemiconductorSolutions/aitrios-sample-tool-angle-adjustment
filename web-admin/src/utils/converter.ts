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

// Converts a numeric status to a corresponding status string
export const statusToString = (
  status: number | undefined,
): string => {
  if (status == null) return "initialState";

  const mapping: Record<number, string> = {
    1: "initialState",
    2: "requesting",
    3: "rejected",
    4: "approved",
  };

  return mapping[status] || "initialState";
};

// Gets the color associated with a device connection status
export const getDeviceStatusColor = (
  status: string
) => {
  switch (status) {
    case "Connected":
      return "green";
    case "Disconnected":
      return "red";
    default:
      return "grey";
  }
};

// Formats a date string into a Japanese date and time format
export const formatDatetime = (
  dateString: string | undefined,
): string | null => {
  if (!dateString) return null;
  const datetime = Date.parse(dateString);
  return Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(datetime);
};
