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
import { Box, FormGroup, TextField, Stack, IconButton } from "@mui/material";
import { ArrowBackIosRounded, AssignmentTurnedInRounded, ErrorRounded } from "@mui/icons-material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { NotFound } from "../../components/NotFound";
import { stringDifference, validateString } from "../../utils";
import { getConsoleCredentials, updateConsoleCredentials, addNewCustomer, getCustomers } from "../../services";
import { useTranslation } from "react-i18next";
import { useStore } from "../../store";
import { ResponsiveBackdrop } from "../../components/ResponsiveBackdrop";

// Interface for Customer details from Response payload
interface CustomerResponse {
  id: number;
  customer_name: string;
  last_updated_by: string;
  last_updated_at_utc: string;
}

// Interface for console credentials
interface ConsoleCredentials {
  authUrl: string;
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  customerName: string;
  applicationId: string;
}

// Constants
const CHARACTER_LIMIT = 255;
const CHARACTER_LIMIT_NAME = 127;
const CUSTOMER_NAME_FIELD = "customerName";
const NAVIGATE_TIMEOUT = 3000;
const CUSTOMER_NOT_FOUND_ERROR = 40407;

export const ConsoleCredentialsPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const customerId = Number(useParams().customerId);
  const { t } = useTranslation();
  const { pathname } = useLocation(); // Current location pathname
  const { currentAccount, setCustomers, setSingleFilter } = useStore(); // Store for customer data

  const isEdit = pathname.includes("/console-credentials/edit");
  const isAdd = pathname.includes("/customers/new");

  const errorCodes: Record<number, string> = t("errorCodes", { returnObjects: true });

  // State variables
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const defaultFormData: ConsoleCredentials = {
    customerName: "",
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
  const [successMessage, setSuccessMessage] = useState("");
  const [customerNotFound, setCustomerNotFound] = useState(false);

  // Fetches console credentials of a customer
  const fetchConsoleCredentials = async (customerId: number) => {
    setIsLoading(true);
    setShowAlert(false);
    try {
      const consoleCredentials = await getConsoleCredentials(customerId);
      const data = {
        customerName: consoleCredentials.data.customer_name ?? "",
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
    if (isEdit && customerId) {
      if (isNaN(customerId)) {
        handleError({ error_code: CUSTOMER_NOT_FOUND_ERROR });
      } else {
        fetchConsoleCredentials(customerId);
      }
    }
  }, [isEdit, customerId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handles input change in form fields
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Use the correct character limit based on the field
    const limit = name === CUSTOMER_NAME_FIELD ? CHARACTER_LIMIT_NAME : CHARACTER_LIMIT;

    if (value.length <= limit) {
      let sanitizedValue = value;

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

  // Handles form submission
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowAlert(false);
    setIsSaving(true);

    // Validation checks
    if (
      !validateString(formData.customerName, "NAME")
      || !validateString(formData.authUrl, "URL")
      || !validateString(formData.baseUrl, "URL")
    ) {
      setErrorMessage("errorCodes.10005");
      setShowAlert(true);
      setIsSaving(false);
      return;
    }

    const hasChanges = (): boolean => {
      return JSON.stringify(formData) !== JSON.stringify(initialData);
    };

    if (!hasChanges()) {
      setErrorMessage("consoleCredentialsPage.noChanges");
      setShowAlert(true);
      setIsSaving(false);
      return;
    }

    try {
      if (isEdit) {
        await updateConsoleCredentials(Number(customerId), formData);
        setSuccessMessage("consoleCredentialsPage.credentialsUpdated");
        setShowAlert(true);
        await fetchCustomers(); // Fetch updated customers list
        setTimeout(() => navigate("/settings"), NAVIGATE_TIMEOUT);
      } else if (isAdd) {
        const newCustomer = await addNewCustomer(formData);
        setSuccessMessage("consoleCredentialsPage.customerCreated");
        setShowAlert(true);
        await fetchCustomers(); // Fetch updated customers list
        if (newCustomer?.data?.id) {
          setSingleFilter({ key: "customerId", value: newCustomer.data.id }); // Update filter with new customer
          setTimeout(() => navigate("/settings/customers/devices"), NAVIGATE_TIMEOUT);
        }
      }
    } catch (err) {
      handleError(err);
    } finally {
      setIsSaving(false);
    }
  };

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

  // Resets form to initial data
  const handleReset = () => {
    setFormData(initialData);
    setShowAlert(false);
  };

  // Handles errors during data fetching or submission
  const handleError = (error: any) => {
    if (error?.error_code && error.error_code in errorCodes) {
      if (error.error_code === CUSTOMER_NOT_FOUND_ERROR) {
        setCustomerNotFound(true);
      }
      setErrorMessage(`errorCodes.${error.error_code}`);
    } else {
      setErrorMessage("errorCodes.10000");
    }
    setShowAlert(true);
  };

  return (
    <>
      {isLoading ? (
        <ResponsiveBackdrop open={true} zIndex={499}>
          <CircularProgress variant="soft" />
        </ResponsiveBackdrop>
      ) : customerNotFound ? (
        <NotFound errorMessage={errorMessage} />
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
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "start",
            }}
          >
            <IconButton onClick={() => navigate("/settings")}>
              <ArrowBackIosRounded />
            </IconButton>
            <Typography level="h2">
              {isEdit ? t("settingsPage.editCustomer") : t("settingsPage.addCustomer")}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", alignItems: "center" }}>
            <Card variant="outlined" sx={{ bgcolor: "white", width: "80%" }}>
              <Box p={2} minHeight={500} position="relative">
                <form onSubmit={handleSave}>
                  <Stack spacing={3}>
                    <TextField
                      label={t("consoleCredentialsPage.customerName")}
                      name="customerName"
                      value={formData.customerName}
                      error={!validateString(formData.customerName, "NAME")}
                      helperText={
                        !validateString(formData.customerName, "NAME")
                          ? t("errorCodes.10003")
                          : formData.customerName.length >= CHARACTER_LIMIT_NAME
                            ? t("errorCodes.10002")
                            : ""
                      }
                      sx={{ "& .MuiFormHelperText-root": { color: theme.palette.warning[400] } }}
                      onChange={handleInputChange}
                      data-testid="customer-name-input"
                      required
                    />
                    <FormGroup>
                      <TextField
                        fullWidth
                        label={t("consoleCredentialsPage.clientId")}
                        name="clientId"
                        value={formData.clientId}
                        helperText={formData.clientId.length >= CHARACTER_LIMIT && t("errorCodes.10001")}
                        sx={{ "& .MuiFormHelperText-root": { color: theme.palette.warning[400] } }}
                        onChange={handleInputChange}
                        data-testid="client-id-input"
                        required
                      />
                      <FormHelperText>
                        {t("consoleCredentialsPage.tip")}
                        {t("consoleCredentialsPage.aitriosPortal") + " \u2794 " +
                          t("consoleCredentialsPage.project") + " \u2794 " +
                          t("consoleCredentialsPage.projectManagement") + " \u2794 " +
                          t("consoleCredentialsPage.clientAppManagement") + " \u2794 " +
                          t("consoleCredentialsPage.clientApp") + " \u2794 " +
                          t("consoleCredentialsPage.clientId") + " " +
                          "(" + t("consoleCredentialsPage.createNewIfDoesnotExist") + ")"}
                      </FormHelperText>
                    </FormGroup>
                    <FormGroup>
                      <TextField
                        fullWidth
                        label={t("consoleCredentialsPage.clientSecret")}
                        name="clientSecret"
                        value={formData.clientSecret}
                        helperText={formData.clientSecret.length >= CHARACTER_LIMIT && t("errorCodes.10001")}
                        sx={{ "& .MuiFormHelperText-root": { color: theme.palette.warning[400] } }}
                        onChange={handleInputChange}
                        data-testid="client-secret-input"
                        required
                      />
                      <FormHelperText>
                        {t("consoleCredentialsPage.tip")}
                        {t("consoleCredentialsPage.aitriosPortal") + " \u2794 " +
                          t("consoleCredentialsPage.project") + " \u2794 " +
                          t("consoleCredentialsPage.projectManagement") + " \u2794 " +
                          t("consoleCredentialsPage.clientAppManagement") + " \u2794 " +
                          t("consoleCredentialsPage.clientApp") + " \u2794 " +
                          t("consoleCredentialsPage.clientSecret") + " " +
                          "(" + t("consoleCredentialsPage.visibleOnlyOnceWhenCreated") + ")"}
                      </FormHelperText>
                    </FormGroup>
                    <FormGroup>
                      <TextField
                        fullWidth
                        label={t("consoleCredentialsPage.authUrl")}
                        name="authUrl"
                        value={formData.authUrl}
                        error={!validateString(formData.authUrl, "URL")}
                        helperText={
                          !validateString(formData.authUrl, "URL")
                            ? t("errorCodes.10004")
                            : formData.authUrl.length >= CHARACTER_LIMIT
                              ? t("errorCodes.10001")
                              : ""
                        }
                        sx={{ "& .MuiFormHelperText-root": { color: theme.palette.warning[400] } }}
                        onChange={handleInputChange}
                        data-testid="auth-url-input"
                        required
                      />
                      <FormHelperText sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        wordBreak: "break-word",
                      }}>
                        {t("consoleCredentialsPage.example")}
                        <span>
                          {t("consoleCredentialsPage.aitriosDeveloperEdition") + " - "}
                          <strong>{t("consoleCredentialsPage.authUrlDeveloperExample")}</strong>
                          {" (" + t("consoleCredentialsPage.portalEndpoint") + ")"}
                        </span>
                        <span>
                          {t("consoleCredentialsPage.aitriosEnterpriseEdition") + " - "}
                          <strong>{t("consoleCredentialsPage.authUrlEnterpriseExample")}</strong>
                          {" (" + t("consoleCredentialsPage.changeTenantId") + ")"}
                        </span>
                      </FormHelperText>
                    </FormGroup>
                    <FormGroup>
                      <TextField
                        fullWidth
                        label={t("consoleCredentialsPage.baseUrl")}
                        name="baseUrl"
                        value={formData.baseUrl}
                        error={!validateString(formData.baseUrl, "URL")}
                        helperText={
                          !validateString(formData.baseUrl, "URL")
                            ? t("errorCodes.10004")
                            : formData.baseUrl.length >= CHARACTER_LIMIT
                              ? t("errorCodes.10001")
                              : ""
                        }
                        sx={{ "& .MuiFormHelperText-root": { color: theme.palette.warning[400] } }}
                        onChange={handleInputChange}
                        data-testid="base-url-input"
                        required
                      />
                      <FormHelperText>
                        {t("consoleCredentialsPage.example")}
                        <strong style={{ marginLeft: "2px" }}>{t("consoleCredentialsPage.baseUrlExample")}</strong>
                      </FormHelperText>
                    </FormGroup>
                    <FormGroup>
                      <TextField
                        fullWidth
                        label={t("consoleCredentialsPage.applicationId")}
                        name="applicationId"
                        value={formData.applicationId}
                        helperText={formData.applicationId.length >= CHARACTER_LIMIT && t("errorCodes.10001")}
                        sx={{ "& .MuiFormHelperText-root": { color: theme.palette.warning[400] } }}
                        data-testid="application-id-input"
                        onChange={handleInputChange}
                      />
                      <FormHelperText>{t("consoleCredentialsPage.applicationIdNote")}</FormHelperText>
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
                            color={successMessage ? "success" : "danger"}
                            startDecorator={successMessage ? <AssignmentTurnedInRounded /> : <ErrorRounded />}
                          >
                            {successMessage
                              ? t(successMessage)
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
                          data-testid="save-credentials-btn"
                        >
                          {isEdit ? t("consoleCredentialsPage.save") : t("consoleCredentialsPage.next")}
                        </Button>
                        <Button
                          size="lg"
                          variant="outlined"
                          onClick={handleReset}
                          sx={{ width: 125, maxHeight: 20 }}
                          disabled={isSaving}
                          data-testid="reset-credentials-btn"
                        >
                          {t("consoleCredentialsPage.reset")}
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
