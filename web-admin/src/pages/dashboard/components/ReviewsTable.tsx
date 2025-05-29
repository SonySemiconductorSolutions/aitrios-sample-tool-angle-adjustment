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
  Box,
  Card,
  Checkbox,
  Divider,
  FormLabel,
  ToggleButtonGroup,
  Button,
  Snackbar,
  Stack,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Typography,
} from "@mui/joy";
import { CloseRounded, ErrorRounded, List, Apps } from "@mui/icons-material";
import { FormGroup, IconButton, Pagination } from "@mui/material";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { getLatestReviewsThrottled, getDeviceStatusThrottled } from "../../../services";
import { useStore } from "../../../store";
import { getCheckboxState, getStatusString } from "../../../utils";
import { Filter } from "./Filter";
import { GridView } from "./GridView";
import { ListView } from "./ListView";
import { useTranslation } from "react-i18next";
import { ResponsiveBackdrop } from "../../../components/ResponsiveBackdrop";

// Interface for latest review of a device from Response payload
interface DeviceLatestReviewDetails {
  device: {
    device_id: string;
    device_name: string;
    facility: {
      facility_name: string;
      facility_type: { name: string; };
      prefecture: string;
      municipality: string;
    },
    id: number;
  },
  latest_review: {
    result: number;
    id: number;
    image_blob: string;
    image_date_utc: string;
    created_at_utc: string;
    last_updated_at_utc: string;
  }
}

// Interface for table row in the ReviewsTable component
interface TableRow {
  id: number;
  aitriosName: string;
  serialNumber: string;
  facility: {
    name: string;
    type: string;
  };
  prefecture: string;
  municipality: string;
  latestReviewId: number;
  result: number;
  imageBlob: string;
  imageDate: string;
  requested: string;
  answered: string;
}

// Interface for statistics related to device reviews
interface DeviceLatestReviewStatistics {
  lateReviews: number;
  currentReviews: number;
  reviewDurationMinutes: number;
  totalReviews: number;
}

// Interface for states of checkboxes
interface CheckboxStates {
  initialState: boolean;
  requesting: boolean;
  rejected: boolean;
  approved: boolean;
}

// Interface defining properties for a checkbox
interface CheckboxProps {
  label: string;
  value: string;
  state_key: keyof CheckboxStates;
}

// Interface for mapping device status by device ID
interface DeviceStatusMap {
  [key: string]: string;
}

type ViewType = "list" | "grid";
type GridType = "small" | "medium" | "large";

const CHECKBOX_SX = { fontSize: 14 }; // Styling for checkboxes
const LABEL_SX = {
  fontSize: 16,
  fontWeight: "bold"
}; // Styling for labels

const PER_PAGE = 15; // Number of items per page in pagination
const TABLE_HEIGHT = "700px"; // Height of the table
const CHECKBOX_STATE_TIMEOUT = 1000; // Timeout of checkbox state update
const DEVICE_CONNECTION_STATE_FETCH_ERROR = 50011;
const CONSOLE_CREDENTIALS_FETCH_ERROR = 50013;

