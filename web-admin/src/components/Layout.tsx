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
import { useEffect } from "react";
import { Box } from "@mui/joy";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { useStore } from "../store";
import { Sidebar } from "./Sidebar";
import { BackgroundContainer } from "./BackgroundContainer";
import { Navigator } from "./Navigator";
import { getCustomers } from "../services";

// Interface for Customer details from Response payload
interface CustomerResponse {
  id: number;
  customer_name: string;
  last_updated_by: string;
  last_updated_at_utc: string;
}

export const Layout = () => {
  const { currentAccount, setCustomers } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetches customers data when currentAccount changes
  const fetchCustomers = async () => {
    if (!currentAccount) return;

    const customers = await getCustomers();
    if (customers?.data?.length) {
      setCustomers(customers.data.map((value: CustomerResponse) => ({
        id: value.id,
        customerName: value.customer_name,
        lastUpdatedBy: value.last_updated_by,
        lastUpdatedTime: value.last_updated_at_utc,
      })));
    }
  };

  useEffect(() => {
      fetchCustomers();
  }, [currentAccount]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Redirects to login if no currentAccount and not on login page
    if (!currentAccount && location.pathname !== "login") navigate("login");
  }, [location.pathname, currentAccount, navigate]);

  if (!currentAccount) {
    return <BackgroundContainer />; // Renders background container if no currentAccount
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100dvh" }}>
      {currentAccount && <Sidebar />}
      <Box
        component="main"
        className="MainContent"
        sx={{
          px: { xs: 2, md: 6 },
          pt: {
            xs: "calc(12px + var(--Header-height))",
            sm: "calc(12px + var(--Header-height))",
            md: 3,
          },
          pb: { xs: 2, sm: 2, md: 3 },
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          height: "100dvh",
          gap: 1,
          overflowY: "scroll",
        }}
      >
        {currentAccount && <Navigator />}
        <Box sx={{ marginTop: currentAccount ? "60px" : 0 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
