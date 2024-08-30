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
import { Dispatch, ReactNode } from "react";
import { createContext, useContextSelector } from "use-context-selector";
import { useImmerReducer } from "use-immer";
import { GlobalContextAction } from "./actions";
import { globalReducer } from "./reducers";
import { GlobalContextState, initialState } from "./states";

const GlobalContext = createContext<GlobalContextState>(initialState);

const GlobalDispatchContext = createContext<
  Dispatch<GlobalContextAction> | undefined
>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export function useGlobalState<T>(
  selector: (state: GlobalContextState) => T,
): T {
  return useContextSelector(GlobalContext, selector);
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGlobalDispatch() {
  const context = useContextSelector(GlobalDispatchContext, (state) => state);
  if (context === undefined) {
    throw new Error("GlobalDispatchContext is undefined");
  }
  return context;
}

interface GlobalContextProviderProps {
  children?: ReactNode;
}

export function GlobalContextProvider({
  children,
}: GlobalContextProviderProps) {
  const [state, dispatch] = useImmerReducer(globalReducer, initialState);

  return (
    <GlobalContext.Provider value={state}>
      <GlobalDispatchContext.Provider value={dispatch}>
        {children}
      </GlobalDispatchContext.Provider>
    </GlobalContext.Provider>
  );
}
