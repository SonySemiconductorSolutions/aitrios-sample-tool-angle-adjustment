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
import {
  AspectRatio,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Tooltip,
  Typography,
} from "@mui/joy";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { statusToString } from "../../../utils";
import { ImageWithFallback } from "../../../components/ImageWithFallback";
import { DeviceConnectionState } from "../../../components/DeviceConnectionState";

// Interface for table row in the ReviewsTable component
interface TableRow {
  id: number;
  aitriosName: string;
  serialNumber: string;
  facility: {
    name: string;
    type: string;
  };
  latestReviewId: number;
  result: number;
  imageBlob: string;
  imageDate: string;
  requested: string;
  answered: string;
}

// Interface for mapping device status by device ID
interface DeviceStatusMap {
  [key: string]: string;
}

// Interface for GridView component properties
interface GridViewProps {
  data: TableRow[],
  deviceStatus: DeviceStatusMap | undefined,
  view: "small" | "medium" | "large",
  perPage: number,
  isLastPage: boolean,
}

export const GridView = ({
  data,
  deviceStatus,
  view,
  perPage,
  isLastPage,
}: GridViewProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // State variable
  const [hasIncompleteRow, setHasIncompleteRow] = useState(false);

  useEffect(() => {
    // Define a mapping of view types to the number of columns for different screen sizes
    const viewToColumns = {
      small: { xs: 3, md: 4, lg: 5 },
      medium: { xs: 2, md: 3, lg: 4 },
      large: { xs: 1, md: 2, lg: 3 },
    };

    // Function to check if there is an incomplete row based on the current screen size and view type
    const checkForIncompleteRow = () => {
      if (window.innerWidth < 960) {
        setHasIncompleteRow(perPage % viewToColumns[view].xs !== 0);
      } else if (window.innerWidth < 1200) {
        setHasIncompleteRow(perPage % viewToColumns[view].md !== 0);
      } else {
        setHasIncompleteRow(perPage % viewToColumns[view].lg !== 0);
      }
    };

    // Add event listener for window resize to check for incomplete rows
    window.addEventListener("resize", checkForIncompleteRow);

    // Initial check to set the state when the component mounts
    checkForIncompleteRow();

    // Cleanup function to remove the event listener when the component unmounts
    return () => window.removeEventListener("resize", checkForIncompleteRow);
  }, [view]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Grid container spacing={2}>
      {data?.map((row, index) => (
        <Grid
          key={index}
          xs={view === "small" ? 4 : view === "medium" ? 6 : 12}
          md={view === "small" ? 3 : view === "medium" ? 4 : 6}
          lg={view === "small" ? 2.4 : view === "medium" ? 3 : 4}
        >
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Tooltip
                title={
                  <Box display="flex" flexDirection="column">
                    <Typography level="body-sm">
                      <Typography sx={{ fontWeight: "bold", mr: 1 }}>
                        {t("dashboardPage.facilityName")}:
                      </Typography>
                      {row?.facility.name}
                    </Typography>
                    <Typography level="body-sm">
                      <Typography sx={{ fontWeight: "bold", mr: 1 }}>
                        {t("dashboardPage.facilityType")}:
                      </Typography>
                      {row?.facility.type}
                    </Typography>
                    <Typography level="body-sm">
                      <Typography sx={{ fontWeight: "bold", mr: 1 }}>
                        {t("dashboardPage.deviceName")}:
                      </Typography>
                      {row?.aitriosName}
                    </Typography>
                    <Typography level="body-sm">
                      <Typography sx={{ fontWeight: "bold", mr: 1 }}>
                        {t("dashboardPage.deviceId")}:
                      </Typography>
                      {row?.serialNumber}
                    </Typography>
                    {deviceStatus && (
                      <Typography level="body-sm" display="flex">
                        <Typography sx={{ fontWeight: "bold", mr: 1 }}>
                          {t("dashboardPage.deviceConnectionStatus")}:
                        </Typography>
                        <Typography display="flex" alignItems="center" gap="2px">
                          <DeviceConnectionState state={deviceStatus[row?.serialNumber]} />
                          {deviceStatus[row?.serialNumber] ?? "Disconnected"}
                        </Typography>
                      </Typography>)}
                  </Box>}
                placement="top"
                variant="outlined"
                sx={{ zIndex: 12000 }}
                arrow
              >
                <Typography
                  display="flex"
                  alignItems="center"
                  gap="2px"
                  mb={1}
                  fontSize={view === "small" ? "12px" : view === "medium" ? "15px" : "18px"}
                >
                  {deviceStatus && <DeviceConnectionState
                    state={deviceStatus[row.serialNumber]}
                    size={view === "small" ? "sm" : view === "medium" ? "md" : "lg"}
                  />}
                  <Typography sx={{
                    width: view === "small" ? 280 : view === "medium" ? 360 : 420,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {row.aitriosName}
                  </Typography>
                </Typography>
              </Tooltip>
              <AspectRatio variant="plain" ratio="4/3" sx={{ borderRadius: 0 }}>
                <Box sx={{ display: "flex" }}>
                  <ImageWithFallback
                    src={row.imageBlob}
                    alt={t("reviewRequestPage.submittedImage") + row.id}
                    height="100%"
                    aspectRatio={4 / 3}
                    fallbackIconSize={view === "small" ? 50 : view === "medium" ? 75 : 100}
                    fallbackWithIconOnly
                  />
                </Box>
              </AspectRatio>
              <Box sx={{
                display: "flex",
                flexDirection: {
                  xs: "column",
                  lg: view === "large" ? "row" : undefined,
                  xl: view === "small" || view === "medium" ? "row" : undefined
                },
                gap: 1,
                mt: 1,
                alignItems: "center",
                justifyContent: "space-between",
                flexGrow: 1,
              }}>
                <Chip
                  variant="soft"
                  size={view === "small" ? "sm" : view === "medium" ? "md" : "lg"}
                  color={row.result === 4 ? "success"
                    : row.result === 3 ? "danger"
                      : row.result === 2 ? "warning"
                        : "primary"}
                  sx={{
                    wordBreak: "break-word",
                    whiteSpace: "normal",
                    textAlign: "center",
                  }}
                >
                  {t(`statusList.${statusToString(row.result)}`)}
                </Chip>
                {[2, 3, 4].includes(row.result) &&
                  <Button
                    variant="solid"
                    size={view === "small" ? "sm" : view === "medium" ? "md" : "lg"}
                    sx={{ width: 90, mt: "auto" }}
                    onClick={() => {
                      navigate("/review", {
                        state: { reviewId: row.latestReviewId },
                      });
                    }}
                  >
                    {t("dashboardPage.details")}
                  </Button>}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
      {!isLastPage && hasIncompleteRow && (
        <Grid
          xs={view === "small" ? 4 : view === "medium" ? 6 : 12}
          md={view === "small" ? 3 : view === "medium" ? 4 : 6}
          lg={view === "small" ? 2.4 : view === "medium" ? 3 : 4}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          {t("dashboardPage.moreItemsInNextPage")}
        </Grid>
      )}
    </Grid>
  );
};
