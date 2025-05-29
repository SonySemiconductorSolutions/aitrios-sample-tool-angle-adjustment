import { ArrowBackIosRounded, Check } from "@mui/icons-material";
import { Box, Stack, Typography, Checkbox, Button, CircularProgress, FormControl, FormLabel } from "@mui/joy";
import { Autocomplete as MuiAutocomplete, TextField as MuiTextField, IconButton, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { AutocompleteRenderInputParams } from '@mui/material';
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../store";
import { useState, useCallback } from "react";
import { getFacilitiesByCustomer } from "../../services/facility_update";
import { generateCustomerQRCodes } from "../../services/customers_qr_codes";
import saveAs from "file-saver";
import { ResponsiveBackdrop } from "../../components/ResponsiveBackdrop";

interface Facility {
  id: number;
  facility_name: string;
  facility_type_id: number;
  facility_type_name: string;
  prefecture: string;
  municipality: string;
  effective_start_utc: string;
  effective_end_utc: string;
  customer_id?: number;
}

interface Customer {
  id: number;
  customerName: string;
  lastUpdatedBy?: string;
  lastUpdatedTime?: string;
}

// Styling for labels
const LABEL_SX = {
  fontSize: 16,
  fontWeight: "bold"
};

export const GenerateQrPage = () => {
  const navigate = useNavigate();
  const { customers } = useStore();
  const { t } = useTranslation();

  const selectAllCustomersOption = {
    id: -1,
    customerName: t('generateQR.selectAll', 'Select All'),
  };

  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<Facility[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFacilities = useCallback(async (customerId: number) => {
    if (!customerId) return [];

    try {
      setIsLoading(true);
      setError(null);
      const response = await getFacilitiesByCustomer(customerId);
      if (response?.facilities) {
        return response.facilities;
      }
      return [];
    } catch (error) {
      setError("Failed to fetch facilities");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateFacilities = async (
    addedCustomers: Customer[],
    removedCustomers: Customer[]
  ) => {
    try {
      const newFacilities = await Promise.all(
        addedCustomers.map(async (customer) => {
          const customerFacilities = await fetchFacilities(customer.id);
          return customerFacilities.map((facility) => ({
            ...facility,
            customer_id: customer.id,
          }));
        })
      );

      setFacilities((prevFacilities) => [
        ...prevFacilities.filter(
          (facility) =>
            !removedCustomers.some(
              (customer) => customer.id === facility.customer_id
            )
        ),
        ...newFacilities.flat(),
      ]);
    } catch (error) {
      console.error("Error updating facilities:", error);
      setError("Failed to update facilities");
    }
  };

  const handleCustomerChange = async (_event: React.SyntheticEvent, newValue: Customer[]) => {
    let updatedSelection: Customer[] = [];

    const isSelectAllClicked = newValue.some(
      (customer) => customer.id === selectAllCustomersOption.id
    );

    if (isSelectAllClicked) {
      updatedSelection = customers.length === selectedCustomers.length ? [] : customers;
    } else {
      updatedSelection = newValue.filter(
        (customer) => customer.id !== selectAllCustomersOption.id
      );
    }

    const addedCustomers = updatedSelection.filter(
      (newCustomer) =>
        !selectedCustomers.some((prevCustomer) => prevCustomer.id === newCustomer.id)
    );
    const removedCustomers = selectedCustomers.filter(
      (prevCustomer) =>
        !updatedSelection.some((newCustomer) => newCustomer.id === prevCustomer.id)
    );

    // Update the selected customers
    setSelectedCustomers(updatedSelection);

    // Update the facilities list
    await updateFacilities(addedCustomers, removedCustomers);

    // Clear selected facilities whenever customers change
    setSelectedFacilities([]);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedFacilities(facilities);
    } else {
      setSelectedFacilities([]);
    }
  };

  const handleFacilitySelect = (facility: Facility) => {
    setSelectedFacilities((prev) => {
      if (prev.some((f) => f.id === facility.id)) {
        return prev.filter((f) => f.id !== facility.id);
      } else {
        return [...prev, facility];
      }
    });
  };

  const handleGenerateQR = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Construct the data to send to generateCustomerQRCodes
      const requestData = selectedCustomers.map((customer) => ({
        customer_id: customer.id,
        facility_ids: selectedFacilities
          .filter((facility) => facility.customer_id === customer.id)
          .map((facility) => facility.id),
      }));

      const zipBlob = await generateCustomerQRCodes(requestData);
      if (zipBlob) {
        const fileName = `qr_codes_${new Date().toISOString().slice(0, 10)}.zip`;
        saveAs(zipBlob, fileName);
      } else {
        setError("Failed to generate QR codes");
      }
    } catch (error) {
      console.error("Error generating QR codes:", error);
      setError("Failed to generate QR codes");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && (
        <ResponsiveBackdrop open={true} zIndex={499}>
          <CircularProgress variant="soft" />
        </ResponsiveBackdrop>
      )}

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
          <IconButton onClick={() => navigate(`/settings`)}>
            <ArrowBackIosRounded />
          </IconButton>
          <Typography level="h2" component="h1">{t("settingsPage.generateQr")}</Typography>
        </Box>

        {error && (
          <Typography color="danger">{error}</Typography>
        )}

        <FormControl>
          <FormLabel htmlFor="customer-name-select" sx={LABEL_SX}>
            {t("generateQR.customerName")}:
          </FormLabel>
          <MuiAutocomplete<Customer, true>
            multiple
            id="customer-name-select"
            data-testid="customer-name-select"
            options={[selectAllCustomersOption, ...customers]}
            getOptionLabel={(option) => option.customerName}
            value={selectedCustomers}
            onChange={handleCustomerChange}
            renderInput={(params: AutocompleteRenderInputParams) => (
              <MuiTextField
                {...params}
                placeholder={t('generateQR.selectCustomer', 'Select customers')}
              />
            )}
            renderOption={(props, option) => {
              const isSelected = option.id === selectAllCustomersOption.id
                ? selectedCustomers.length === customers.length
                : selectedCustomers.some((customer) => customer.id === option.id);

              return (
                <MenuItem
                  {...props}
                  key={option.id}
                  value={option.customerName}
                  sx={{ backgroundColor: isSelected ? "rgba(25, 118, 210, 0.08)" : "inherit" }}
                >
                  <ListItemIcon>{isSelected && <Check color="info" />}</ListItemIcon>
                  <ListItemText
                    primary={option.customerName}
                    primaryTypographyProps={{
                      fontWeight:
                        option.id === selectAllCustomersOption.id ? "bold" : "normal",
                    }}
                  />
                </MenuItem>
              );
            }}
          />
        </FormControl>

        {selectedCustomers.length > 0 && (
          <Box>
            <FormLabel sx={LABEL_SX}>{t("generateQR.selectFacilities")}:</FormLabel>
            <Stack spacing={2} mt={1}>
              {facilities.length > 0 && (
                <Checkbox
                  label={t('generateQR.selectAll', 'Select All')}
                  checked={selectedFacilities.length === facilities.length}
                  onChange={handleSelectAll}
                  data-testid="select-all-facilities"
                />
              )}
              {selectedCustomers.map((customer) => {
                const customerFacilities = facilities.filter(
                  (facility) => facility.customer_id === customer.id
                );
                return (
                  <Stack spacing={1} key={customer.id}>
                    <Typography level="body-sm" fontWeight="bold">
                      {`${customer.customerName} (${customerFacilities.length} ${t('generateQR.facilities')})`}
                    </Typography>
                    {customerFacilities.map((facility) => (
                      <Checkbox
                        key={facility.id}
                        label={`${facility.facility_name}`}
                        checked={selectedFacilities.some((f) => f.id === facility.id)}
                        onChange={() => handleFacilitySelect(facility)}
                        data-testid={`facility-checkbox-${facility.id}`}
                      />
                    ))}
                  </Stack>
                );
              })}
            </Stack>
          </Box>)}

        <Typography level="body-sm" color="warning" sx={{ mt: 2 }}>
          {t('generateQR.note')}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="outlined"
            color="neutral"
            onClick={() => navigate('/settings')}
            sx={{ mr: 2 }}
            data-testid="cancel-generate-qr-btn"
          >
            {t('generateQR.buttons.cancel')}
          </Button>
          <Button
            variant="solid"
            color="primary"
            disabled={selectedCustomers.length === 0 || facilities.length === 0}
            onClick={handleGenerateQR}
            data-testid="submit-generate-qr-btn"
          >
            {t('generateQR.buttons.generate')}
          </Button>
        </Box>
      </Stack>
    </>
  );
};
