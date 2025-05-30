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
import { Typography, Box } from "@mui/joy";
import CustomersTable from "./components/CustomersTable";
import { useTranslation } from "react-i18next";

export const SettingsPage = () => {

  const { t } = useTranslation();

  return (
    <>
      <Box
        sx={{
          display: "flex",
          mt: { xs: 2, md: 0 },
          mb: 1,
          gap: 1,
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "start", sm: "center" },
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        <Typography level="h2" component="h1">{ t("settingsPage.settings") }</Typography>
      </Box>
      <CustomersTable />
    </>
  );
};
