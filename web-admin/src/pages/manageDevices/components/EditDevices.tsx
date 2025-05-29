import React, { useState } from 'react';
import { Modal, Box, Typography, Button } from "@mui/joy";
import { DeviceType, getDeviceTypeById } from '../../../services/device_types';
import { useTranslation } from 'react-i18next';
import { AddDeviceType } from "./AddDeviceType";
import { AddFacility } from './AddFacility';
import { getFacilityById } from 'src/services/facility_update';
import { SelectWithAddAndEdit } from '../../../components/SelectWithAddAndEdit';

// DeviceTableから必要なインターフェースをインポート
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

interface EditDevicesProps {
  open: boolean;
  onClose: () => void;
  selectedDevices: {
    device_id: string;
    device_name: string;
    device_type_id: number | null;
    device_type_name: string;
    facility_id: number | null;
    facility_name: string;
    group_name: string;
    registered_flag: boolean;
  }[];
  facilities: {
    id: number;
    facility_name: string;
  }[];
  deviceTypes: DeviceType[];
  onApply: (changes: {
    facilityName: string;
    deviceType: string;
    deviceIds: string[];
  }) => void;
  onAddFacility?: (name: string) => void;
  onCreateDeviceType: (deviceType: string, base64Image: string) => Promise<any>;
  onUpdateDeviceType?: (deviceTypeId: number, newName: string, newBase64Image: string) => Promise<void>;
  customerName: string;
  customerId: number;
  onFacilityUpdate?: () => Promise<void>;
}

export const EditDevices: React.FC<EditDevicesProps> = ({
  open,
  onClose,
  facilities,
  deviceTypes,
  onApply,
  selectedDevices,
  onAddFacility,
  onCreateDeviceType,
  onUpdateDeviceType,
  customerName,
  customerId,
  onFacilityUpdate
}) => {
  const { t } = useTranslation();

  // Facility states
  const [facilityName, setFacilityName] = useState("");
  const [isEditFacility, setIsEditFacility] = useState(false);
  const [newFacilityName, setNewFacilityName] = useState("");
  const [currentFacility, setCurrentFacility] = useState<FacilityDetail | null>(null);
  const [showFacilityModal, setShowFacilityModal] = useState(false);

  // Device Type states
  const [deviceType, setDeviceType] = useState("");
  const [isEditDeviceType, setIsEditDeviceType] = useState(false);
  const [currentDeviceType, setCurrentDeviceType] = useState<DeviceType | null>(null);
  const [showDeviceTypeModal, setShowDeviceTypeModal] = useState(false);

  // 施設編集ハンドラー
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

  // 新規施設追加ハンドラー
  const handleAddFacilityClick = async (facilityName: string) => {
    setShowFacilityModal(true);
    setIsEditFacility(false);
    setNewFacilityName(facilityName);
  };

  // 施設名の変更ハンドラー
  const handleFacilityChange = async (newValue: string) => {
    setFacilityName(newValue);
  };

  // 施設名の編集ハンドラー
  const handleFacilityAction = async (facilityName: string) => {
    try {
      if (onAddFacility) {
        await onAddFacility(facilityName);
        if (onFacilityUpdate) {
          await onFacilityUpdate();
        }
      }
      setFacilityName(facilityName);
      setShowFacilityModal(false);
    } catch (error) {
      console.error('Error handling facility action:', error);
      throw error;
    }
  };

  // 施設オプションの取得
  const handleFacilityModalClose = () => {
    setShowFacilityModal(false);
    setIsEditFacility(false);
    setCurrentFacility(null);
    setNewFacilityName("");
  };

  // デバイスタイプの編集ハンドラー
  const handleEditDeviceTypeClick = async (deviceTypeId: number) => {
    const deviceType = await getDeviceTypeById(deviceTypeId);
    if (deviceType) {
      setCurrentDeviceType(deviceType);
      setIsEditDeviceType(true);
      setShowDeviceTypeModal(true);
    }
  };

  // 新規デバイスタイプ追加ハンドラー
  const handleAddDeviceTypeClick = (deviceTypeName: string) => {
    setShowDeviceTypeModal(true);
    setIsEditDeviceType(false);
    setCurrentDeviceType({
      id: -1,
      name: deviceTypeName,
      sample_image_blob: undefined,
    } as DeviceType);
  };

  // デバイスタイプの変更ハンドラー
  const handleDeviceTypeChange = async (newValue: string) => {
    setDeviceType(newValue);
  };

  // デバイスタイプの編集ハンドラー
  const handleDeviceTypeAction = async (name: string, base64Image: string) => {
    try {
      if (isEditDeviceType && onUpdateDeviceType && currentDeviceType?.id) {
        await onUpdateDeviceType(currentDeviceType.id, name, base64Image);
      } else {
        await onCreateDeviceType(name, base64Image);
      }
      // 作成成功時に選択値を設定
      setDeviceType(name);
      setShowDeviceTypeModal(false);
    } catch (error) {
      console.error('Error handling device type action:', error);
      throw error;
    }
  };

  // デバイスタイプオプションの取得
  const handleDeviceTypeModalClose = () => {
    setShowDeviceTypeModal(false);
    setIsEditDeviceType(false);
    setCurrentDeviceType(null);
  };

  const handleApply = () => {
    const changes = {
      facilityName,
      deviceType,
      deviceIds: selectedDevices.map(device => device.device_id)
    };
    onApply(changes);
    handleCancel();
  };

  const handleCancel = () => {
    setFacilityName("");
    setDeviceType("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleCancel}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box sx={{
        width: '600px',
        maxWidth: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        borderRadius: 1,
        bgcolor: '#fff',
        boxShadow: 'lg',
        p: 4,
      }}>
        <Typography level="h4" component="h2" sx={{ mb: 3 }}>
          {t('editDevices.title')}
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography level="body-sm" mb={1}>
            {t('editDevices.facilityName.label')}
          </Typography>
          < SelectWithAddAndEdit
            id="edit-facility-select"
            placeholder={t('editDevices.facilityName.placeholder')}
            options={facilities.map(f => ({ key: f.id, inputValue: f.facility_name }))}
            onChange={(option) => handleFacilityChange(option?.inputValue || "")}
            onEdit={(option) => handleEditFacilityClick(option.key)}
            onAddNew={handleAddFacilityClick}
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography level="body-sm" mb={1}>
            {t('editDevices.deviceType.label')}
          </Typography>
          < SelectWithAddAndEdit
            id="edit-device-type-select"
            placeholder={t('editDevices.deviceType.placeholder')}
            options={deviceTypes.map(dt => ({ key: dt.id, inputValue: dt.name }))}
            onChange={(option) => handleDeviceTypeChange(option?.inputValue || "")}
            onEdit={(option) => handleEditDeviceTypeClick(option.key)}
            onAddNew={handleAddDeviceTypeClick}
          />
        </Box>

        <Box sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          pt: 3
        }}>
          <Button
            variant="outlined"
            color="neutral"
            onClick={handleCancel}
            data-testid="cancel-edit-btn"
          >
            {t('editDevices.buttons.cancel')}
          </Button>
          <Button
            variant="solid"
            onClick={handleApply}
            disabled={!facilityName && !deviceType}
            data-testid="apply-edit-btn"
          >
            {t('editDevices.buttons.apply')}
          </Button>
        </Box>

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
          customerId={customerId}
          facility={currentFacility}
          isEdit={isEditFacility}
        />
      </Box>
    </Modal>
  );
};
