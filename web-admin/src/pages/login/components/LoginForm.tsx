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
import { Key, Person, Visibility, VisibilityOff, LanguageRounded } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Input,
  Stack,
  Select,
  Option,
  Typography,
} from "@mui/joy";
import React, { useState } from "react";
import { login } from "../../../services";
import { useStore } from "../../../store";
import { useTranslation } from "react-i18next";
import { InputAdornment, IconButton } from "@mui/material";

export const LoginForm = () => {
  const { setAccount, currentLanguage, setLanguage } = useStore();
  const { t } = useTranslation();
  
  const errorCodes: Record<number, string> = t("errorCodes", { returnObjects: true });

  // State variables
  const [form, setForm] = useState({userId: "", pass: ""});
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handles login submission
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.userId || !form.pass || isLoading) return;
    setIsLoading(true);

    await login(form.userId, form.pass)
      .then((response) => {
        setAccount(response.data);
      })
      .catch((err) => {
        handleError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Handles input change in login credentials
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    value && setForm({ ...form, [name]: value });
  };

  // Prevents default behavior of mouse down
  const handleMouseDownPassword = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  // Handles visibility toggle
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  // Handles language change
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
  };

  // Handles errors during login
  const handleError = (error: any) => {
    if (error?.error_code && error.error_code in errorCodes) {
      setErrorMessage(`errorCodes.${error.error_code}`);
    } else {
      setErrorMessage("errorCodes.10000");
    }
    setAccount(null);
  };

  return (
    <>
      <Box sx={{ position: "absolute", right: 0, p: 4 }}>
        <Select
          startDecorator={<LanguageRounded />}
          value={currentLanguage}
          onChange={(_, value) => handleLanguageChange(value!)}
          variant="soft"
          size="sm"
          data-testid="language-select-dropdown"
          sx={{ padding: "8px 12px", minWidth: 120, }}
        >
          <Option value="jp">日本語</Option>
          <Option value="en">English</Option>
        </Select>
      </Box>
      <Box
        sx={{
          my: "auto",
          width: 600,
          "& form": {
            display: "flex",
            flexDirection: "column",
            gap: 2,
          },
          "& label, h1": {
            color: "whitesmoke",
          },
        }}
      >
        <Stack gap={4} sx={{ mb: 2, paddingBottom: 12 }}>
          <Typography textAlign="center" level="h1">
            {t("appTitle")}
          </Typography>
        </Stack>

        <Stack>
          <form onSubmit={onSubmit}>
            <Stack sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
              <Stack sx={{ display: "flex", flexGrow: 1, gap: 4 }}>
                <Typography sx={{ flexGrow: 1, color: "white" }} level="h3">
                  {t("loginPage.loginId")}:
                </Typography>
                <Typography
                  sx={{ flexGrow: 1, color: "white" }}
                  color="neutral"
                  level="h3"
                >
                  {t("loginPage.pass")}:
                </Typography>
              </Stack>
              <Stack sx={{ display: "flex", flexGrow: 8, gap: 4 }}>
                <Input
                  type="text"
                  name="userId"
                  slotProps={{ "input": { maxLength: 255 } }}
                  required
                  onChange={onChange}
                  data-testid="login-id-input"
                  startDecorator={<Person />}
                />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="pass"
                  slotProps={{ "input": { maxLength: 255 } }}
                  data-testid="login-pass-input"
                  startDecorator={<Key />}
                  endDecorator={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  required
                  onChange={onChange}
                />
              </Stack>
            </Stack>

            <Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row-reverse",
                  alignItems: "center",
                  justifyContent: "center",
                  flexGrow: 1,
                  mt: 3,
                }}
              >
                {errorMessage && (
                  <Typography sx={{ color: "#F47174" }}>
                    {t(errorMessage)}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Box
                sx={{
                  gap: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mt: 3,
                }}
              >
                <Button
                  type="submit"
                  size="lg"
                  sx={{ width: 400, height: 50 }}
                  data-testid="login-btn"
                >
                  {isLoading ? <CircularProgress variant="soft" /> : t("loginPage.login")}
                </Button>
              </Box>
            </Box>
          </form>
        </Stack>
      </Box>
    </>
  );
};
