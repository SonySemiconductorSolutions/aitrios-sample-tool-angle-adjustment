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

// Interface for states of checkboxes
interface CheckboxStates {
  initialState: boolean;
  requesting: boolean;
  rejected: boolean;
  approved: boolean;
}

// Initial state for checkboxes
const checkboxInitState: CheckboxStates = {
  initialState: false,
  requesting: false,
  rejected: false,
  approved: false,
};

// Function to get checkbox states from status string
export const getCheckboxState = (status: string | null) => {
  if (!status) return checkboxInitState;

  const newCheckboxStates: CheckboxStates = { ...checkboxInitState };
  const mappingState: Record<string, keyof CheckboxStates> = {
    "1": "initialState",
    "2": "requesting",
    "3": "rejected",
    "4": "approved",
  };

  status.split(",").forEach((element) => {
    const key = mappingState[element.trim()];
    newCheckboxStates[key] = true;
  });
  return newCheckboxStates;
};

// Function to convert checkbox states back to status string
export const getStatusString = (checkboxState: CheckboxStates) => {
  const statusArray: string[] = [];
  if (checkboxState.initialState) statusArray.push("1");
  if (checkboxState.requesting) statusArray.push("2");
  if (checkboxState.rejected) statusArray.push("3");
  if (checkboxState.approved) statusArray.push("4");
  return statusArray.join(",");
};
