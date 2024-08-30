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
import assertUnreachable from "src/utils/assertUnreachable";
import { GlobalContextAction } from "./actions";
import { GlobalContextState } from "./states";

export const globalReducer = (
  draft: GlobalContextState,
  action: GlobalContextAction,
) => {
  switch (action.type) {
    case "setCameraImage": {
      draft.cameraImage = action.payload;
      break;
    }
    case "setSampleImage": {
      draft.sampleImage = action.payload;
      break;
    }
    case "setFetchingImage": {
      draft.fetchingImage = action.payload;
      break;
    }
    case "setFacilityDetail": {
      draft.facility = action.payload;
      break;
    }
    case "setSelectedLanguage": {
      draft.selectedLanguage = action.payload;
      break;
    }
    case "setSelectedDevice": {
      draft.selectedDevice = action.payload;
      break;
    }
    case "unsetSelectedDevice": {
      draft.selectedDevice = undefined;
      break;
    }
    case "setAuthorized": {
      draft.isAuthorized = action.payload;
      break;
    }
    default:
      assertUnreachable(action, "Unknown Global action type.");
  }
};
