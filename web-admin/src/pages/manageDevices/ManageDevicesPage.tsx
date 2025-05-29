import {
  Alert,
  Box,
  Button,
  Stack,
  Typography,
  Select,
  Option,
  FormLabel,
  Snackbar,
} from "@mui/joy";
import {
  ArrowBackIosRounded,
  AssignmentTurnedInRounded,
  CloseRounded,
  ErrorRounded,
  InfoRounded,
} from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ResponsiveBackdrop } from "../../components/ResponsiveBackdrop";
import {
  editDeviceType,
  createDeviceType,
  getDeviceTypes,
  DeviceType,
} from "../../services/device_types";
import {
  getDevices,
  saveOrUpdateDevices,
  DeviceSaveOrUpdateRequest,
  deregisterDevices,
} from "../../services/devices";
import { getFacilitiesByCustomer } from "../../services/facility_update";
import { useStore } from "../../store";
import { DeregisterDevices } from "./components/DeregisterDevices";
import DeviceTable from "./components/DeviceTable";
import { EditDevices } from "./components/EditDevices";

interface Facility {
  id: number;
  facility_name: string;
  facility_type_id: number;
  facility_type_name: string;
  prefecture: string;
  municipality: string;
  effective_start_utc: string;
  effective_end_utc: string;
}

interface Customer {
  id: number;
  customerName: string;
  lastUpdatedBy: string;
  lastUpdatedTime: string;
}

interface ErrorRow {
  deviceId: string;
  type: 'save' | 'deregister'
};

const LABEL_SX = {
  fontSize: 16,
  fontWeight: "bold"
}; // Styling for labels

