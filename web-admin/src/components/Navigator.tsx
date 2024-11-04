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
import { LogoutRounded, AccountCircleRounded, LanguageRounded } from "@mui/icons-material";
import { Box, IconButton, Typography, Select, Option, Tooltip } from "@mui/joy";
import { useStore } from "../store";
import { useTranslation } from "react-i18next";

export const Navigator = () => {
  const { currentAccount, currentLanguage, setLanguage } = useStore();
  const { t } = useTranslation();

  // Logout function
  const logout = () => {
    // Application store is managed by zustand package which uses the localStorage.
    // Please make necessary changes to the JSON object if zustand version is
    // upgrade and it has changes in the application store data structure.
    const currentState = JSON.parse(localStorage.getItem("storage") || "{}")?.state;
    if (currentState) {
      // Preserve 'currentLanguage' and 'gridLine'
      const preservedState = {
        currentLanguage: currentState.currentLanguage,
        gridLine: currentState.gridLine,
      };
      // Overwrite the state with only the preserved properties
      localStorage.setItem("storage", JSON.stringify({ state: preservedState }));
    } else {
      localStorage.clear();
    }
    location.replace("/");
  };

  // Handles language change
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        gap: 4,
        position: "fixed",
        top: 0,
        py: 2,
        px: "48px",
        marginBottom: "40px",
        zIndex: 999,
        right: 0,
        width: "calc(100% - 255px)",
        backgroundColor: "#fbfcfe",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Select
        startDecorator={<LanguageRounded />}
        value={currentLanguage}
        onChange={(_, value) => handleLanguageChange(value!)}
        variant="soft"
        size="sm"
        sx={{
          padding: "8px 12px",
          maxHeight: 48,
        }}
      >
        <Option value="jp">日本語</Option>
        <Option value="en">English</Option>
      </Select>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <AccountCircleRounded />
        <Tooltip
          title={currentAccount?.login_id}
          variant="outlined"
          sx={{ maxWidth: 300, zIndex: 12000 }}
        >
          <Typography sx={{ maxWidth: 240, fontSize: 14 }} noWrap>
            {currentAccount?.login_id}
          </Typography>
        </Tooltip>
      </Box>
      <IconButton
        sx={{
          display: "flex",
          justifyContent: "space-between",
          padding: "8px 12px",
          maxHeight: 48,
          gap: 1,
        }}
        size="sm"
        variant="soft"
        onClick={logout}
      >
        <Typography>{ t("navigator.logOut") }</Typography>
        <LogoutRounded />
      </IconButton>
    </Box>
  );
};
