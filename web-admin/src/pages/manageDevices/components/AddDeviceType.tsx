import React, { useState, useRef, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormLabel,
  Modal,
  IconButton,
  Input,
  Typography,
} from '@mui/joy';
import { useTranslation } from 'react-i18next';
import { Close, FileUpload } from '@mui/icons-material';
import { DeviceType } from '../../../services/device_types';
import { validateString } from 'src/utils';

interface AddDeviceTypeProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, base64Image: string, id?: number) => Promise<void>;
  initialDeviceType?: DeviceType | null;
  isEdit?: boolean;
}

const CHARACTER_LIMIT = 127; // 文字数制限

export const AddDeviceType: React.FC<AddDeviceTypeProps> = ({
  open,
  onClose,
  onSubmit,
  initialDeviceType = null,
  isEdit = false
}) => {
  const [deviceType, setDeviceType] = useState(initialDeviceType?.name || '');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);  // ローディング状態を追加
  const [isUploading, setIsUploading] = useState(false); // アップロード中の状態を追加
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    initialDeviceType?.sample_image_blob
  );

  useEffect(() => {
    if (open) {
      setDeviceType(initialDeviceType?.name || '');
      setError('');
      setFile(null);
      setImagePreview(initialDeviceType?.sample_image_blob);
    }
  }, [open, initialDeviceType]);

  const validateFile = (file: File): boolean => {
    const maxSize = 1024 * 1024; // 1MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    if (!allowedTypes.includes(file.type)) {
      setError('addDeviceType.errors.invalidFileType');
      return false;
    }

    if (file.size > maxSize) {
      setError('addDeviceType.errors.fileTooLarge');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (isLoading) return; // 送信中は何もしない

    if (!deviceType.trim()) {
      setError('addDeviceType.errors.requiredName');
      return;
    }

    if (!imagePreview || isUploading) {
      setError('addDeviceType.errors.requiredImage');
      return;
    }

    if (!validateString(deviceType, "NAME")) {
      setError('errorCodes.10005');
      return;
    }

    try {
      setIsLoading(true);
      await onSubmit(
        deviceType.trim(),
        imagePreview,
        isEdit ? initialDeviceType?.id : undefined
      );

      // 送信後に状態をリセット
      setDeviceType('');
      setImagePreview(undefined);
      setFile(null);
      setError('');
    } catch (error: any) {
      console.error('Error creating or updating device type:', error);
      setError(isEdit
        ? 'addDeviceType.errors.updateFailed'
        : 'addDeviceType.errors.createFailed'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setDeviceType('');
    setImagePreview(undefined);
    setFile(null);
    setError('');
    onClose();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        setIsUploading(true);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
          setIsUploading(false);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        event.target.value = '';
      }
    }
  };

  // 既存のファイル名を取得する関数
  const getExistingFileName = () => {
    if (isEdit && imagePreview) {
      const mimeType = imagePreview.split(',')[0].match(/image\/(png|jpeg|jpg)/)?.[1];
      return mimeType ? `${deviceType}.${mimeType}` : '';
    }
    return '';
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  // タイトルを動的に変更
  const getModalTitle = () => {
    return isEdit
      ? t('addDeviceType.modal.editTitle')
      : t('addDeviceType.modal.addTitle');
  };

  const getButtonText = () => {
    return isEdit
      ? t('addDeviceType.modal.editButton')
      : t('addDeviceType.modal.addButton');
  };

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
          bgcolor: 'white',
          boxShadow: 'sm',
          p: 3,
          width: '400px',
          maxWidth: '90%',
          borderRadius: 'md',
          position: 'relative',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography level="h4" component="h2" fontWeight="bold">
            {getModalTitle()}
          </Typography>
          <IconButton onClick={handleClose} size="sm" variant="plain" aria-label="Close">
            <Close />
          </IconButton>
        </Box>
        <Box mb={2}>
          <FormControl>
            <FormLabel required>
              {t('addDeviceType.deviceTypeName')}
            </FormLabel>
            <Input
              value={deviceType}
              slotProps={{ input: { maxLength: CHARACTER_LIMIT } }}
              onChange={(e) => setDeviceType(e.target.value)}
              placeholder={t('addDeviceType.deviceTypeName')}
              error={!validateString(deviceType, "NAME")}
              data-testid="device-type-name-input"
              fullWidth
              required
            />
            {deviceType && (
              <Typography
                level="body-xs"
                sx={{
                  color: !validateString(deviceType, "NAME")
                    ? "danger.500"
                    : deviceType.length >= CHARACTER_LIMIT
                      ? "warning.400"
                      : "inherit",
                }}
              >
                {!validateString(deviceType, "NAME")
                  ? t("errorCodes.10003")
                  : deviceType.length >= CHARACTER_LIMIT
                    ? t("errorCodes.10002")
                    : ""}
              </Typography>
            )}
          </FormControl>
        </Box>
        <Box mb={2}>
          <FormControl>
            <FormLabel htmlFor="referenceImageInput" required>
              {t('addDeviceType.referenceImage')}
            </FormLabel>
            <Input
              id="referenceImageInput"
              readOnly
              value={file ? file.name : getExistingFileName()}
              placeholder={t('addDeviceType.referenceImage')}
              endDecorator={
                <Button onClick={handleFileButtonClick} size="sm" aria-label="Upload File">
                  <FileUpload />
                </Button>
              }
              fullWidth
              required
            />
            <input
              id="referenceImageInput"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept=".jpeg, .png, .jpg"
              data-testid="reference-image-input"
              required
            />
          </FormControl>
        </Box>
        {isUploading ? (
          <Box mb={2} sx={{ textAlign: 'center' }}>
            <CircularProgress size="lg" />
          </Box>
        ) : (
          imagePreview && (
            <Box mb={2} sx={{ textAlign: 'center' }}>
              <img
                src={imagePreview.startsWith('data:')
                  ? imagePreview
                  : `data:image/jpeg;base64,${imagePreview}`}
                alt="Reference Image Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  objectFit: 'contain',
                  borderRadius: '4px'
                }}
              />
            </Box>
          )
        )}
        <Typography level="body-xs" mb={2} color="warning">
          {t('addDeviceType.note')}
        </Typography>

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
          onClick={handleSubmit}
          fullWidth
          loading={isLoading}
          loadingPosition="start"
          data-testid="add-device-type-btn"
        >
          {getButtonText()}
        </Button>
      </Box>
    </Modal>
  );
};

export default AddDeviceType;
