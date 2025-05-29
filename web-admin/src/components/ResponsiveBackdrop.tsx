import React from 'react';
import { Backdrop } from '@mui/material';
import { CircularProgress } from '@mui/joy';

interface ResponsiveBackdropProps {
  open: boolean;
  children?: React.ReactNode;
  zIndex?: number;
}

export const ResponsiveBackdrop: React.FC<ResponsiveBackdropProps> = ({
  open,
  children,
  zIndex = 499
}) => {
  return (
    <Backdrop
      open={open}
      sx={{
        position: "absolute",
        height: "100%",
        width: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex,
      }}
    >
      {children || <CircularProgress variant="soft" />}
    </Backdrop>
  );
};