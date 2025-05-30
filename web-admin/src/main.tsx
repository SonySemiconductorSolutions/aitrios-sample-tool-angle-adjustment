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
import { NotFound } from "./components/NotFound";
import { LoginPage } from "./pages/login/LoginPage";
import { SettingsPage } from "./pages/settings/SettingsPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { GenerateQrPage } from "./pages/generateQr/GenerateQrPage";
import { ReviewDetailsPage } from "./pages/reviewDetails/ReviewDetailsPage";
import { ReviewHistoryPage } from "./pages/reviewHistory/ReviewHistoryPage";
import { ManageDevicesPage } from "./pages/manageDevices/ManageDevicesPage";
import { ConsoleCredentialsPage } from "./pages/consoleCredentials/ConsoleCredentialsPage";
// Import DateTimePicker and its dependencies
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const App = () => {
  return (
    <React.StrictMode>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/reviews/:reviewId" element={<ReviewDetailsPage />} />
              <Route path="/reviews/devices/:deviceId/history" element={<ReviewHistoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/settings/customers/new" element={<ConsoleCredentialsPage />} />
              <Route path="/settings/customers/generate-qr" element={<GenerateQrPage />} />
              <Route path="/settings/customers/:customerId/console-credentials/edit" element={<ConsoleCredentialsPage />} />
              <Route path="/settings/customers/devices" element={<ManageDevicesPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </BrowserRouter>
      </LocalizationProvider>
    </React.StrictMode>
  );
};

// Render the App component only if this file is the entry point
if (document.getElementById("root")) {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<App />);
}

export default App;
