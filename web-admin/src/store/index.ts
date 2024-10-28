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
import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { StoreState } from "./types";
import { accountSlice } from "./slices/account";
import { filterSlice } from "./slices/filter";
import { gridLineSlice } from "./slices/gridline";
import { dashboardSlice } from "./slices/dashboard";
import { customersSlice } from "./slices/customers";
import { languageSlice } from "./slices/language";

// Creating a Zustand store instance with devtools, persistence, and immutability support
export const useStore = create<StoreState>()(
  devtools(
    immer(
      persist(
        (set) => ({
          ...accountSlice(set),
          ...filterSlice(set),
          ...gridLineSlice(set),
          ...dashboardSlice(set),
          ...customersSlice(set),
          ...languageSlice(set),
        }),
        {
          name: "storage",
          storage: createJSONStorage(() => localStorage),
        },
      ),
    ),
  ),
);
