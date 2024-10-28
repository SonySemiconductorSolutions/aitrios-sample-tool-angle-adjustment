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

// Import packages
import Modal from "@mui/material/Modal";
import { useTranslation } from "react-i18next";
import { HexColorPicker } from "react-colorful";
// Import components
import { MainButton } from "src/components";

interface GridColorPickerProps {
  open: boolean; // Visibility of Grid color picker
  color: string; // Hexadecimal string of Grid color
  handleClose: () => void; // Method to close Grid color picker
  onChange: (color: string) => void; // Method to update Grid color
}

export const GridColorPicker = ({ open, handleClose, color, onChange }: GridColorPickerProps) => {
  const { t } = useTranslation();

  return (
    <Modal
      open={open}
      sx={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "50px", zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <>
        <HexColorPicker style={{ width: "100%" }} color={color} onChange={onChange} />
        <MainButton style={{ marginTop: "15px" }} onClick={handleClose}>{t("image_confirmation_page.close")}</MainButton>
      </>
    </Modal>
  );
};
