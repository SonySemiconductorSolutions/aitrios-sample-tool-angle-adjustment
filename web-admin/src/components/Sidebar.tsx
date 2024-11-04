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
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sheet,
  Typography,
  ListItemContent,
  ListItemButton,
  ListItem,
  List,
  IconButton,
  Box,
} from "@mui/joy";
import { HomeRounded, ViewListRounded, SettingsRounded, RateReviewRounded, EditRounded } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

export const Sidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation(); // Current location pathname
  const goHome = () => navigate("/"); // Function to navigate to home
  const { t } = useTranslation();

  return (
    <Sheet
      className="Sidebar"
      sx={{
        position: "sticky",
        zIndex: 10000,
        height: "100dvh",
        top: 0,
        p: 2,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: "255px",
        borderRight: "1px solid",
        borderColor: "divider",
        transition: "width 0.3s ease-in-out",
      }}
    >
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <IconButton variant="soft" color="primary" size="sm" onClick={goHome}>
          <HomeRounded />
        </IconButton>
        <Typography level="title-lg">
          { t("appTitleShort") }
          <Typography sx={{ pl: 1, fontSize: 14 }}>{ t("version") }</Typography>
        </Typography>
      </Box>
      <Box
        sx={{
          minHeight: 0,
          overflow: "hidden auto",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <List>
          <ListItem>
            <ListItemButton
              selected={pathname === "/"}
              onClick={() => navigate("/")}
            >
              <ViewListRounded />
              <ListItemContent>
                <Typography level="title-sm">{ t("sidebar.dashboard") }</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem sx={{ display: (pathname === "/review" || pathname === "/review/history") ? "flex" : "none"}}>
            <ListItemButton
              sx={{ pl: 4 }}
              selected={pathname === "/review" || pathname === "/review/history"}
            >
              <RateReviewRounded />
              <ListItemContent>
                <Typography level="title-sm">{ t("sidebar.reviewRequest") }</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton
              selected={pathname === "/console-configuration"}
              onClick={() => navigate("/console-configuration")}
            >
              <SettingsRounded />
              <ListItemContent>
                <Typography level="title-sm">{ t("sidebar.consoleConfiguration") }</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem sx={{ display: (pathname === "/console-configuration/edit") ? "flex" : "none"}}>
            <ListItemButton
              sx={{ pl: 4 }}
              selected={pathname === "/console-configuration/edit"}
            >
              <EditRounded />
              <ListItemContent>
                <Typography level="title-sm">{ t("sidebar.editConfiguration") }</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Sheet>
  );
};
