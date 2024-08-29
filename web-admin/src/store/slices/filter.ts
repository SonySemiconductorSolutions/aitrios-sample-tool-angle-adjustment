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
import { FilterProps, MERGE_STATE, StoreState } from "../types";

// Initial state for the filter slice
const initState = {
  filter: {
    customerId: null,
    facilityName: "",
    prefecture: "",
    municipality: "",
  },
};

export const filterSlice = (set: any) => ({
  ...initState,

  setFilter: (filter: FilterProps) => {
    set(
      (state: StoreState) => {
        state.filter = filter;  // Update filter in the store state
      },
      MERGE_STATE,
      "filter/setFilter",
    );
  },
});
