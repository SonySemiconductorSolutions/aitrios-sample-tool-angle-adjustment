import { Modal, Box, Typography, Button } from "@mui/joy";
import { useTranslation } from 'react-i18next';

interface DeregisterDevicesProps {
  open: boolean;
  onClose: () => void;
  selectedDevices: string[];
  customerName: string;
  onDeregister: () => void;
}

export const DeregisterDevices: React.FC<DeregisterDevicesProps> = ({
  open,
  onClose,
  selectedDevices,
  customerName,
  onDeregister,
}) => {
  const { t } = useTranslation();

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
          {t('deregisterDevices.title')}
        </Typography>

        <Box>
          <Typography level="body-sm" sx={{ mb: 2 }}>
            {t('deregisterDevices.message', { customerName: customerName })}
          </Typography>
          <Box sx={{ maxHeight: '200px', overflowY: 'auto', mb: 2 }}>
            {selectedDevices.map((deviceId, index) => (
              <Typography key={index} level="body-sm" sx={{ mb: 1, fontWeight: 'bold' }}>
                {deviceId}
              </Typography>
            ))}
          </Box>
          <Typography level="body-sm" color="warning" sx={{ mb: 2 }}>
            {t('deregisterDevices.note')}
          </Typography>
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
            onClick={onClose}
            data-testid="cancel-deregister-btn"
          >
            {t('deregisterDevices.buttons.cancel')}
          </Button>
          <Button
            variant="solid"
            color="danger"
            onClick={onDeregister}
            data-testid="confirm-deregister-btn"
          >
            {t('deregisterDevices.buttons.deregister')}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};
