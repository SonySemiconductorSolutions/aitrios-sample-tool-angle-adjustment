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
import { GridLineProps, MERGE_STATE, StoreState } from "../types";

// Initial state for the gridLine slice
const initState: { gridLine: GridLineProps } = {
  gridLine: {
    color: "#ffffff",
    visibility: false,
  },
};

export const gridLineSlice = (set: any) => ({
  ...initState,

  setGridLineColor: (color: string) => {
    set(
      (state: StoreState) => {
        state.gridLine = { ...state.gridLine, color: color }; // Update gridLine color in the store state
      },
      MERGE_STATE,
      "gridLine/setGridLineColor",
    );
  },

  setGridLineVisibility: (visibility: boolean) => {
    set(
      (state: StoreState) => {
        state.gridLine = { ...state.gridLine, visibility: visibility }; // Update gridLine visibility in the store state
      },
      MERGE_STATE,
      "gridLine/setGridLineVisibility",
    );
  },
});
