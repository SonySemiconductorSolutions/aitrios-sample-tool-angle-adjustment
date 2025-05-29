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
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Option,
  Select,
  Typography,
} from "@mui/joy";
import { useState, useEffect } from "react";
import { useStore } from "../../../store";
import { useTranslation } from "react-i18next";
import { validateString } from "src/utils";

// Interface for filter properties
interface FilterProps {
  customerId: number | null;
  facilityName: string;
  prefecture: string;
  municipality: string;
  status: string | null;
}

// Styling for labels
const LABEL_SX = {
  fontSize: 16,
  fontWeight: "bold"
};

// Character limit constant for input fields
const CHARACTER_LIMIT = 127;

export const Filter = () => {
  const { customers, filter, setFilter, setCurrentPage } = useStore();
  const { t } = useTranslation();

  // State variables
  const [tempFilter, setTempFilter] = useState<FilterProps>(filter);
  const [customerId, setCustomerId] = useState<number | null>(filter.customerId);
  const [filterModified, setFilterModified] = useState<boolean>(false);

  // Handles customer selection change
  const handleCustomerChange = (value: number | null) => {
    setTempFilter({ ...tempFilter, customerId: value });
    setCustomerId(value);
  };

  // Handles prefecture selection change
  const handlePrefectureChange = (value: string) => {
    if (value.length <= CHARACTER_LIMIT) {
      setTempFilter({ ...tempFilter, prefecture: value });
    }
  };

  // Handles municipality input change
  const handleMunicipalityChange = (value: string) => {
    if (value.length <= CHARACTER_LIMIT) {
      setTempFilter({ ...tempFilter, municipality: value });
    }
  };

  // Handles facility name input change
  const handleFacilityNameChange = (value: string) => {
    if (value.length <= CHARACTER_LIMIT) {
      setTempFilter({ ...tempFilter, facilityName: value });
    }
  };

  // Handles click on Search button to apply filters
  const handleFindButton = () => {
    // Validate inputs
    if (
      !validateString(tempFilter.facilityName, "NAME") ||
      !validateString(tempFilter.prefecture, "NAME") ||
      !validateString(tempFilter.municipality, "NAME")
    ) return;

    // Set current page to 1 and set filter
    setCurrentPage(1);
    setFilter({ ...tempFilter, status: filter.status });
  };

  // State object for clearing filters
  const filterClearState = {
    customerId: filter.customerId,
    facilityName: "",
    prefecture: "",
    municipality: "",
    status: filter.status,
  };

  // Handles click on clear button to reset filters
  const handleClearButton = () => {
    setTempFilter(filterClearState);
    setCustomerId(filter.customerId);
    setFilter(filterClearState);
  };

  // State object for initializing filters
  const filterInitState = {
    customerId: customers?.[0]?.id,
    facilityName: "",
    prefecture: "",
    municipality: "",
    status: filter.status,
  };

  // Initializes filter state when customers data changes
  useEffect(() => {
    if (customers?.length && !customerId) {
      setTempFilter(filterInitState);
      setCustomerId(customers[0]?.id);
      setFilter(filterInitState);
    }
  }, [customers]); // eslint-disable-line react-hooks/exhaustive-deps

  // Function to compare filter objects ignoring the `status` field
  const areFiltersEqual = (filter1: FilterProps, filter2: FilterProps) => {
    return (
      filter1.customerId === filter2.customerId &&
      filter1.facilityName === filter2.facilityName &&
      filter1.prefecture === filter2.prefecture &&
      filter1.municipality === filter2.municipality
    );
  };

  // Checks if filter has been modified
  useEffect(() => {
    if (areFiltersEqual(tempFilter, filter)) {
      setFilterModified(false);
    } else {
      setFilterModified(true);
    }
  }, [tempFilter, filter]);

  return (
    <Box>
      <Box
        sx={{
          py: 1,
          display: "flex",
          flexDirection: { xs: 'column', lg: 'row' },
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: { xs: 'column', md: 'row' }, gap: 1.5, flex: 1 }}>
          <FormControl size="sm" sx={{ flex: 1 }} >
            <FormLabel sx={LABEL_SX} required>{t("dashboardPage.customerName")}:</FormLabel>
            <Select
              size="sm"
              placeholder={t("dashboardPage.select")}
              value={customerId}
              data-testid="customer-select-dropdown"
              onChange={(_, value) => handleCustomerChange(value)}
              required
            >
              {customers?.length ? (
                customers.map((value) => (
                  <Option key={value.id} value={value.id}>
                    {value.customerName}
                  </Option>
                ))
              ) : (
                <Option disabled value="">
                  {t("dashboardPage.noCustomerFound")}
                </Option>
              )}
            </Select>
          </FormControl>
          <FormControl size="sm" sx={{ flex: 1 }}>
            <FormLabel sx={LABEL_SX}>{t("dashboardPage.prefecture")}:</FormLabel>
            <Input
              size="sm"
              placeholder={t("dashboardPage.enterText")}
              value={tempFilter.prefecture}
              data-testid="prefecture-input"
              error={!validateString(tempFilter.prefecture, "NAME")}
              slotProps={{ input: { maxLength: CHARACTER_LIMIT } }}
              onChange={(e) => handlePrefectureChange(e.target.value)}
            />
            {tempFilter.prefecture && (
              <Typography
                level="body-xs"
                sx={{
                  color: !validateString(tempFilter.prefecture, "NAME")
                    ? "danger.500"
                    : tempFilter.prefecture.length >= CHARACTER_LIMIT
                      ? "warning.400"
                      : "inherit",
                }}
              >
                {!validateString(tempFilter.prefecture, "NAME")
                  ? t("errorCodes.10003")
                  : tempFilter.prefecture.length >= CHARACTER_LIMIT
                    ? t("errorCodes.10002")
                    : ""}
              </Typography>
            )}
          </FormControl>
          <FormControl size="sm" sx={{ flex: 1 }}>
            <FormLabel sx={LABEL_SX}>{t("dashboardPage.municipality")}:</FormLabel>
            <Input
              size="sm"
              placeholder={t("dashboardPage.enterText")}
              value={tempFilter.municipality}
              data-testid="municipality-input"
              error={!validateString(tempFilter.municipality, "NAME")}
              slotProps={{ input: { maxLength: CHARACTER_LIMIT } }}
              onChange={(e) => handleMunicipalityChange(e.target.value)}
            />
            {tempFilter.municipality && (
              <Typography
                level="body-xs"
                sx={{
                  color: !validateString(tempFilter.municipality, "NAME")
                    ? "danger.500"
                    : tempFilter.municipality.length >= CHARACTER_LIMIT
                      ? "warning.400"
                      : "inherit",
                }}
              >
                {!validateString(tempFilter.municipality, "NAME")
                  ? t("errorCodes.10003")
                  : tempFilter.municipality.length >= CHARACTER_LIMIT
                    ? t("errorCodes.10002")
                    : ""}
              </Typography>
            )}
          </FormControl>
        </Box>
        <FormControl sx={{ flex: 0.5 }} size="sm">
          <FormLabel sx={LABEL_SX}>{t("dashboardPage.facilityName")}:</FormLabel>
          <Input
            size="sm"
            placeholder={t("dashboardPage.enterText")}
            value={tempFilter.facilityName}
            data-testid="facility-name-input"
            error={!validateString(tempFilter.facilityName, "NAME")}
            slotProps={{ input: { maxLength: CHARACTER_LIMIT } }}
            onChange={(e) => handleFacilityNameChange(e.target.value)}
          />
          {tempFilter.facilityName && (
            <Typography
              level="body-xs"
              sx={{
                color: !validateString(tempFilter.facilityName, "NAME")
                  ? "danger.500"
                  : tempFilter.facilityName.length >= CHARACTER_LIMIT
                    ? "warning.400"
                    : "inherit",
              }}
            >
              {!validateString(tempFilter.facilityName, "NAME")
                ? t("errorCodes.10003")
                : tempFilter.facilityName.length >= CHARACTER_LIMIT
                  ? t("errorCodes.10002")
                  : ""}
            </Typography>
          )}
        </FormControl>
      </Box>

      <Box sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "flex-end",
        gap: 2,
        mt: 2
      }}>
        {filterModified && (
          <Typography level="body-sm" display="flex" alignItems="flex-end" color="primary">
            {t("dashboardPage.filterModifiedInfo")}
          </Typography>)}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleClearButton}
            sx={{ width: 80 }}
            data-testid="clear-filters-btn"
          >
            {t("dashboardPage.clear")}
          </Button>
          <Button
            onClick={handleFindButton}
            sx={{ width: 80 }}
            data-testid="apply-filters-btn"
          >
            {t("dashboardPage.search")}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
