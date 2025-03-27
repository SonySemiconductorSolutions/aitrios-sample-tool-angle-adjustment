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
  FormHelperText,
  Input,
  Option,
  Select,
  Typography,
  useTheme,
} from "@mui/joy";
import { useState, useEffect } from "react";
import { useStore } from "../../../store";
import { useTranslation } from "react-i18next";

// Interface for filter properties
interface FilterProps {
  customerId: number | null;
  facilityName: string;
  prefecture: string | null;
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
  const theme = useTheme();
  const { customers, filter, setFilter, setCurrentPage } = useStore();
  const { t } = useTranslation();

  // Lists of prefectures
  const prefecturesList: string[] = t("prefecturesList", { returnObjects: true }) as string[];
  const jaPrefecturesList: string[] = t("prefecturesList", { returnObjects: true, lng: "ja" }) as string[];

  // State variables
  const [tempFilter, setTempFilter] = useState<FilterProps>(filter);
  const [customerId, setCustomerId] = useState<number | null>(filter.customerId);
  const [prefecture, setPrefecture] = useState<string[]>(filter.prefecture?.split(",") ?? []);
  const [filterModified, setFilterModified] = useState<boolean>(false);

  // Handles customer selection change
  const handleCustomerChange = (value: number | null) => {
    setTempFilter({ ...tempFilter, customerId: value });
    setCustomerId(value);
  };

  // Handles prefecture selection change
  const handlePrefectureChange = (value: string[]) => {
    setTempFilter({ ...tempFilter, prefecture: value.join(",") });
    setPrefecture(value);
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
    setPrefecture([]);
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
            <FormLabel sx={LABEL_SX}>{t("dashboardPage.prefectures")}:</FormLabel>
            <Select
              multiple
              size="sm"
              placeholder={t("dashboardPage.selectMultiple")}
              value={prefecture}
              sx={{
                width: {
                  xs: "calc(0.95 * 100vw)",
                  md: "calc(0.30 * (100vw - 255px))",
                  lg: "calc(0.20 * (100vw - 255px))"
                }
              }}
              data-testid="prefecture-select-dropdown"
              onChange={(_, value) => handlePrefectureChange(value)}
            >
              {prefecturesList.map((value, index) => (
                <Option key={index} value={jaPrefecturesList[index]}
                  sx={{
                    width: {
                      xs: "calc(0.95 * 100vw)",
                      md: "calc(0.30 * (100vw - 255px))",
                      lg: "calc(0.20 * (100vw - 255px))"
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={prefecture.indexOf(jaPrefecturesList[index]) > -1}
                    readOnly
                    style={{ transform: "scale(1.25)" }}
                  />
                  {value}
                </Option>
              ))}
            </Select>
          </FormControl>
          <FormControl size="sm" sx={{ flex: 1 }}>
            <FormLabel sx={LABEL_SX}>{t("dashboardPage.municipalities")}:</FormLabel>
            <Input
              size="sm"
              placeholder={t("dashboardPage.enterText")}
              value={tempFilter.municipality}
              data-testid="municipality-input"
              onChange={(e) => handleMunicipalityChange(e.target.value)}
            />
            {tempFilter.municipality.length >= CHARACTER_LIMIT &&
              <FormHelperText sx={{ mx: 2, color: theme.palette.warning[400] }}>
                {t("errorCodes.10002")}
              </FormHelperText>}
          </FormControl>
        </Box>
        <FormControl sx={{ flex: 0.5 }} size="sm">
          <FormLabel sx={LABEL_SX}>{t("dashboardPage.searchByFacilityName")}:</FormLabel>
          <Input
            size="sm"
            placeholder={t("dashboardPage.enterText")}
            value={tempFilter.facilityName}
            data-testid="facility-name-input"
            onChange={(e) => handleFacilityNameChange(e.target.value)}
          />
          {tempFilter.facilityName.length >= CHARACTER_LIMIT &&
            <FormHelperText sx={{ mx: 2, color: theme.palette.warning[400] }}>
              {t("errorCodes.10002")}
            </FormHelperText>}
        </FormControl>
      </Box>

      <Box sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "flex-end",
        gap: 2,
        mt: 2
      }}>
        {filterModified &&
          <Typography sx={{
            fontSize: "sm",
            display: "flex",
            alignItems: "flex-end",
            color: theme.palette.primary[500],
          }}>{t("dashboardPage.filterModifiedInfo")}</Typography>}
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
