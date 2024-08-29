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
import { Box } from "@mui/material";
import { ReactNode } from "react";

// Props for the BackgroundContainer component
export interface BackgroundContainerProps {
  children?: ReactNode; // Children components to be rendered inside BackgroundContainer
}

export const BackgroundContainer = ({ children }: BackgroundContainerProps) => (
  <div>
    <Box
      sx={{
        position: "absolute",
        top: 0,
        right: "50%",
        transform: "translateX(50%)",
        zIndex: 1,
        display: "flex",
        justifyContent: "center",
        backdropFilter: "blur(12px)",
        px: "40px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100dvh",
          maxWidth: "100%",
        }}
      >
        {children}
      </Box>
    </Box>

    <Box
      sx={{
        height: "100%",
        width: "100%",
        position: "fixed",
        right: 0,
        top: 0,
        bottom: 0,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundImage:
          "url('/login_bg.jpeg')",
      }}
    />
  </div>
);
