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
import { Box, IconButton, Typography, Select, Option } from "@mui/joy";
import { useStore } from "../store";
import { useTranslation } from "react-i18next";

export const Navigator = () => {
  const { currentAccount, currentLanguage, setLanguage } = useStore();
  const { t } = useTranslation();

  // Logout function
  const logout = () => {
    // Clear local storage and redirect to root
    localStorage.clear();
    location.href = "/";
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
        marginBot: "40px",
        zIndex: 999,
        right: 0,
        width: "calc(100% - 230px)",
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
        sx={{ padding: "8px 12px" }}
      >
        <Option value="jp">日本語</Option>
        <Option value="en">English</Option>
      </Select>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography
          sx={{
            maxWidth: 240,
            wordBreak: "break-all",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <AccountCircleRounded /> {currentAccount?.login_id}
        </Typography>
      </Box>
      <IconButton
        sx={{
          display: "flex",
          justifyContent: "space-between",
          padding: "8px 12px",
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
