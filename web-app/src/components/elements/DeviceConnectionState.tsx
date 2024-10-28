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
import CloseIcon from '@mui/icons-material/Close';
import CircleIcon from '@mui/icons-material/Circle';

interface DeviceConnectionStateProps {
  state: string | undefined;
}

const DeviceConnectionState = ({ state }: DeviceConnectionStateProps)  => {
  const styles: React.CSSProperties = {
    width: "24px",
    textAlign: "center",
    stroke: "currentColor",
    strokeWidth: 1,
  };

  // State (Green circle: Connected), (Red cross: Disconnected or Unknown)
  switch (state) {
    case "Connected":
      styles.color = "green";
      styles.fontSize = "14px";
      return <CircleIcon sx={styles} />;
    default:
      styles.color = "red";
      styles.fontSize = "16px";
      return <CloseIcon sx={styles} />;
  }
};

export default DeviceConnectionState;
