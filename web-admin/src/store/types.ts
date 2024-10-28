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
// Merging state changes instead of rewriting state
export const MERGE_STATE = false;

// Represents a Customer entity
export interface Customer {
  id: number;
  customerName: string;
  lastUpdatedBy: string;
  lastUpdatedTime: string;
}

// Represents an Account entity
export interface Account {
  id: number;
  login_id: string;
  token: string;
}

// Represents filter properties
export interface FilterProps {
  customerId: number | null;
  facilityName: string;
  prefecture: string | null;
  municipality: string;
  status: string | null;
}

export type ViewType = "list" | "grid";
export type GridType = "small" | "medium" | "large";

// Represents a Dashboard entity
export interface DashboardProps {
  viewType: ViewType;
  gridType: GridType;
  currentPage: number;
}

// Represents gridLine properties
export interface GridLineProps {
  color: string;
  visibility: boolean;
}

// Represents the overall state of the store
export interface StoreState {

  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;

  currentLanguage: string;
  setLanguage: (language: string) => void;

  currentAccount: Account | null;
  setAccount: (account: Account | null) => void;

  filter: FilterProps;
  setFilter: (filter: FilterProps) => void;
  setSingleFilter: (filter: { key: string, value: string }) => void;

  dashboard: DashboardProps;
  setViewType: (viewType: ViewType) => void;
  setGridType: (gridType: GridType) => void;
  setCurrentPage: (currentPage: number) => void;

  gridLine: GridLineProps;
  setGridLineColor: (color: string) => void;
  setGridLineVisibility: (visibility: boolean) => void;
}
