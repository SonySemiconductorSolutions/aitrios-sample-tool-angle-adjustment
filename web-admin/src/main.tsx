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
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // Import global styles
import "./i18n"; // Import internationalization configurations

import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/login/LoginPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { EditConfigurationPage } from "./pages/editConfiguration/EditConfigurationPage";
import { ReviewDetailsPage } from "./pages/reviewDetails/ReviewDetailsPage";
import { ReviewHistoryPage } from "./pages/reviewHistory/ReviewHistoryPage";
import { ConsoleConfigurationPage } from "./pages/consoleConfiguration/ConsoleConfigurationPage";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/review" element={<ReviewDetailsPage />} />
          <Route path="/review/history" element={<ReviewHistoryPage />} />
          <Route path="/console-configuration" element={<ConsoleConfigurationPage />} />
          <Route path="/console-configuration/edit" element={<EditConfigurationPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
