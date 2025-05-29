import { InfoOutlined, KeyboardArrowDown, KeyboardArrowRight } from "@mui/icons-material";
import { Box, Checkbox, Table, Typography } from "@mui/joy";
import { Tooltip } from "@mui/material";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { getFacilityById } from "src/services/facility_update";
import { SelectWithAddAndEdit } from "../../../components/SelectWithAddAndEdit";
import { DeviceType, getDeviceTypeById } from "../../../services/device_types";
import { AddDeviceType } from "./AddDeviceType";
import { AddFacility } from "./AddFacility";

interface Device {
  id: string;
  deviceName: string;
  deviceId: string;
  facilityName: string;
  facilityId: number | null;
  deviceType: string;
  group: string;
  status: string;
  connection_status: string;
}

interface ErrorRow {
  deviceId: string;
  type: 'save' | 'deregister';
}

interface DeviceTableProps {
  devices: Device[];
  facilities: Facility[];
  deviceTypes: DeviceType[];
  selectedDevices: string[];
  setSelectedDevices: React.Dispatch<React.SetStateAction<string[]>>;
  onAddFacility?: (name: string) => void;
  onEditFacility?: (facilityName: string, facilityId: number | null) => void;
  onCreateDeviceType: (deviceType: string, base64Image: string) => Promise<any>;
  onFacilityChange?: (deviceId: string, facilityName: string) => void;
  onDeviceTypeChange?: (deviceId: string, deviceType: string) => void;
  onUpdateDeviceType?: (deviceTypeId: number, newName: string, newBase64Image: string) => Promise<void>;
  customerName: string;
  customerId: number;
  onFacilityUpdate?: () => Promise<void>;
  onSelectionChange?: (selectedDevices: string[]) => void;
  errorRows?: ErrorRow[];
  setErrorRows?: React.Dispatch<React.SetStateAction<ErrorRow[]>>;
}

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

interface FacilityDetail {
  id?: number;
  customer_id: number;
  effective_end_utc: string;
  effective_start_utc: string;
  facility_name: string;
  facility_type_id: number;
  facility_type_name: string;
  prefecture: string;
  municipality: string;
}

