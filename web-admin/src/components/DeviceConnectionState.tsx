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
import { Close, Circle } from "@mui/icons-material";

interface DeviceConnectionStateProps {
  state: string | undefined;
  size?: "sm" | "md" | "lg";
}

const SIZE_CHART: Record<string, { dot: string; cross: string }> = {
  sm: {
    dot: "10px",
    cross: "12px",
  },
  md: {
    dot: "12px",
    cross: "14px",
  },
  lg: {
    dot: "16px",
    cross: "18px",
  },
};

export const DeviceConnectionState = ({ state, size = "sm" }: DeviceConnectionStateProps)  => {
  const styles: React.CSSProperties = {
    textAlign: "center",
    width: SIZE_CHART[size].cross,
    stroke: "currentColor",
    strokeWidth: 1,
  };

  // State (Green circle: Connected), (Red cross: Disconnected or Unknown)
  switch (state) {
    case "Connected":
      styles.color = "green";
      styles.fontSize = SIZE_CHART[size].dot;
      return <Circle sx={styles} />;
    default:
      styles.color = "red";
      styles.fontSize = SIZE_CHART[size].cross;
      return <Close sx={styles} />;
  }
};
