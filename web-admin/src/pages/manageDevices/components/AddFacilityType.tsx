import React, { useState, useEffect } from 'react';
import { Modal, Typography, Input, Button, Box, IconButton, Alert, FormControl, FormLabel } from '@mui/joy';
import { useTranslation } from 'react-i18next';
import CloseIcon from '@mui/icons-material/Close';
import { createFacilityType } from '../../../services/facility_types';
import { validateString } from 'src/utils';

interface FacilityType {
  id: number;
  name: string;
}

interface AddFacilityTypeProps {
  open: boolean;
  onClose: () => void;
  onAdd: (type: FacilityType) => void;
  initialValue?: string;
}

const CHARACTER_LIMIT = 127;

export const AddFacilityType: React.FC<AddFacilityTypeProps> = ({
  open,
  onClose,
  onAdd,
  initialValue = ''
}) => {
  const [newType, setNewType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleAdd = async () => {
    if (!newType.trim()) {
      setError('facilityType.errors.required');
      return;
    }

    if (!validateString(newType, "NAME")) {
      setError('errorCodes.10005');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await createFacilityType(newType.trim());
      if (!response || !response.data || !response.data.id) {
        throw new Error("Failed to create facility type");
      }

      const newFacilityType: FacilityType = {
        id: response.data.id,
        name: newType.trim()
      };
      onAdd(newFacilityType);
      setNewType('');
      onClose();
    } catch (error: any) {
      console.error('Error creating facility type:', error);
      setError('facilityType.errors.createFailed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && initialValue) {
      setNewType(initialValue);
    }
    if (open) {
      setError(null);
    }
  }, [open, initialValue]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          bgcolor: 'background.surface',
          boxShadow: 'md',
          p: 2,
          width: '300px',
          maxWidth: '90%',
          borderRadius: 'sm',
          position: 'relative',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography level="h4" component="h2">
            {t('facilityType.addTitle')}
          </Typography>
          <IconButton onClick={onClose} size="sm" variant="plain" aria-label="Close">
            <CloseIcon />
          </IconButton>
        </Box>

        <Box mb={2}>
          <FormControl>
            <FormLabel required>
              {t('facilityType.typeName')}
            </FormLabel>
            <Input
              placeholder={t('facilityType.typeName')}
              value={newType}
              slotProps={{ input: { maxLength: CHARACTER_LIMIT } }}
              onChange={(e) => setNewType(e.target.value)}
              error={!validateString(newType, "NAME")}
              data-testid="facility-type-name-input"
              fullWidth
              required
            />
            {newType && (
              <Typography
                level="body-xs"
                sx={{
                  color: !validateString(newType, "NAME")
                    ? "danger.500"
                    : newType.length >= CHARACTER_LIMIT
                      ? "warning.400"
                      : "inherit",
                }}
              >
                {!validateString(newType, "NAME")
                  ? t("errorCodes.10003")
                  : newType.length >= CHARACTER_LIMIT
                    ? t("errorCodes.10002")
                    : ""}
              </Typography>
            )}
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

        <Button
          onClick={handleAdd}
          fullWidth
          loading={isLoading}
          loadingPosition="start"
          data-testid="add-facility-type-btn"
        >
          {t('facilityType.add')}
        </Button>
      </Box>
    </Modal>
  );
};

export default AddFacilityType;
