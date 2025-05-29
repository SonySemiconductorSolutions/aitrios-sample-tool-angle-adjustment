import React, { useState, useCallback, useEffect } from 'react';
import { Modal, Box } from '@mui/joy';
import { FacilityForm } from './FacilityForm';
import { AddFacilityType } from './AddFacilityType';
import { getFacilityTypes } from '../../../services/facility_types';

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

interface FacilityType {
  id: number;
  name: string;
}

interface FacilityFormData {
  name: string;
  type: FacilityType | null;
  prefecture: string;
  municipality: string;
  effectiveStartDate: Date | null;
  effectiveEndDate: Date | null;
}

interface AddFacilityProps {
  open: boolean;
  onClose: () => void;
  customerId: number;
  customerName: string;
  onSubmit: (facilityData: FacilityFormData) => void;
  facility: FacilityDetail | null;
  isEdit?: boolean;
  initialFacilityName?: string;
}

export const AddFacility: React.FC<AddFacilityProps> = ({
  open,
  onClose,
  customerName,
  onSubmit,
  facility,
  isEdit = false,
  initialFacilityName = '',
  customerId
}) => {
  const initialData: FacilityFormData = facility ? {
    name: facility.facility_name,
    type: {
      id: facility.facility_type_id,
      name: facility.facility_type_name
    },
    prefecture: facility.prefecture,
    municipality: facility.municipality,
    effectiveStartDate: new Date(facility.effective_start_utc),
    effectiveEndDate: new Date(facility.effective_end_utc)
  } : {
    name: initialFacilityName,
    type: {
      id: 0,
      name: ''
    },
    prefecture: '',
    municipality: '',
    effectiveStartDate: null,
    effectiveEndDate: null
  };

  const [facilityTypes, setFacilityTypes] = useState<FacilityType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFacilityType, setSelectedFacilityType] = useState<FacilityType | null>(null);
  const [showAddFacilityType, setShowAddFacilityType] = useState(false);
  const [newFacilityTypeName, setNewFacilityTypeName] = useState('');

  // 施設タイプを取得する関数
  const fetchFacilityTypes = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getFacilityTypes();
      if (response && response.data) {
        setFacilityTypes(response.data);
      }
    } catch (error) {
      console.error("Error fetching facility types:", error);
      setFacilityTypes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // コンポーネントマウント時に施設タイプを取得
  useEffect(() => {
    fetchFacilityTypes();
  }, [fetchFacilityTypes]);

  // 施設タイプの初期選択（編集モードの場合）
  useEffect(() => {
    if (facility && facilityTypes.length > 0 && !selectedFacilityType) {
      const matchingType = facilityTypes.find(t => t.id === facility.facility_type_id);
      if (matchingType) {
        console.log('Setting initial selected facility type:', matchingType);
        setSelectedFacilityType(matchingType);
      }
    }
  }, [facility, facilityTypes, selectedFacilityType]);

  const handleClose = () => {
    setSelectedFacilityType(null);
    onClose();
  };

  const handleSubmit = async (data: FacilityFormData) => {
    try {
      await onSubmit(data);
      setSelectedFacilityType(null);
    } catch (error) {
      console.error('Error creating or updating facility:', error);
    }
  };

  const handleAddFacilityTypeComplete = (newType: FacilityType) => {
    setFacilityTypes((prev) => [...prev, newType]);
    setSelectedFacilityType(newType);
    setShowAddFacilityType(false);
  };

  const handleAddFacilityType = (inputValue: string) => {
    setNewFacilityTypeName(inputValue);
    setShowAddFacilityType(true);
  };

  if (isLoading) {
    return null; // または適切なローディング表示
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          width: '600px',
          maxWidth: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          borderRadius: 1,
          bgcolor: 'background.paper',
          boxShadow: 'lg',
        }}
      >
      <FacilityForm
        facilityTypes={facilityTypes}
        onAddFacilityType={(inputValue) => handleAddFacilityType(inputValue)}
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleClose}
        isEdit={isEdit}
        customerName={customerName}
        facilityId={facility?.id}
        customerId={customerId}
        selectedFacilityType={selectedFacilityType}
      />
        <AddFacilityType
          open={showAddFacilityType}
          onClose={() => setShowAddFacilityType(false)}
          onAdd={handleAddFacilityTypeComplete}
          initialValue={newFacilityTypeName}
        />
      </Box>
    </Modal>
  );
};