const DeviceTable: React.FC<DeviceTableProps> = ({
  devices = [],
  selectedDevices,
  setSelectedDevices,
  onAddFacility,
  onFacilityChange,
  onDeviceTypeChange,
  onCreateDeviceType,
  onUpdateDeviceType,
  customerName,
  customerId,
  deviceTypes,
  facilities,
  onFacilityUpdate,
  onSelectionChange,
  errorRows = [],
  setErrorRows,
}) => {
  const { t } = useTranslation();

  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);

  const [isEditFacility, setIsEditFacility] = useState(false);
  const [newFacilityName, setNewFacilityName] = useState("");
  const [currentFacility, setCurrentFacility] = useState<FacilityDetail | null>(null);
  const [showFacilityModal, setShowFacilityModal] = useState(false);

  const [isEditDeviceType, setIsEditDeviceType] = useState(false);
  const [currentDeviceType, setCurrentDeviceType] = useState<DeviceType | null>(null);
  const [showDeviceTypeModal, setShowDeviceTypeModal] = useState(false);

  const groupedDevices = useMemo(() => {
    return devices.reduce((acc, device) => {
      if (!acc[device.group]) {
        acc[device.group] = [];
      }
      acc[device.group].push(device);
      return acc;
    }, {} as Record<string, Device[]>);
  }, [devices]);

  useEffect(() => {
    if (devices.length === 0) {
      setSelectedDevices([]);
      setCollapsedGroups([]);
      onSelectionChange?.([]);
    }
  }, [devices.length, onSelectionChange, setSelectedDevices]);

  const handleCheckboxChange = (deviceId: string) => {
    const newSelectedDevices = selectedDevices.includes(deviceId)
      ? selectedDevices.filter(id => id !== deviceId)
      : [...selectedDevices, deviceId];

    setSelectedDevices(newSelectedDevices);
    onSelectionChange?.(newSelectedDevices);

    // Remove from errorRows if unchecked
    if (
      setErrorRows &&
      errorRows.some(er => er.deviceId === deviceId) &&
      !newSelectedDevices.includes(deviceId)
    ) {
      setErrorRows(prev => prev.filter(er => er.deviceId !== deviceId));
    }
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSelectedDevices = event.target.checked ? devices.map(device => device.id) : [];
    setSelectedDevices(newSelectedDevices);
    onSelectionChange?.(newSelectedDevices);

    // Remove all from errorRows if unchecked all
    if (
      setErrorRows &&
      !event.target.checked &&
      errorRows.length > 0
    ) {
      setErrorRows([]);
    }
  };

  const handleSelectGroup = (group: string, isChecked: boolean) => {
    const groupDeviceIds = groupedDevices[group].map(device => device.id);
    const newSelectedDevices = isChecked
      ? [...new Set([...selectedDevices, ...groupDeviceIds])]
      : selectedDevices.filter(id => !groupDeviceIds.includes(id));

    setSelectedDevices(newSelectedDevices);
    onSelectionChange?.(newSelectedDevices);

    // Remove from errorRows if group unchecked
    if (
      setErrorRows &&
      !isChecked &&
      errorRows.length > 0
    ) {
      setErrorRows(prev => prev.filter(er => !groupDeviceIds.includes(er.deviceId)));
    }
  };

  const handleFacilityChange = useCallback(async (deviceId: string, newValue: string) => {
    const currentDevice = devices.find(d => d.id === deviceId);
    if (currentDevice && currentDevice.facilityName !== newValue) {
      try {
        await onFacilityChange?.(deviceId, newValue);

        // Remove error if both facility and device type are filled
        if (
          setErrorRows &&
          errorRows.some(er => er.deviceId === deviceId && er.type === 'save') &&
          newValue && currentDevice.deviceType // both filled
        ) {
          setErrorRows(prev => prev.filter(er => er.deviceId !== deviceId));
        }
      } catch (error) {
        console.error('Error changing facility:', error);
      }
    }
  }, [devices, onFacilityChange, setErrorRows, errorRows]);

  const handleDeviceTypeChange = useCallback(async (deviceId: string, newValue: string) => {
    const currentDevice = devices.find(d => d.id === deviceId);
    if (currentDevice && currentDevice.deviceType !== newValue) {
      try {
        await onDeviceTypeChange?.(deviceId, newValue);

        // Remove error if both facility and device type are filled
        if (
          setErrorRows &&
          errorRows.some(er => er.deviceId === deviceId && er.type === 'save') &&
          currentDevice.facilityName && newValue // both filled
        ) {
          setErrorRows(prev => prev.filter(er => er.deviceId !== deviceId));
        }
      } catch (error) {
        console.error('Error changing device type:', error);
      }
    }
  }, [devices, onDeviceTypeChange, setErrorRows, errorRows]);

  const toggleGroup = (group: string) => {
    setCollapsedGroups(prev =>
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  };

  const handleDeviceTypeAction = async (name: string, base64Image: string) => {
    try {
      if (isEditDeviceType && onUpdateDeviceType && currentDeviceType?.id) {
        await onUpdateDeviceType(currentDeviceType.id, name, base64Image);
        const devicesToUpdate = devices.filter(
          d => d.deviceType === currentDeviceType.name || d.id === currentDeviceId
        );
        for (const device of devicesToUpdate) {
          await onDeviceTypeChange?.(device.id, name);
        }
      } else {
        await onCreateDeviceType(name, base64Image);
        if (currentDeviceId) {
          await onDeviceTypeChange?.(currentDeviceId, name);
        }
      }
      setShowDeviceTypeModal(false);
    } catch (error) {
      console.error('Error handling device type action:', error);
      throw error;
    }
  };

  const handleDeviceTypeModalClose = () => {
    setShowDeviceTypeModal(false);
    setIsEditDeviceType(false);
    setCurrentDeviceType(null);
  };

  const handleFacilityAction = async (facilityName: string) => {
    try {
      if (onFacilityUpdate) {
        await onFacilityUpdate();
      }

      if (isEditFacility && currentFacility) {
        const devicesToUpdate = devices.filter(
          (d) =>
            d.facilityName === currentFacility.facility_name || d.id === currentDeviceId
        );
        for (const device of devicesToUpdate) {
          await onFacilityChange?.(device.id, facilityName);
        }
      } else {
        if (onAddFacility) {
          await onAddFacility(facilityName);
        }
        if (currentDeviceId) {
          await onFacilityChange?.(currentDeviceId, facilityName);
        }
      }
      setShowFacilityModal(false);
    } catch (error) {
      console.error("Error handling facility action:", error);
      throw error;
    }
  };

  const handleFacilityModalClose = () => {
    setShowFacilityModal(false);
    setIsEditFacility(false);
    setCurrentFacility(null);
    setCurrentDeviceId(null);
  };

  const handleAddFacilityClick = async (deviceId: string, facilityName: string) => {
    setNewFacilityName(facilityName);
    setIsEditFacility(false);
    setShowFacilityModal(true);
    setCurrentDeviceId(deviceId);
  };

  const handleEditFacilityClick = async (facilityId: number) => {
    try {
      const facilityDetails = await getFacilityById(facilityId);
      if (facilityDetails) {
        setCurrentFacility(facilityDetails);
        setIsEditFacility(true);
        setShowFacilityModal(true);
      }
    } catch (error) {
      console.error('Error fetching facility details:', error);
    }
  };

  const handleAddDeviceTypeClick = async (deviceId: string, deviceTypeName: string) => {
    setCurrentDeviceId(deviceId);
    setIsEditDeviceType(false);
    setCurrentDeviceType({
      id: -1,
      name: deviceTypeName,
      sample_image_blob: undefined,
    } as DeviceType);
    setShowDeviceTypeModal(true);
  };

  const handleEditDeviceTypeClick = async (deviceTypeId: number) => {
    const deviceType = await getDeviceTypeById(deviceTypeId);
    if (deviceType) {
      setIsEditDeviceType(true);
      setCurrentDeviceType(deviceType);
      setShowDeviceTypeModal(true);
    }
  };

  // To check if a device is in errorRows:
  const isErrorRow = (deviceId: string, type?: 'save' | 'deregister') =>
    errorRows?.some(er => er.deviceId === deviceId && (!type || er.type === type));

  return (
    <Box>
      <Table
        sx={{
          width: '100%',
          tableLayout: 'fixed',
          borderCollapse: 'separate',
          '& th, & td': {
            borderBottom: '1px solid #e0e0e0',
          },
        }}
      >
        <thead style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          backgroundColor: 'white',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
        }}>
          <tr>
            <th style={{ width: '40px' }}>
              <Checkbox
                checked={selectedDevices.length === devices.length && devices.length > 0}
                indeterminate={selectedDevices.length > 0 && selectedDevices.length < devices.length}
                onChange={handleSelectAll}
                data-testid="select-all-checkbox"
              />
            </th>
            <th style={{ width: '21.5%' }}>{t("deviceTable.deviceName")}</th>
            <th style={{ width: '21.5%' }}>{t("deviceTable.deviceId")}</th>
            <th style={{ width: '22.5%' }}>{t("deviceTable.facilityName")}</th>
            <th style={{ width: '22.5%' }}>{t("deviceTable.deviceType")}</th>
            <th style={{ width: '12%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {t("deviceTable.statusShort")}
                <Tooltip title={t("deviceTable.status")} placement="top">
                  <InfoOutlined sx={{ fontSize: 16, cursor: 'pointer', color: 'gray' }} />
                </Tooltip>
              </Box>
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedDevices).map(([group, groupDevices]) => (
            <React.Fragment key={group}>
              <tr
                style={{
                  backgroundColor: '#f5f5f5',
                  position: 'sticky',
                  top: '40px',
                  zIndex: 10,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <td>
                  <Checkbox
                    checked={groupDevices.every(device => selectedDevices.includes(device.id))}
                    indeterminate={
                      groupDevices.some(device => selectedDevices.includes(device.id)) &&
                      !groupDevices.every(device => selectedDevices.includes(device.id))
                    }
                    onChange={(e) => handleSelectGroup(group, e.target.checked)}
                    data-testid={`select-group-${group}`}
                  />
                </td>
                <td
                  colSpan={5}
                  onClick={() => toggleGroup(group)}
                  style={{ cursor: 'pointer' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {collapsedGroups.includes(group) ? (
                      <KeyboardArrowRight />
                    ) : (
                      <KeyboardArrowDown />
                    )}
                    <Typography
                      level='body-md'
                      component="span"
                      sx={{ ml: 1, fontWeight: 'bold' }}
                    >
                      {group}
                    </Typography>
                  </Box>
                </td>
              </tr>
              {!collapsedGroups.includes(group) && groupDevices.map((device) => (
                <tr
                  key={device.id}
                  style={{
                    backgroundColor: isErrorRow(device.id) ? '#ffe6e6' : 'white',
                  }}
                >
                  <td>
                    <Checkbox
                      checked={selectedDevices.includes(device.id)}
                      onChange={() => handleCheckboxChange(device.id)}
                      data-testid={`select-device-${device.id}`}
                    />
                  </td>
                  <td>
                    <Tooltip title={device.deviceName}>
                      <Typography
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          whiteSpace: 'normal',
                          wordBreak: 'break-all',
                          maxWidth: '100%',
                        }}
                      >
                        {device.deviceName}
                      </Typography>
                    </Tooltip>
                  </td>
                  <td>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography
                        component="span"
                        sx={{
                          color: device.connection_status === 'Connected' ? 'green' : 'red',
                          mr: 1,
                        }}
                      >
                        {device.connection_status === 'Connected' ? '●' : '×'}
                      </Typography>
                      <Tooltip title={device.deviceId}>
                        <Typography
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            whiteSpace: 'normal',
                            wordBreak: 'break-all',
                            maxWidth: '100%',
                          }}
                        >
                          {device.deviceId}
                        </Typography>
                      </Tooltip>
                    </Box>
                  </td>
                  <td>
                    <SelectWithAddAndEdit
                      id={`facility-select-${device.id}`}
                      currentValue={device.facilityName}
                      placeholder={t("deviceTable.findOrCreate")}
                      error={isErrorRow(device.id, 'save') && !device.facilityName}
                      options={facilities.map(f => ({ key: f.id, inputValue: f.facility_name }))}
                      onChange={(option) => handleFacilityChange(device.id, option?.inputValue || "")}
                      onEdit={(option) => handleEditFacilityClick(option.key)}
                      onAddNew={(newValue) => handleAddFacilityClick(device.id, newValue)}
                    />
                  </td>
                  <td>
                    <SelectWithAddAndEdit
                      id={`device-type-select-${device.id}`}
                      currentValue={device.deviceType}
                      placeholder={t("deviceTable.findOrCreate")}
                      error={isErrorRow(device.id, 'save') && !device.deviceType}
                      options={deviceTypes.map(dt => ({ key: dt.id, inputValue: dt.name }))}
                      onChange={(option) => handleDeviceTypeChange(device.id, option?.inputValue || "")}
                      onEdit={(option) => handleEditDeviceTypeClick(option.key)}
                      onAddNew={(newValue) => handleAddDeviceTypeClick(device.id, newValue)}
                    />
                  </td>
                  <td>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        gap: 1
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          color: device.status === 'Registered' ? 'success.500' : 'danger.500',
                          backgroundColor: device.status === 'Registered' ? 'success.50' : 'danger.50',
                          padding: '4px 8px',
                          borderRadius: 'md',
                          fontSize: 'sm',
                          fontWeight: 'md',
                        }}
                      >
                        {device.status === 'Registered' ? (
                          <>
                            <Box
                              component="span"
                              sx={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: 'success.500',
                                marginRight: '4px'
                              }}
                            />
                            {t("deviceTable.registered")}
                          </>
                        ) : (
                          <>
                            <Box
                              component="span"
                              sx={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: 'danger.500',
                                marginRight: '4px'
                              }}
                            />
                            {t("deviceTable.notRegistered")}
                          </>
                        )}
                      </Typography>
                    </Box>
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </Table>

      <AddDeviceType
        open={showDeviceTypeModal}
        onClose={handleDeviceTypeModalClose}
        onSubmit={handleDeviceTypeAction}
        initialDeviceType={currentDeviceType}
        isEdit={isEditDeviceType}
      />

      <AddFacility
        open={showFacilityModal}
        onClose={handleFacilityModalClose}
        onSubmit={(facilityData) => handleFacilityAction(facilityData.name)}
        initialFacilityName={newFacilityName}
        customerName={customerName}
        facility={currentFacility}
        isEdit={isEditFacility}
        customerId={customerId}
      />
    </Box>
  );
};

export default DeviceTable;
