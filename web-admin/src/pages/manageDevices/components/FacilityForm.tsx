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

import { Alert, Box, Button, FormControl, FormLabel, Input, Stack, Typography } from "@mui/joy";
import { TextField } from "@mui/material";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DateTimePicker } from "@mui/x-date-pickers";
import { createOrUpdateFacility } from "../../../services/facility_update";
import { SelectWithAddAndEdit, OptionType } from "../../../components/SelectWithAddAndEdit";
import { validateString } from "src/utils";

interface FacilityFormData {
  name: string;
  type: FacilityType | null;
  prefecture: string;
  municipality: string;
  effectiveStartDate: Date | null;
  effectiveEndDate: Date | null;
}

interface FacilityApiData {
  customer_id: number;
  facility_name: string;
  facility_type_id: number;
  prefecture: string;
  municipality: string;
  effective_start_utc: string;
  effective_end_utc: string;
}


interface FacilityFormProps {
  facilityTypes: FacilityType[];
  onAddFacilityType: (inputValue: string) => void;
  initialData: FacilityFormData;
  onSubmit: (data: FacilityFormData) => void;
  onCancel: () => void;
  isEdit: boolean;
  customerName: string;
  facilityId?: number;
  customerId: number;
  selectedFacilityType?: FacilityType | null;
}

interface FacilityType {
  id: number;
  name: string;
}

const CHARACTER_LIMIT = 127;

