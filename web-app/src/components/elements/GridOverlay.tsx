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
import { styled, Box } from "@mui/material";

interface GridOverlayProps {
  gridRows: number; // Number of rows
  gridColumns: number; // Number of columns
  gridColor: string; // Color of Grid lines
}

const GridOverlayBox = styled(Box)<GridOverlayProps>(({ gridRows, gridColumns, gridColor }) => ({
  display: "grid",
  gridTemplateRows: `repeat(${gridRows}, 1fr)`,
  gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: "none",
  "& > div": {
    borderRight: `2px solid ${gridColor}`,
    borderBottom: `2px solid ${gridColor}`,
    [`&:nth-child(${gridColumns}n)`]: {
      borderRight: "none",
    },
    [`&:nth-last-child(-n+${gridColumns})`]: {
      borderBottom: "none",
    },
  },
}));

export const GridOverlay = ({ gridColor, gridRows, gridColumns }: GridOverlayProps) => {
  return (
    <GridOverlayBox gridColor={gridColor} gridRows={gridRows} gridColumns={gridColumns} data-testid="grid-overlay">
      {Array.from({ length: gridRows * gridColumns }).map((_, index) => (
        <div key={index} />
      ))}
    </GridOverlayBox>
  )
}
