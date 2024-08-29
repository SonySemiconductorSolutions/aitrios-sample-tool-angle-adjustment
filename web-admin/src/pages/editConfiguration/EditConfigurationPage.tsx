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
import { ChangeEvent, useState, useEffect } from "react";
import { Alert, Button, CircularProgress, Card, FormHelperText, Typography, useTheme } from "@mui/joy";
import { Backdrop, Box, FormGroup, TextField, Stack, IconButton } from "@mui/material";
import { ArrowBackIosRounded, AssignmentTurnedInRounded, ErrorRounded } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { stringDifference } from "../../utils";
import { getConsoleCredentials, updateConsoleCredentials } from "../../services";
import { useTranslation } from "react-i18next";

// Interface for console credentials
interface ConsoleCredentials {
  authUrl: string;
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  applicationId: string;
}

// Constants
const CHARACTER_LIMIT = 255;
const NAVIGATE_TIMEOUT = 3000;

export const EditConfigurationPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { t } = useTranslation();

  const errorCodes: Record<number, string> = t("errorCodes", { returnObjects: true });

  // State variables
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const defaultFormData: ConsoleCredentials = {
    authUrl: "",
    baseUrl: "",
    clientId: "",
    clientSecret: "",
    applicationId: "",
  };
  const [formData, setFormData] = useState<ConsoleCredentials>(defaultFormData);
  const [initialData, setInitialData] = useState<ConsoleCredentials>(defaultFormData);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetches console credentials of a customer
  const fetchConsoleCredentials = async (customerId: number) => {
    setIsLoading(true);
    setShowAlert(false);
    try {
      const consoleCredentials = await getConsoleCredentials(customerId);
      const data = {
        clientId: consoleCredentials.data.client_id ?? "",
        clientSecret: consoleCredentials.data.client_secret ?? "",
        baseUrl: consoleCredentials.data.base_url ?? "",
        authUrl: consoleCredentials.data.auth_url ?? "",
        applicationId: consoleCredentials.data.application_id ?? "",
      };
      setFormData(data);
      setInitialData(data);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Effect hook to fetch data initially
  useEffect(() => {
    fetchConsoleCredentials(state.customerData.id);
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handles input change in form fields
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (value.length <= CHARACTER_LIMIT) {

      let sanitizedValue = value.trim();

      if (name === "clientSecret") {
        if (formData.clientSecret === initialData.clientSecret) {
          sanitizedValue = stringDifference(formData.clientSecret, sanitizedValue);
        }
        sanitizedValue = sanitizedValue.replace(/●/g, "");
      }

      setFormData({
        ...formData,
        [name]: sanitizedValue,
      });
    }
  };

  // Checks if form data has changed
  const hasFormDataChanged = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  };

  // Effect hook to clear alert if form data has changed
  useEffect(() => {
    if (!hasFormDataChanged()) {
      setShowAlert(false);
    }
  }, [formData]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handles form submission
  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowAlert(false);
    setIsSaving(true);
    await updateConsoleCredentials(state.customerData.id, formData)
      .then(() => {
        setUpdateSuccess(true);
        setShowAlert(true);
        setTimeout(() => {
          navigate(-1);
        }, NAVIGATE_TIMEOUT);
      })
      .catch((err) => {
        handleError(err);
        setUpdateSuccess(false);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  // Resets form to initial data
  const handleReset = () => {
    setFormData(initialData);
    setShowAlert(false);
  };

  // Handles errors during data fetching or submission
  const handleError = (error: any) => {
    if (error?.error_code && error.error_code in errorCodes) {
      setErrorMessage(`errorCodes.${error.error_code}`);
    } else {
      setErrorMessage("errorCodes.10000");
    }
    setShowAlert(true);
  };

  return (
    <>
      {isLoading ? (
        <Backdrop
          open
          sx={{
            position: "absolute",
            height: "100%",
            width: "100%",
            backgroundColor: "rgba(221, 231, 238)",
          }}
        >
          <CircularProgress variant="soft" />
        </Backdrop>
      ) : (
        <Stack
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              mt: { xs: 2, md: 0 },
              mb: 1,
              gap: 1,
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "start", sm: "center" },
              flexWrap: "wrap",
              justifyContent: "start",
            }}
          >
            <IconButton onClick={() => navigate(-1)}>
              <ArrowBackIosRounded />
            </IconButton>
            <Typography level="h2" component="h1">{t("sidebar.editConfiguration")}</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", alignItems: "center" }}>
            <Card variant="outlined" sx={{ bgcolor: "white", width: "80%" }}>
              <Box p={2} minHeight={500} position="relative">
                <form onSubmit={handleSave}>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label={t("editConfigurationPage.customerName")}
                      name="customerName"
                      defaultValue={state.customerData.customerName}
                      disabled
                    />
                    <FormGroup>
                      <TextField
                        fullWidth
                        label={t("editConfigurationPage.clientId")}
                        name="clientId"
                        value={formData.clientId}
                        helperText={formData.clientId.length >= CHARACTER_LIMIT && t("errorCodes.10001")}
                        sx={{ "& .MuiFormHelperText-root": { color: theme.palette.warning[400] } }}
                        onChange={handleInputChange}
                        required
                      />
                      <FormHelperText>
                        {t("editConfigurationPage.tip")}
                        {t("editConfigurationPage.aitriosPortal") + " \u2794 " +
                          t("editConfigurationPage.project") + " \u2794 " +
                          t("editConfigurationPage.projectManagement") + " \u2794 " +
                          t("editConfigurationPage.clientAppManagement") + " \u2794 " +
                          t("editConfigurationPage.clientApp") + " \u2794 " +
                          t("editConfigurationPage.clientId") + " " +
                          "(" + t("editConfigurationPage.createNewIfDoesnotExist") + ")"}
                      </FormHelperText>
                    </FormGroup>
                    <FormGroup>
                      <TextField
                        fullWidth
                        label={t("editConfigurationPage.clientSecret")}
                        name="clientSecret"
                        value={formData.clientSecret}
                        helperText={formData.clientSecret.length >= CHARACTER_LIMIT && t("errorCodes.10001")}
                        sx={{ "& .MuiFormHelperText-root": { color: theme.palette.warning[400] } }}
                        onChange={handleInputChange}
                        required
                      />
                      <FormHelperText>
                        {t("editConfigurationPage.tip")}
                        {t("editConfigurationPage.aitriosPortal") + " \u2794 " +
                          t("editConfigurationPage.project") + " \u2794 " +
                          t("editConfigurationPage.projectManagement") + " \u2794 " +
                          t("editConfigurationPage.clientAppManagement") + " \u2794 " +
                          t("editConfigurationPage.clientApp") + " \u2794 " +
                          t("editConfigurationPage.clientSecret") + " " +
                          "(" + t("editConfigurationPage.visibleOnlyOnceWhenCreated") + ")"}
                      </FormHelperText>
                    </FormGroup>
                    <FormGroup>
                      <TextField
                        fullWidth
                        label={t("editConfigurationPage.authUrl")}
                        name="authUrl"
                        value={formData.authUrl}
                        helperText={formData.authUrl.length >= CHARACTER_LIMIT && t("errorCodes.10001")}
                        sx={{ "& .MuiFormHelperText-root": { color: theme.palette.warning[400] } }}
                        onChange={handleInputChange}
                        required
                      />
                      <FormHelperText sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start"
                      }}>
                        {t("editConfigurationPage.example")}
                        <span>
                          {t("editConfigurationPage.aitriosDeveloperEdition") + " - "}
                          <strong>{t("editConfigurationPage.authUrlDeveloperExample")}</strong>
                          {" (" + t("editConfigurationPage.portalEndpoint") + ")"}
                        </span>
                        <span>
                          {t("editConfigurationPage.aitriosEnterpriseEdition") + " - "}
                          <strong>{t("editConfigurationPage.authUrlEnterpriseExample")}</strong>
                          {" (" + t("editConfigurationPage.changeTenantId") + ")"}
                        </span>
                      </FormHelperText>
                    </FormGroup>
                    <FormGroup>
                      <TextField
                        fullWidth
                        label={t("editConfigurationPage.baseUrl")}
                        name="baseUrl"
                        value={formData.baseUrl}
                        helperText={formData.baseUrl.length >= CHARACTER_LIMIT && t("errorCodes.10001")}
                        sx={{ "& .MuiFormHelperText-root": { color: theme.palette.warning[400] } }}
                        onChange={handleInputChange}
                        required
                      />
                      <FormHelperText>
                        {t("editConfigurationPage.example")}
                        <strong style={{ marginLeft: "2px" }}>{t("editConfigurationPage.baseUrlExample")}</strong>
                      </FormHelperText>
                    </FormGroup>
                    <FormGroup>
                      <TextField
                        fullWidth
                        label={t("editConfigurationPage.applicationId")}
                        name="applicationId"
                        value={formData.applicationId}
                        helperText={formData.applicationId.length >= CHARACTER_LIMIT && t("errorCodes.10001")}
                        sx={{ "& .MuiFormHelperText-root": { color: theme.palette.warning[400] } }}
                        onChange={handleInputChange}
                      />
                      <FormHelperText>{t("editConfigurationPage.applicationIdNote")}</FormHelperText>
                    </FormGroup>
                    <Stack
                      direction={{ xs: "column", lg: "row" }}
                      justifyContent="space-between"
                      alignItems="center"
                      gap={{ xs: 4, lg: 8 }}
                    >
                      <Box>
                        {showAlert && (
                          <Alert
                            variant="soft"
                            color={updateSuccess ? "success" : "danger"}
                            startDecorator={updateSuccess ? <AssignmentTurnedInRounded /> : <ErrorRounded />}
                          >
                            {updateSuccess
                              ? t("editConfigurationPage.credentialsUpdated")
                              : t(errorMessage)}
                          </Alert>
                        )}
                      </Box>
                      <Box display="flex" gap={2}>
                        <Button
                          type="submit"
                          size="lg"
                          variant="solid"
                          loading={isSaving}
                          loadingPosition="start"
                          sx={{ width: 125, maxHeight: 20 }}
                          disabled={!hasFormDataChanged()}
                        >
                          {t("editConfigurationPage.save")}
                        </Button>
                        <Button
                          size="lg"
                          variant="outlined"
                          onClick={handleReset}
                          sx={{ width: 125, maxHeight: 20 }}
                          disabled={!hasFormDataChanged() || isSaving}
                        >
                          {t("editConfigurationPage.reset")}
                        </Button>
                      </Box>
                    </Stack>
                  </Stack>
                </form>
              </Box>
            </Card>
          </Box>
        </Stack>
      )}
    </>
  );
};