export default function ReviewsTable() {
  const { filter, setSingleFilter, dashboard, setViewType, setGridType, setCurrentPage } = useStore();
  const { t } = useTranslation();

  const CHECKBOX_LIST: CheckboxProps[] = [
    { label: t("statusList.initialState"), value: "1", state_key: "initialState" },
    { label: t("statusList.requesting"), value: "2", state_key: "requesting" },
    { label: t("statusList.rejected"), value: "3", state_key: "rejected" },
    { label: t("statusList.approved"), value: "4", state_key: "approved" },
  ];

  // State variables
  const [data, setData] = useState<TableRow[]>([]);
  const reviewStatisticsInitState: DeviceLatestReviewStatistics = {
    lateReviews: 0,
    currentReviews: 0,
    reviewDurationMinutes: 0,
    totalReviews: 0,
  };
  const [reviewStatistics, setReviewStatistics] =
    useState<DeviceLatestReviewStatistics>(reviewStatisticsInitState);
  const stateKeyCountInitState = {
    initialState: 0,
    requesting: 0,
    rejected: 0,
    approved: 0,
  };
  const [stateKeyCount, setStateKeyCount] = useState(stateKeyCountInitState);
  const [checkboxState, setCheckboxState] = useState<CheckboxStates>(getCheckboxState(filter.status));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatusMap | undefined>();
  const errorCodes: Record<number, string> = t("errorCodes", { returnObjects: true });
  const [errorMessage, setErrorMessage] = useState("");
  const [totalPages, setTotalPages] = useState<number>(0);
  const [startIndex, setStartIndex] = useState<number>(1);
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();

  // Reference variables
  const focusRef = useRef<HTMLDivElement>(null);

  // Handles view type change
  const handleViewTypeChange = (viewType: ViewType) => {
    setViewType(viewType);
  };

  // Handle grid type change
  const handleGridTypeChange = (gridType: GridType | null) => {
    if (gridType) {
      setGridType(gridType);
    }
  };

  // Handles checkbox state change
  const handleCheckboxChange = (e: ChangeEvent<{ checked: boolean }>, state_key: string) => {
    setCheckboxState({ ...checkboxState, [state_key]: e.target.checked });
  };

  // Fetches data of latest reviews
  const fetchData = () => {
    if (isLoading || !filter.customerId) return;
    setIsLoading(true);
    setErrorMessage("");
    setDeviceStatus(undefined);
    getLatestReviewsThrottled(
      filter.customerId,
      dashboard.currentPage,
      PER_PAGE,
      filter.facilityName,
      filter.prefecture,
      filter.municipality,
      filter.status,
    )?.then((responseData) => {
      if (responseData) {
        setData(
          responseData?.data?.map((value: DeviceLatestReviewDetails) => ({
            id: value.device?.id,
            aitriosName: value.device?.device_name,
            serialNumber: value.device?.device_id,
            facility: {
              name: value.device?.facility?.facility_name,
              type: value.device?.facility?.facility_type.name,
            },
            prefecture: value.device?.facility?.prefecture,
            municipality: value.device?.facility?.municipality,
            latestReviewId: value.latest_review?.id,
            result: value.latest_review?.result,
            imageBlob: value.latest_review?.image_blob,
            imageDate: value.latest_review?.image_date_utc,
            requested: value.latest_review?.created_at_utc,
            answered: value.latest_review?.last_updated_at_utc,
          })),
        );
        setReviewStatistics({
          lateReviews: responseData.reviewing_info?.late,
          currentReviews: responseData.reviewing_info?.current,
          reviewDurationMinutes: responseData.reviewing_info?.minutes,
          totalReviews: responseData.total,
        });
        setStateKeyCount({
          initialState: responseData.status_count?.initial_state ?? 0,
          requesting: responseData.status_count?.requesting ?? 0,
          rejected: responseData.status_count?.rejected ?? 0,
          approved: responseData.status_count?.approved ?? 0,
        });
        setTotalPages(Math.ceil(responseData.total / PER_PAGE));
        setStartIndex((dashboard.currentPage - 1) * PER_PAGE + 1);
        // Fetch device connection status
        fetchDeviceStatus();
      }
    })
      .catch((err) => {
        handleError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Fetches device connection status
  const fetchDeviceStatus = () => {
    if (!filter.customerId) return;
    getDeviceStatusThrottled(
      filter.customerId,
      dashboard.currentPage,
      PER_PAGE,
      filter.facilityName,
      filter.prefecture,
      filter.municipality,
    )?.then((responseData) => {
      setDeviceStatus(responseData?.data?.reduce(
        (statusMap: DeviceStatusMap, device: any) => {
          statusMap[device.device_id] = device.connection_status;
          return statusMap;
        }, {}));
    }).catch((err) => {
      handleError(err);
    });
  };

  // Handles errors during data fetching
  const handleError = (error: any) => {
    if (error?.error_code && error.error_code in errorCodes) {
      const errorCode =
        error.error_code === CONSOLE_CREDENTIALS_FETCH_ERROR
          ? DEVICE_CONNECTION_STATE_FETCH_ERROR
          : error.error_code;
      setErrorMessage(`errorCodes.${errorCode}`);
    } else {
      setErrorMessage("errorCodes.10000");
    }
    setOpenSnackbar(true);
  };

  // Effect hook to fetch data initially and when filters or current change
  useEffect(() => {
    fetchData();
  }, [filter, dashboard.currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  // Effect hook to set application status filter 
  useEffect(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    const newTimeoutId = setTimeout(() => {
      const newStatus = getStatusString(checkboxState);
      if (newStatus !== filter.status) {
        // Set current page to 1 and set filter
        setCurrentPage(1);
        setSingleFilter({ key: "status", value: newStatus });
      }
    }, CHECKBOX_STATE_TIMEOUT);
    setTimeoutId(newTimeoutId);
  }, [checkboxState]); // eslint-disable-line react-hooks/exhaustive-deps

  // Effect hook to scroll to view
  useEffect(() => {
    if (isMounted) {
      focusRef?.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    } else {
      setIsMounted(true);
    }
  }, [dashboard.viewType]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {isLoading && <ResponsiveBackdrop open={true} />}

      {reviewStatistics.totalReviews ?
        (<Stack sx={{ display: "flex" }}>
          <Typography>
            <Typography>
              {t("dashboardPage.thereAre") + reviewStatistics?.currentReviews + t("dashboardPage.pendingApplications")}
            </Typography>
            <Typography color="danger">
              (
              {t("dashboardPage.thereHaveBeen") + reviewStatistics?.lateReviews
                + t("dashboardPage.applicationsInLast") + reviewStatistics?.reviewDurationMinutes
                + t("dashboardPage.minutes")})
            </Typography>
          </Typography>
        </Stack>) : null}

      <Filter />

      <Box sx={{ py: 2 }}>
        <Divider />
      </Box>

      <FormGroup sx={{ display: "flex", gap: 1 }} ref={focusRef}>
        <FormLabel sx={LABEL_SX}>{t("dashboardPage.applicationStatus")}:</FormLabel>
        <Box sx={{ display: "flex", flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 2, md: 6, lg: 12 } }}>
          {CHECKBOX_LIST.map((props) => (
            <Checkbox
              label={`${props.label} (${stateKeyCount[props.state_key]})`}
              value={props.value}
              sx={CHECKBOX_SX}
              key={props.label}
              checked={checkboxState[props.state_key]}
              onChange={(e: ChangeEvent<{ checked: boolean }>) => handleCheckboxChange(e, props.state_key)}
              data-testid={`${props.state_key}-checkbox`}
            />
          ))}
        </Box>
      </FormGroup>

      <Box sx={{ py: 2 }}>
        <Divider />
      </Box>

      <Tabs
        value={dashboard.viewType}
        sx={{ background: "none" }}
        onChange={(_, value) => handleViewTypeChange(value as ViewType)}
      >
        <TabList sx={{ justifyContent: "flex-end" }}>
          <Typography alignSelf="center" mr="auto" pr={2}>
            {t("dashboardPage.showing")
              + Math.min((dashboard.currentPage - 1) * PER_PAGE + 1, reviewStatistics.totalReviews)
              + "-"
              + (Math.min(dashboard.currentPage * PER_PAGE, reviewStatistics.totalReviews))
              + t("dashboardPage.items") + t("dashboardPage.outOf")
              + reviewStatistics.totalReviews + t("dashboardPage.items")}
          </Typography>
          <Tab color="primary" value="list" data-testid="listview-tab"><List />{t("dashboardPage.list")}</Tab>
          <Tab color="primary" value="grid" data-testid="tiledview-tab"><Apps />{t("dashboardPage.tiled")}</Tab>
        </TabList>

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          {dashboard.viewType === "grid" && <ToggleButtonGroup
            size="sm"
            value={dashboard.gridType}
            color="primary"
            sx={{ mt: 1 }}
            onChange={(_, value) => handleGridTypeChange(value as GridType)}
          >
            <Button value="small" data-testid="small-tiles-tab">{t("dashboardPage.small")}</Button>
            <Button value="medium" data-testid="medium-tiles-tab">{t("dashboardPage.medium")}</Button>
            <Button value="large" data-testid="large-tiles-tab">{t("dashboardPage.large")}</Button>
          </ToggleButtonGroup>}
        </Box>

        {reviewStatistics.totalReviews ? (
          <>
            <TabPanel value="list" sx={{ px: 0, py: 3 }}>
              <ListView data={data} deviceStatus={deviceStatus} startIndex={startIndex} />
            </TabPanel>
            <TabPanel value="grid" sx={{ px: 0, py: 3 }}>
              <GridView data={data} deviceStatus={deviceStatus} view={dashboard.gridType} perPage={PER_PAGE} isLastPage={dashboard.currentPage === totalPages} />
            </TabPanel>
            <Pagination
              count={totalPages}
              page={dashboard.currentPage}
              onChange={(_, page) => setCurrentPage(page)}
              variant="outlined"
              shape="rounded"
              color="primary"
              sx={{ display: "flex", justifyContent: "center" }}
            />
          </>
        ) : (
          <Stack
            sx={{
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
              width: "100%",
              my: 3,
              height: TABLE_HEIGHT,
            }}
          >
            <Card
              sx={{
                display: "flex",
                justifyContent: "center",
                alignContent: "center",
                width: "100%",
                height: "100%",
              }}
              variant="plain"
            >
              <Typography textAlign="center" level="h4">
                {t("dashboardPage.noData")}
              </Typography>
            </Card>
          </Stack>
        )}
      </Tabs>

      {errorMessage ? <Snackbar
        variant="soft"
        size="lg"
        open={openSnackbar}
        color="danger"
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        startDecorator={<ErrorRounded />}
        endDecorator={
          <IconButton
            color="error"
            onClick={() => setOpenSnackbar(false)}
          >
            <CloseRounded />
          </IconButton>
        }
      >
        {t(errorMessage)}
      </Snackbar> : null}
    </>
  );
}
