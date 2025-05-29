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
import { useState } from "react";
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
  Select,
  Option,
  Tooltip,
} from "@mui/joy";
import {
  DashboardRounded,
  SettingsRounded,
  RateReviewRounded,
  EditRounded,
  LogoutRounded,
  AccountCircleRounded,
  LanguageRounded,
  MenuRounded,
  PersonAddAlt1Rounded,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useStore } from "../store";
import i18next from "i18next";
import { AddAdmin } from "./AddAdmin";

export const Sidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { currentAccount, currentLanguage, setLanguage } = useStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openAddAdmin, setOpenAddAdmin] = useState(false);

  const toggleMenu = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Handles language change
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    i18next.changeLanguage(value);
  };

  // Logout function
  const logout = () => {
    const currentState = JSON.parse(localStorage.getItem("storage") || "{}")?.state;
    if (currentState) {
      const preservedState = {
        currentLanguage: currentState.currentLanguage,
        gridLine: currentState.gridLine,
      };
      localStorage.setItem("storage", JSON.stringify({ state: preservedState }));
    } else {
      localStorage.clear();
    }
    location.replace("/");
  };

  return (
    <>
      <Sheet
        className="Sidebar"
        sx={{
          position: "sticky",
          zIndex: 10000,
          height: "100dvh",
          top: 0,
          p: isCollapsed ? 1 : 2,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: isCollapsed ? 1 : 2,
          width: isCollapsed ? "60px" : "230px",
          borderRight: "1px solid",
          borderColor: "divider",
          transition: "width 0.3s ease-in-out, padding 0.3s ease-in-out, gap 0.3s ease-in-out",
          overflow: "visible",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "flex-start",
            mb: isCollapsed ? 1 : 0,
          }}
        >
          <IconButton
            data-testid="menuButton"
            variant="plain"
            color="neutral"
            size={isCollapsed ? "sm" : "sm"}
            onClick={toggleMenu}
            sx={{
              minWidth: isCollapsed ? "auto" : undefined,
              p: isCollapsed ? 0.8 : undefined,
            }}
          >
            <MenuRounded fontSize={isCollapsed ? "small" : "medium"} />
          </IconButton>
          <Typography
            level="title-lg"
            sx={{
              whiteSpace: "nowrap",
              overflow: isCollapsed ? "hidden" : "visible",
              opacity: isCollapsed ? 0 : 1,
              transition: "opacity 0.3s",
              maxWidth: isCollapsed ? 0 : "none",
            }}
          >
            {t("appTitleShort")}
            <Typography sx={{ pl: 1, fontSize: 14 }}>{t("version")}</Typography>
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
              <Tooltip
                title={t("sidebar.dashboard")}
                placement="right"
                variant="soft"
                sx={{
                  display: isCollapsed ? "block" : "none",
                  zIndex: 10001
                }}
              >
                <ListItemButton
                  data-testid="dashboardButton"
                  selected={pathname === "/"}
                  onClick={() => navigate("/")}
                  sx={{
                    justifyContent: isCollapsed ? "center" : "flex-start",
                    paddingLeft: isCollapsed ? 0 : undefined,
                  }}
                >
                  <DashboardRounded />
                  <ListItemContent sx={{ display: isCollapsed ? "none" : "block" }}>
                    <Typography level="title-sm">{t("sidebar.dashboard")}</Typography>
                  </ListItemContent>
                </ListItemButton>
              </Tooltip>
            </ListItem>
            <ListItem sx={{ display: pathname.includes("/reviews") ? "flex" : "none" }}>
              <Tooltip
                title={t("sidebar.reviewRequest")}
                placement="right"
                variant="soft"
                sx={{
                  display: isCollapsed ? "block" : "none",
                  zIndex: 10001
                }}
              >
                <ListItemButton
                  sx={{
                    pl: isCollapsed ? 0 : 4,
                    justifyContent: isCollapsed ? "center" : "flex-start",
                  }}
                  data-testid="reviewRequestButton"
                  selected={pathname.includes("/reviews")}
                >
                  <RateReviewRounded />
                  <ListItemContent sx={{ display: isCollapsed ? "none" : "block" }}>
                    <Typography level="title-sm">{t("sidebar.reviewRequest")}</Typography>
                  </ListItemContent>
                </ListItemButton>
              </Tooltip>
            </ListItem>
            <ListItem>
              <Tooltip
                title={t("sidebar.settings")}
                placement="right"
                variant="soft"
                sx={{
                  display: isCollapsed ? "block" : "none",
                  zIndex: 10001 // ここで直接zIndexを設定
                }}
              >
                <ListItemButton
                  data-testid="settingsButton"
                  selected={pathname === "/settings"}
                  onClick={() => navigate("/settings")}
                  sx={{
                    justifyContent: isCollapsed ? "center" : "flex-start",
                    paddingLeft: isCollapsed ? 0 : undefined,
                  }}
                >
                  <SettingsRounded />
                  <ListItemContent sx={{ display: isCollapsed ? "none" : "block" }}>
                    <Typography level="title-sm">{t("sidebar.settings")}</Typography>
                  </ListItemContent>
                </ListItemButton>
              </Tooltip>
            </ListItem>
            <ListItem sx={{ display: pathname.includes("/customers/generate-qr") ? "flex" : "none" }}>
              <Tooltip
                title={t("sidebar.generateQr")}
                placement="right"
                variant="soft"
                sx={{
                  display: isCollapsed ? "block" : "none",
                  zIndex: 10001
                }}
              >
                <ListItemButton
                  sx={{
                    pl: isCollapsed ? 0 : 4,
                    justifyContent: isCollapsed ? "center" : "flex-start",
                  }}
                  data-testid="generateQrButton"
                  selected={pathname.includes("/customers/generate-qr")}
                >
                  <EditRounded />
                  <ListItemContent sx={{ display: isCollapsed ? "none" : "block" }}>
                    <Typography level="title-sm">{t("sidebar.generateQr")}</Typography>
                  </ListItemContent>
                </ListItemButton>
              </Tooltip>
            </ListItem>
            <ListItem sx={{ display: pathname.includes("/customers/new") ? "flex" : "none" }}>
              <Tooltip
                title={t("sidebar.addCustomer")}
                placement="right"
                variant="soft"
                sx={{
                  display: isCollapsed ? "block" : "none",
                  zIndex: 10001
                }}
              >
                <ListItemButton
                  sx={{
                    pl: isCollapsed ? 0 : 4,
                    justifyContent: isCollapsed ? "center" : "flex-start",
                  }}
                  data-testid="addCustomerButton"
                  selected={pathname.includes("/customers/new")}
                >
                  <EditRounded />
                  <ListItemContent sx={{ display: isCollapsed ? "none" : "block" }}>
                    <Typography level="title-sm">{t("sidebar.addCustomer")}</Typography>
                  </ListItemContent>
                </ListItemButton>
              </Tooltip>
            </ListItem>
            <ListItem
              sx={{ display: pathname.includes("/console-credentials/edit") ? "flex" : "none" }}
            >
              <Tooltip
                title={t("sidebar.editCustomer")}
                placement="right"
                variant="soft"
                sx={{
                  display: isCollapsed ? "block" : "none",
                  zIndex: 10001
                }}
              >
                <ListItemButton
                  sx={{
                    pl: isCollapsed ? 0 : 4,
                    justifyContent: isCollapsed ? "center" : "flex-start",
                  }}
                  data-testid="editCustomerButton"
                  selected={pathname.includes("/console-credentials/edit")}
                >
                  <EditRounded />
                  <ListItemContent sx={{ display: isCollapsed ? "none" : "block" }}>
                    <Typography level="title-sm">{t("sidebar.editCustomer")}</Typography>
                  </ListItemContent>
                </ListItemButton>
              </Tooltip>
            </ListItem>
            <ListItem
              sx={{ display: pathname.includes("/customers/devices") ? "flex" : "none" }}
            >
              <Tooltip
                title={t("sidebar.manageDevices")}
                placement="right"
                variant="soft"
                sx={{
                  display: isCollapsed ? "block" : "none",
                  zIndex: 10001 // ここで直接zIndexを設定
                }}
              >
                <ListItemButton
                  sx={{
                    pl: isCollapsed ? 0 : 4,
                    justifyContent: isCollapsed ? "center" : "flex-start",
                  }}
                  data-testid="manageDevicesButton"
                  selected={pathname.includes("/customers/devices")}
                >
                  <EditRounded />
                  <ListItemContent sx={{ display: isCollapsed ? "none" : "block" }}>
                    <Typography level="title-sm">{t("sidebar.manageDevices")}</Typography>
                  </ListItemContent>
                </ListItemButton>
              </Tooltip>
            </ListItem>
          </List>
        </Box>
        <Box
          sx={{
            width: "100%",
            height: "1px",
            backgroundColor: "divider",
            opacity: 0.5,
          }}
        />
        <Typography
          level="title-sm"
          sx={{ display: isCollapsed ? "none" : "block" }}>
          {t("sidebar.admin.title")}
        </Typography>
        {isCollapsed ? (
          <Tooltip
            title={t("sidebar.admin.addAdmin")}
            placement="right"
            variant="soft"
            sx={{
              display: isCollapsed ? "block" : "none",
              zIndex: 10001
            }}
          >
            <IconButton
              size="sm"
              variant="soft"
              onClick={() => setOpenAddAdmin(true)}
              data-testid="add-admin-btn-collapsed"
              sx={{ alignSelf: "center" }}
            >
              <PersonAddAlt1Rounded />
            </IconButton>
          </Tooltip>
        ) : (
          <IconButton
            sx={{
              justifyContent: "flex-start",
              padding: "8px 12px",
              maxHeight: 48,
              gap: 1,
            }}
            size="sm"
            variant="soft"
            onClick={() => setOpenAddAdmin(true)}
            data-testid="add-admin-btn"
          >
            <PersonAddAlt1Rounded />
            <Typography level="title-sm">{t("sidebar.admin.addAdmin")}</Typography>
          </IconButton>
        )}
        <Box
          sx={{
            width: "100%",
            height: "1px",
            backgroundColor: "divider",
            opacity: 0.5,
          }}
        />
        <Typography
          level="title-sm"
          sx={{ display: isCollapsed ? "none" : "block" }}>
          {t("sidebar.account.title")}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            justifyContent: isCollapsed ? "center" : "flex-start",
          }}
        >
          <Tooltip
            title={currentAccount?.login_id || ""}
            placement="right"
            variant="soft"
            sx={{
              display: isCollapsed ? "block" : "none",
              zIndex: 10001
            }}
          >
            <Box sx={{
              display: "flex",
              alignItems: "center",
              maxWidth: 210,
              gap: 1,
              px: "12px"
            }}>
              <AccountCircleRounded />
              <Typography
                level="title-sm"
                sx={{ display: isCollapsed ? "none" : "block" }}
                noWrap
              >
                {currentAccount?.login_id}
              </Typography>
            </Box>
          </Tooltip>
        </Box>
        <Box
          sx={{
            position: "relative",
            mt: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            alignItems: isCollapsed ? "center" : "stretch",
          }}
        >
          {isCollapsed ? (
            <Tooltip
              title={currentLanguage === "jp" ? "日本語" : "English"}
              placement="right"
              variant="soft"
              sx={{
                display: isCollapsed ? "block" : "none",
                zIndex: 10001
              }}
            >
              <IconButton
                size="sm"
                variant="soft"
                sx={{ alignSelf: "center" }}
                onClick={() => {
                  const newLang = currentLanguage === "jp" ? "en" : "jp";
                  handleLanguageChange(newLang);
                }}
              >
                <LanguageRounded />
              </IconButton>
            </Tooltip>
          ) : (
            <div style={{ position: "relative", zIndex: 12000 }}>
              <Select
                startDecorator={<LanguageRounded />}
                value={currentLanguage}
                onChange={(_, value) => handleLanguageChange(value!)}
                variant="soft"
                size="sm"
                sx={{
                  padding: "8px 12px",
                  maxHeight: 48,
                  width: "100%",
                  fontSize: "var(--joy-fontSize-sm)",
                }}
                data-testid="language-select-dropdown"
                slotProps={{
                  listbox: {
                    sx: { zIndex: 12000 },
                  },
                }}
              >
                <Option value="jp">日本語</Option>
                <Option value="en">English</Option>
              </Select>
            </div>
          )}
        </Box>
        {isCollapsed ? (
          <Tooltip
            title={t("sidebar.account.logout")}
            placement="right"
            variant="soft"
            sx={{
              display: isCollapsed ? "block" : "none",
              zIndex: 10001
            }}
          >
            <IconButton
              size="sm"
              variant="soft"
              onClick={logout}
              data-testid="logout-btn-collapsed"
              sx={{ alignSelf: "center" }}
            >
              <LogoutRounded />
            </IconButton>
          </Tooltip>
        ) : (
          <IconButton
            sx={{
              justifyContent: "flex-start",
              padding: "8px 12px",
              maxHeight: 48,
              gap: 1,
            }}
            size="sm"
            variant="soft"
            onClick={logout}
            data-testid="logout-btn"
          >
            <LogoutRounded />
            <Typography level="title-sm">{t("sidebar.account.logout")}</Typography>
          </IconButton>
        )}
      </Sheet>
      <AddAdmin open={openAddAdmin} onClose={() => setOpenAddAdmin(false)} />
    </>
  );
};