export const FacilityForm: React.FC<FacilityFormProps> = ({
  facilityTypes,
  onAddFacilityType,
  initialData,
  onSubmit,
  onCancel,
  isEdit,
  customerName,
  customerId,
  facilityId,
  selectedFacilityType
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FacilityFormData>({
    name: initialData?.name || "",
    type: initialData?.type || { id: 0, name: "" },
    prefecture: initialData?.prefecture || "",
    municipality: initialData?.municipality || "",
    effectiveStartDate: initialData?.effectiveStartDate || null,
    effectiveEndDate: initialData?.effectiveEndDate || null,
  });
  const [error, setError] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (value.length <= CHARACTER_LIMIT) {
      setFormData(prevData => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleDateChange = (name: string) => (date: Date | null) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: date,
    }));
  };

  const handleFacilityTypeChange = (option: OptionType | null) => {
    setFormData(prev => ({
      ...prev,
      type: option ? { id: option.key, name: option.inputValue } : null
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Validation checks
    // Changed from browser standard required validation to custom application validation
    if (
      !formData.name || !formData.prefecture || !formData.municipality ||
      !validateString(formData.name, "NAME") ||
      !validateString(formData.prefecture, "NAME") ||
      !validateString(formData.municipality, "NAME") ||
      !formData.type || formData.type.id <= 0 ||
      !formData.effectiveStartDate ||
      !formData.effectiveEndDate
    ) {
      setError("errorCodes.10005");
      setIsSubmitting(false);
      return;
    }

    const formatDateForApi = (date: Date | null): string =>
      date ? date.toISOString().replace('.000', '').replace('Z', '+00:00') : '';

    const hasChanges = (): boolean => {
      const formatData = (data: FacilityFormData) => ({
        name: data.name,
        typeId: data.type?.id || 0,
        prefecture: data.prefecture,
        municipality: data.municipality,
        effectiveStartDate: formatDateForApi(data.effectiveStartDate),
        effectiveEndDate: formatDateForApi(data.effectiveEndDate),
      });
      return JSON.stringify(formatData(formData)) !== JSON.stringify(formatData(initialData));
    };

    if (isEdit && !hasChanges()) {
      setError("facilityForm.noChanges");
      setIsSubmitting(false);
      return;
    }

    try {
      const apiData: FacilityApiData = {
        customer_id: customerId,
        facility_name: formData.name,
        facility_type_id: formData.type?.id || 0,
        prefecture: formData.prefecture,
        municipality: formData.municipality,
        effective_start_utc: formatDateForApi(formData.effectiveStartDate),
        effective_end_utc: formatDateForApi(formData.effectiveEndDate),
      };

      // API呼び出し
      if (isEdit && facilityId) {
        await createOrUpdateFacility(facilityId, apiData);
      } else {
        await createOrUpdateFacility(0, apiData);
      }

      // 成功したら親コンポーネントに通知
      await onSubmit(formData);
    } catch (error: any) {
      console.error('Error creating or updating facility:', error);
      setError(isEdit
        ? 'facilityForm.failedToUpdateFacility'
        : 'facilityForm.failedToCreateFacility'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (selectedFacilityType) {
      setFormData(prev => ({
        ...prev,
        type: {
          id: selectedFacilityType.id,
          name: selectedFacilityType.name
        }
      }));
    }
  }, [selectedFacilityType]);

  return (
    <Box sx={{ p: 3, bgcolor: 'white', borderRadius: 1 }}>
      <Typography level="h4" sx={{ mb: 3 }}>
        {isEdit ? t("facilityForm.editTitle") : t("facilityForm.addTitle")}
      </Typography>

      <form onSubmit={handleSubmit} role="form">
        <Stack spacing={2.5}>
          {/* 2列レイアウト用のグリッド */}
          <FormControl>
            <FormLabel>{t("facilityForm.customerName")}</FormLabel>
            <Input value={customerName} disabled />
          </FormControl>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <FormControl>
              <FormLabel required>
                {t("facilityForm.facilityName")}
              </FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={!validateString(formData.name, "NAME")}
                slotProps={{ input: { maxLength: CHARACTER_LIMIT } }}
                placeholder={t("facilityForm.facilityName")}
                data-testid="facility-name-input"
              />
              {formData.name && (
                <Typography
                  level="body-xs"
                  sx={{
                    color: !validateString(formData.name, "NAME")
                      ? "danger.500"
                      : formData.name.length >= CHARACTER_LIMIT
                        ? "warning.400"
                        : "inherit",
                  }}
                >
                  {!validateString(formData.name, "NAME")
                    ? t("errorCodes.10003")
                    : formData.name.length >= CHARACTER_LIMIT
                      ? t("errorCodes.10002")
                      : ""}
                </Typography>
              )}
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="facility-type-select" required>
                {t("facilityForm.facilityType")}
              </FormLabel>
              <SelectWithAddAndEdit
                id="facility-type-select"
                currentValue={formData?.type?.name}
                options={facilityTypes.map((type) => ({
                  key: type.id,
                  inputValue: type.name,
                }))}
                placeholder={t("facilityForm.findOrCreate")}
                onChange={handleFacilityTypeChange}
                onAddNew={onAddFacilityType}
              />
            </FormControl>

            <FormControl>
              <FormLabel required>
                {t("facilityForm.prefecture")}
              </FormLabel>
              <Input
                name="prefecture"
                value={formData.prefecture}
                onChange={handleInputChange}
                error={!validateString(formData.prefecture, "NAME")}
                slotProps={{ input: { maxLength: CHARACTER_LIMIT } }}
                placeholder={t("facilityForm.prefecture")}
                data-testid="facility-prefecture-input"
              />
              {formData.prefecture && (
                <Typography
                  level="body-xs"
                  sx={{
                    color: !validateString(formData.prefecture, "NAME")
                      ? "danger.500"
                      : formData.prefecture.length >= CHARACTER_LIMIT
                        ? "warning.400"
                        : "inherit",
                  }}
                >
                  {!validateString(formData.prefecture, "NAME")
                    ? t("errorCodes.10003")
                    : formData.prefecture.length >= CHARACTER_LIMIT
                      ? t("errorCodes.10002")
                      : ""}
                </Typography>
              )}
            </FormControl>

            <FormControl>
              <FormLabel required>
                {t("facilityForm.municipality")}
              </FormLabel>
              <Input
                name="municipality"
                value={formData.municipality}
                onChange={handleInputChange}
                error={!validateString(formData.municipality, "NAME")}
                slotProps={{ input: { maxLength: CHARACTER_LIMIT } }}
                placeholder={t("facilityForm.municipality")}
                data-testid="facility-municipality-input"
              />
              {formData.municipality && (
                <Typography
                  level="body-xs"
                  sx={{
                    color: !validateString(formData.municipality, "NAME")
                      ? "danger.500"
                      : formData.municipality.length >= CHARACTER_LIMIT
                        ? "warning.400"
                        : "inherit",
                  }}
                >
                  {!validateString(formData.municipality, "NAME")
                    ? t("errorCodes.10003")
                    : formData.municipality.length >= CHARACTER_LIMIT
                      ? t("errorCodes.10002")
                      : ""}
                </Typography>
              )}
            </FormControl>

            <FormControl>
              <FormLabel required>
                {t("facilityForm.effectiveStartDate")}
              </FormLabel>
              <DateTimePicker
                inputFormat="yyyy/MM/dd"
                views={['year', 'month', 'day']}
                value={formData.effectiveStartDate}
                onChange={(newValue) => {
                  if (newValue) {
                    newValue.setHours(0, 0, 0, 0);
                  }
                  handleDateChange("effectiveStartDate")(newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    InputProps={{ ...params.InputProps, readOnly: true }}
                    inputProps={{
                      ...params.inputProps,
                      onKeyDown: (e) => e.preventDefault(),
                    }}
                    data-testid="facility-effective-start-date"
                  />
                )}
                maxDate={formData.effectiveEndDate || undefined}
              />
            </FormControl>

            <FormControl>
              <FormLabel required>
                {t("facilityForm.effectiveEndDate")}
              </FormLabel>
              <DateTimePicker
                inputFormat="yyyy/MM/dd"
                views={['year', 'month', 'day']}
                value={formData.effectiveEndDate}
                onChange={(newValue) => {
                  if (newValue) {
                    newValue.setHours(23, 59, 59, 0);
                  }
                  handleDateChange("effectiveEndDate")(newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    InputProps={{ ...params.InputProps, readOnly: true }}
                    inputProps={{
                      ...params.inputProps,
                      onKeyDown: (e) => e.preventDefault(),
                    }}
                    data-testid="facility-effective-end-date"
                  />
                )}
                minDate={formData.effectiveStartDate || undefined}
              />
            </FormControl>
          </Box>

          {error && (
            <Alert
              color="danger"
              variant="soft"
              sx={{ mb: 2 }}
            >
              {t(error)}
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button
              type="submit"
              variant="solid"
              loading={isSubmitting}
              loadingPosition="start"
              data-testid="add-facility-btn"
            >
              {isEdit
                ? t("facility.updateFacility")
                : t("facility.createFacility")
              }
            </Button>
            <Button
              variant="outlined"
              color="neutral"
              onClick={onCancel}
              data-testid="cancel-facility-btn"
            >
              {t("facility.closeModal")}
            </Button>
          </Box>
        </Stack>
      </form>
    </Box>
  );
};