export const ManageDevicesPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { filter, customers } = useStore();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(filter.customerId);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeregisterModal, setShowDeregisterModal] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorRows, setErrorRows] = useState<ErrorRow[]>([]);
  const isInitialLoad = useRef(true);

  const selectedCustomerData = useMemo(() => {
    return customers.find((c: Customer) => c.id === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  const handleCustomerChange = async (value: number | null) => {
    setSelectedCustomerId(value);
    await fetchDataForCustomer(value);
  };

  const handleBack = () => {
    navigate("/settings");
  };

  const fetchDevices = useCallback(async (customerId: number) => {
    if (!customerId) return [];
    handleCloseSnackbar();

    try {
      const response = await getDevices(customerId);
      if (response?.devices && Array.isArray(response.devices)) {
        setDevices(response.devices);
        return response.devices;
      }
      setDevices([]);
      return [];
    } catch (error: any) {
      console.error('Error fetching devices:', error);
      setErrorMessage("manageDevicesPage.errors.deviceFetchFailed");
      setOpenSnackbar(true);
      setDevices([]);
      return [];
    }
  }, []);

  const fetchFacilities = useCallback(async (customerId: number) => {
    if (!customerId) return [];
    handleCloseSnackbar();

    try {
      const response = await getFacilitiesByCustomer(customerId);
      if (response?.facilities) {
        setFacilities(response.facilities);
        return response.facilities;
      }
      setFacilities([]);
      return [];
    } catch (error: any) {
      console.error('Error fetching facilities:', error);
      setErrorMessage("manageDevicesPage.errors.facilityFetchFailed");
      setOpenSnackbar(true);
      setFacilities([]);
      return [];
    }
  }, []);

  const fetchDeviceTypes = useCallback(async () => {
    try {
      handleCloseSnackbar();

      const types = await getDeviceTypes();

      if (Array.isArray(types)) {
        setDeviceTypes(types);
        return types;
      }
    } catch (error: any) {
      console.error('Error fetching device types:', error);
      setErrorMessage("manageDevicesPage.errors.deviceTypeFetchFailed");
      setOpenSnackbar(true);
    }
  }, []);

  const fetchDataForCustomer = useCallback(async (customerId: number | null) => {
    setIsLoading(true);
    handleCloseSnackbar();
    setDevices([]);
    setFacilities([]);
    setSelectedDevices([]);

    if (customers.length === 0) {
      setErrorMessage("manageDevicesPage.errors.noCustomerFound");
      setOpenSnackbar(true);
      setIsLoading(false);
      return;
    }

    if (!customerId) {
      setErrorMessage("manageDevicesPage.errors.noCustomerSelected");
      setOpenSnackbar(true);
      setIsLoading(false);
      return;
    }

    try {
      await Promise.all([
        fetchDeviceTypes(),
        fetchFacilities(customerId),
        fetchDevices(customerId)
      ]);
    } catch (error: any) {
      console.error('Error fetching customer data:', error);
      setErrorMessage("manageDevicesPage.errors.customerDataFetchFailed");
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  }, [customers, fetchDeviceTypes, fetchFacilities, fetchDevices]);

  useEffect(() => {
    if (isInitialLoad.current && customers?.length > 0) {
      const customerId = selectedCustomerId || customers[0].id;
      fetchDataForCustomer(customerId);
      setSelectedCustomerId(customerId);
      isInitialLoad.current = false;
    }
  }, [selectedCustomerId, customers, fetchDataForCustomer]);

  const handleDeviceSelection = (deviceIds: string[]) => {
    setSelectedDevices(deviceIds);
  };

  const handleEditApply = async (changes: {
    facilityName: string;
    deviceType: string;
    deviceIds: string[];
  }) => {
    try {
      const updatedDevices = devices.map(device => {
        if (changes.deviceIds.includes(device.device_id)) {
          return {
            ...device,
            facility_name: changes?.facilityName || device.facility_name,
            device_type_name: changes?.deviceType || device.device_type_name,
          };
        }
        return device;
      });

      setDevices(updatedDevices);
      setErrorRows(prev =>
        prev.filter(er => {
          const device = updatedDevices.find(d => d.device_id === er.deviceId);

          // Remove error row if the conditions are met
          return !(
            device &&
            er.type === 'save' &&
            device.facility_name &&
            device.device_type_name
          );
        })
      );
      setShowEditModal(false);
    } catch (error: any) {
      console.error('Error updating devices:', error);
      setErrorMessage("manageDevicesPage.errors.editFailed");
      setOpenSnackbar(true);
    }
  };

  const handleCreateDeviceType = async (deviceTypeName: string, base64Image: string) => {
    try {
      if (!deviceTypeName.trim() || !base64Image) return;

      const result = await createDeviceType(deviceTypeName, base64Image);

      const updatedTypes = await getDeviceTypes();
      setDeviceTypes(updatedTypes);

      return result;
    } catch (error: any) {
      console.error('Error creating device type:', error);
      throw error;
    }
  };

  const handleUpdateDeviceType = async (
    deviceTypeId: number,
    newName: string,
    newBase64Image: string
  ) => {
    try {
      if (!newName.trim() || !newBase64Image) return;

      await editDeviceType(deviceTypeId, newName, newBase64Image);

      const updatedTypes = await getDeviceTypes();
      setDeviceTypes(updatedTypes);
    } catch (error: any) {
      console.error('Error updating device type:', error);
      throw error;
    }
  };

  const handleDeregisterClick = () => {
    handleCloseSnackbar();
    setErrorRows([]);

    // Check if any selected devices are not registered
    const unregisteredDevices = devices.filter(d => selectedDevices.includes(d.device_id) && !d.registered_flag);

    // If not registered devices are selected, show an error
    if (unregisteredDevices.length > 0) {
      setErrorMessage("manageDevicesPage.errors.deregisterNotAllowed");
      setErrorRows(unregisteredDevices.map(d => ({ deviceId: d.device_id, type: 'deregister' })));
      setOpenSnackbar(true);
      return;
    }

    setShowDeregisterModal(true);
  };

  const handleDeregisterSelectedDevices = async () => {
    if (isLoading || !selectedCustomerData?.id) return;
    setIsLoading(true);
    handleCloseSnackbar();

    try {
      // Filter and map devices
      const devicesToDeregister = devices
        .filter(d => selectedDevices.includes(d.device_id))
        .map(({ facility_id, device_id }) => ({ facility_id, device_id }));

      // Execute and refresh the data
      await deregisterDevices(devicesToDeregister);
      setShowDeregisterModal(false);
      await fetchDataForCustomer(selectedCustomerData.id); // Refresh device list
      setSelectedDevices([]);
      setSuccessMessage("manageDevicesPage.deregisterSuccess");
    } catch (error: any) {
      setShowDeregisterModal(false);
      console.error('Error deregistering devices:', error);
      setErrorMessage("manageDevicesPage.errors.deregisterFailed");
    } finally {
      setIsLoading(false);
      setOpenSnackbar(true);
    }
  };

  const handleSaveClick = async () => {
    handleCloseSnackbar();
    setErrorRows([]);

    const mappedDevices = devices
      .filter(d => selectedDevices.includes(d.device_id))
      .map(device => ({
        device_id: device.device_id,
        device_name: device.device_name,
        facility_id: facilities.find(f => f.facility_name === device.facility_name)?.id,
        device_type_id: deviceTypes.find(dt => dt.name === device.device_type_name)?.id,
      }));

    // Identify invalid devices
    const invalidDevices = mappedDevices.filter(d => !d.facility_id || !d.device_type_id);
    if (invalidDevices.length > 0) {
      setErrorMessage("manageDevicesPage.errors.saveNotAllowed");
      setErrorRows(invalidDevices.map(d => ({ deviceId: d.device_id, type: 'save' })));
      setOpenSnackbar(true);
      return;
    }

    // Proceed to save valid devices
    const devicesToSave = mappedDevices.filter(d => d.facility_id && d.device_type_id);
    await handleSaveSelectedDevices(devicesToSave);
  };

  const handleSaveSelectedDevices = async (devicesToSave: any) => {
    if (isLoading || !selectedCustomerData?.id) return;
    setIsLoading(true);
    handleCloseSnackbar();

    try {
      const requestData: DeviceSaveOrUpdateRequest = {
        customer_id: selectedCustomerData.id,
        devices: devicesToSave,
      };

      await saveOrUpdateDevices(requestData);
      await fetchDataForCustomer(selectedCustomerData.id); // Refresh device list
      setSelectedDevices([]);
      setSuccessMessage("manageDevicesPage.saveSuccess");
    } catch (error) {
      console.error('Error saving or updating devices:', error);
      setErrorMessage("manageDevicesPage.errors.saveFailed");
    } finally {
      setIsLoading(false);
      setOpenSnackbar(true);
    }
  };

  const handleRefreshDevices = async () => {
    handleCloseSnackbar();
    setErrorRows([]);
    setDevices([]);
    setSelectedDevices([]);
    if (selectedCustomerData?.id) {
      fetchDataForCustomer(selectedCustomerData?.id);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setSuccessMessage("");
    setErrorMessage("");
  };

  return (
    <>
      {isLoading && <ResponsiveBackdrop open={true} />}

      <Stack sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 110px)",
        mt: 0,
        pt: "10px",
        pb: 0,
        overflow: "hidden",
      }}>
        <Box sx={{
          flexShrink: 0,
        }}>
          <Box sx={{
            display: "flex",
            alignItems: "center",
            mb: 2,
          }}>
            <IconButton onClick={handleBack}>
              <ArrowBackIosRounded />
            </IconButton>
            <Typography level="h2" component="h1">{t("settingsPage.manageDevices")}</Typography>
          </Box>

          <Box sx={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 2,
            mb: 2
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, maxWidth: 240 }}>
              <FormLabel sx={{ ...LABEL_SX, mb: 0, whiteSpace: "nowrap" }}>
                {t("dashboardPage.customerName")}:
              </FormLabel>
              <Select
                size="sm"
                value={selectedCustomerId}
                onChange={(_, value) => handleCustomerChange(value)}
                placeholder={t("manageDevicesPage.selectCustomer")}
                sx={{ minWidth: 160 }}
              >
                {customers?.length ? (
                  customers.map((value: Customer) => (
                    <Option
                      key={value.id}
                      value={value.id}
                      sx={{
                        wordBreak: "break-word",
                        whiteSpace: "normal",
                      }}
                    >
                      {value.customerName}
                    </Option>
                  ))
                ) : (
                  <Option disabled value="">
                    {t("manageDevicesPage.errors.noCustomerFound")}
                  </Option>
                )}
              </Select>
            </Box>
            <Button
              variant="solid"
              onClick={handleRefreshDevices}
              data-testid="refresh-devices-btn"
            >
              {t("manageDevicesPage.refreshDeviceList")}
            </Button>
          </Box>
          {devices.length === 0 && !isLoading && !errorMessage && (
            <Alert sx={{ mb: 1 }}>
              <InfoRounded />
              {t("manageDevicesPage.noDevicesFound")}
            </Alert>
          )}
        </Box>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
          }}
        >
          <Box sx={{
            overflow: "auto",
            flex: 1,
          }}>
            <DeviceTable
              devices={devices.map(d => ({
                id: d.device_id,
                deviceName: d.device_name,
                deviceId: d.device_id,
                facilityName: d.facility_name || '',
                facilityId: d.facility_id,
                deviceType: d.device_type_name || '',
                group: d.group_name || '',
                status: d.registered_flag ? 'Registered' : 'Not Registered',
                connection_status: d.connection_status
              }))}
              facilities={facilities}
              deviceTypes={deviceTypes}
              selectedDevices={selectedDevices}
              setSelectedDevices={setSelectedDevices}
              onSelectionChange={handleDeviceSelection}
              customerId={selectedCustomerId!}
              customerName={selectedCustomerData?.customerName ?? ""}
              onFacilityChange={async (deviceId, facilityName) => {
                try {
                  setDevices(prevDevices =>
                    prevDevices.map(device =>
                      device.device_id === deviceId
                        ? { ...device, facility_name: facilityName }
                        : device
                    )
                  );
                } catch (error) {
                  console.error('Error changing facility:', error);
                  setErrorMessage("manageDevicesPage.errors.facilityUpdateFailed");
                  setOpenSnackbar(true);
                }
              }}
              onDeviceTypeChange={async (deviceId, deviceType) => {
                try {
                  setDevices(prevDevices =>
                    prevDevices.map(device =>
                      device.device_id === deviceId
                        ? { ...device, device_type_name: deviceType }
                        : device
                    )
                  );
                } catch (error) {
                  console.error('Error changing device type:', error);
                  setErrorMessage("manageDevicesPage.errors.deviceTypeUpdateFailed");
                  setOpenSnackbar(true);
                }
              }}
              onCreateDeviceType={handleCreateDeviceType}
              onUpdateDeviceType={handleUpdateDeviceType}
              onFacilityUpdate={async () => {
                if (selectedCustomerData?.id) {
                  await fetchFacilities(selectedCustomerData.id);
                }
              }}
              errorRows={errorRows}
              setErrorRows={setErrorRows}
            />
          </Box>
        </Box>

        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            right: 0,
            zIndex: 100,
            padding: "8px 20px",
            boxSizing: "border-box",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              mb: 2,
            }}
          >
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => navigate("/settings")}
              sx={{ minWidth: "100px" }}
              data-testid="cancel-btn"
            >
              {t("manageDevicesPage.cancel")}
            </Button>
            <Button
              variant="outlined"
              color="danger"
              onClick={handleDeregisterClick}
              disabled={selectedDevices.length === 0}
              sx={{
                minWidth: "100px",
              }}
            >
              {t("manageDevicesPage.deregisterSelectedDevices")} ({selectedDevices.length})
            </Button>
            <Button
              variant="outlined"
              onClick={() => setShowEditModal(true)}
              disabled={selectedDevices.length === 0}
              sx={{
                minWidth: "100px",
              }}
            >
              {t("manageDevicesPage.editSelectedDevices")} ({selectedDevices.length})
            </Button>
            <Button
              variant="solid"
              onClick={handleSaveClick}
              disabled={isLoading || selectedDevices.length === 0}
              sx={{ minWidth: "100px" }}
              data-testid="save-selected-devices-btn"
            >
              {t("manageDevicesPage.saveSelectedDevices")} ({selectedDevices.length})
            </Button>
          </Box>
        </Box>
        <EditDevices
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          selectedDevices={devices.filter(d => selectedDevices.includes(d.device_id))}
          facilities={facilities}
          deviceTypes={deviceTypes}
          onApply={async (changes) => await handleEditApply(changes)}
          onCreateDeviceType={handleCreateDeviceType}
          onUpdateDeviceType={handleUpdateDeviceType}
          customerId={selectedCustomerId!}
          customerName={selectedCustomerData?.customerName ?? ""}
          onFacilityUpdate={async () => {
            if (selectedCustomerData?.id) {
              await fetchFacilities(selectedCustomerData.id);
            }
          }}
        />
        <DeregisterDevices
          open={showDeregisterModal}
          onClose={() => setShowDeregisterModal(false)}
          selectedDevices={selectedDevices}
          customerName={selectedCustomerData?.customerName ?? ""}
          onDeregister={handleDeregisterSelectedDevices}
        />
      </Stack>
      {(successMessage || errorMessage) ? <Snackbar
        variant="soft"
        size="lg"
        open={openSnackbar}
        color={successMessage ? "success" : "danger"}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ zIndex: 12000 }}
        startDecorator={successMessage ? <AssignmentTurnedInRounded /> : <ErrorRounded />}
        endDecorator={
          <IconButton
            color={successMessage ? "success" : "error"}
            onClick={handleCloseSnackbar}
          >
            <CloseRounded />
          </IconButton>
        }
      >
        {t(successMessage) || t(errorMessage)}
      </Snackbar> : null}
    </>
  );
};
