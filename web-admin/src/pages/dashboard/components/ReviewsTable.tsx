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
  Button,
  Card,
  Chip,
  CircularProgress,
  Checkbox,
  Divider,
  FormLabel,
  Sheet,
  Snackbar,
  Stack,
  Table,
  Tooltip,
  Typography,
} from "@mui/joy";
import { CloseRounded, ErrorRounded, InfoOutlined } from "@mui/icons-material";
import { Backdrop, FormGroup, IconButton, Pagination } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLatestReviewsThrottled, getDeviceStatusThrottled } from "../../../services";
import { useStore } from "../../../store";
import { formatDatetime, getDeviceStatusColor, statusToString } from "../../../utils";
import { Filter } from "./Filter";
import { TableCell } from "../../../components/TableCell";
import { useTranslation } from "react-i18next";


// Interface for latest review of a device from Response payload
interface DeviceLatestReviewDetails {
  device: {
    device_id: string;
    device_name: string;
    facility: {
      facility_name: string;
      facility_type: { name: string; };
    },
    id: number;
  },
  latest_review: {
    result: number;
    id: number;
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
  latestReviewId: number;
  result: number;
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
  value: number;
  state_key: keyof CheckboxStates;
}

// Interface for mapping device status by device ID
interface DeviceStatusMap {
  [key: string]: string;
}

const CHECKBOX_SX = { fontSize: 14 }; // Styling for checkboxes
const LABEL_SX = {
  fontSize: 16,
  fontWeight: "bold"
}; // Styling for labels

const PER_PAGE = 10; // Number of items per page in pagination
const TABLE_HEIGHT = "500px"; // Height of the table

export default function ReviewsTable() {
  const navigate = useNavigate();
  const { filter, status, setStatus } = useStore();
  const { t } = useTranslation();

  const CHECKBOX_LIST: CheckboxProps[] = [
    { label: t("statusList.initialState"), value: 1, state_key: "initialState" },
    { label: t("statusList.requesting"), value: 2, state_key: "requesting" },
    { label: t("statusList.rejected"), value: 3, state_key: "rejected" },
    { label: t("statusList.approved"), value: 4, state_key: "approved" },
  ];

  const TABLE_HEADERS = [
    { label: t("dashboardPage.slNo"), width: "40px" },
    { label: t("dashboardPage.facilityName"), width: "90px" },
    { label: t("dashboardPage.facilityType"), width: "80px" },
    { label: t("dashboardPage.deviceName"), width: "120px" },
    { label: t("dashboardPage.deviceId"), width: "220px" },
    { label: t("dashboardPage.deviceApplicationStatus"), width: "120px" },
    { label: t("dashboardPage.applicationDateTime"), width: "100px" },
    { label: t("dashboardPage.reviewDateTime"), width: "100px" },
    { label: t("dashboardPage.angleConfirmation"), width: "100px" },
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
  const [checkboxState, setCheckboxState] = useState<CheckboxStates>(status);
  const [filteredData, setFilteredData] = useState<TableRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatusMap>({});
  const errorCodes: Record<number, string> = t("errorCodes", { returnObjects: true });
  const [errorMessage, setErrorMessage] = useState("");
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [paginatedData, setPaginatedData] = useState<TableRow[]>([]);
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);

  // Handles checkbox state change
  const handleCheckboxChange = (e: ChangeEvent<{ checked: boolean }>, state_key: string) => {
    setCheckboxState({ ...checkboxState, [state_key]: e.target.checked });
  };

  // Filters table data based on checkbox state
  const filterData = () => {
    setStatus(checkboxState);
    const newData = (checkboxState && Object.values(checkboxState).some(state => state)) ?
      data.filter(row => checkboxState[statusToString(row.result) as keyof CheckboxStates]) :
      data;
    setFilteredData(newData);
  };

  // Fetches data of latest reviews
  const fetchData = () => {
    if (isLoading || !filter.customerId) return;
    setIsLoading(true);
    setErrorMessage("");
    setDeviceStatus({});
    getLatestReviewsThrottled(
      filter.customerId,
      filter.facilityName,
      filter.prefecture,
      filter.municipality,
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
            latestReviewId: value.latest_review?.id,
            result: value.latest_review?.result,
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
      setErrorMessage(`errorCodes.${error.error_code}`);
    } else {
      setErrorMessage("errorCodes.10000");
    }
    setOpenSnackbar(true);
  };

  // Sets pagination for table data
  const setPages = () => {
    const totalItems = filteredData.length;
    const pages = Math.ceil(totalItems / PER_PAGE);
    setTotalPages(pages);

    // Ensure currentPage stays within the valid range
    const newCurrentPage = Math.min(currentPage, Math.max(1, pages));
    setCurrentPage(newCurrentPage);

    const startIndex = (currentPage - 1) * PER_PAGE;
    const endIndex = Math.min(startIndex + PER_PAGE, totalItems);
    const newPaginatedData = filteredData.slice(startIndex, endIndex);
    setPaginatedData(newPaginatedData);
  };

  // Effect hook to fetch data initially and when filters change
  useEffect(() => {
    fetchData();
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Effect hook to update state key counts when data changes
  useEffect(() => {
    setStateKeyCount(data?.reduce((count: any, value: TableRow) => {
      count[statusToString(value.result)]++;
      return count;
    }, stateKeyCountInitState));
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  // Effect hook to filter data when data or checkbox state changes
  useEffect(() => {
    filterData();
  }, [data, checkboxState]); // eslint-disable-line react-hooks/exhaustive-deps

  // Effect hook to update pagination when filtered data or current page changes
  useEffect(() => {
    setPages();
  }, [filteredData, currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {(!isLoading && reviewStatistics?.totalReviews) ?
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

      <FormGroup sx={{ display: "flex", gap: 1 }}>
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
            />
          ))}
        </Box>
      </FormGroup>

      <Box sx={{ py: 2 }}>
        <Divider />
      </Box>

      {!isLoading &&
        <Typography>
          {t("dashboardPage.showing")
            + Math.min((currentPage - 1) * PER_PAGE + 1, filteredData.length)
            + "-"
            + (Math.min(currentPage * PER_PAGE, filteredData.length))
            + t("dashboardPage.items") + t("dashboardPage.outOf")
            + filteredData.length + t("dashboardPage.items")}
        </Typography>}

      {filteredData.length ? (
        <>
          <Sheet
            variant="outlined"
            sx={{
              width: "100%",
              borderRadius: "sm",
              overflow: "auto",
              flexGrow: 1,
              mt: 2,
              height: TABLE_HEIGHT,
            }}
          >
            <Table
              stripe="2n"
              aria-labelledby="tableTitle"
              stickyHeader
              hoverRow
              sx={{
                "--Table-headerUnderlineThickness": "1px",
                "--TableCell-paddingY": "2px",
                "--TableCell-paddingX": "10px",
                "--TableCell-wordBreak": "break-all",
                "--TableRow-stripeBackground": "rgba(0 0 0 / 0.04)",
                "--TableRow-hoverBackground": "rgba(0 0 0 / 0.08)",
              }}
            >
              <thead>
                <tr style={{ justifyContent: "center", alignItems: "center" }}>
                  {TABLE_HEADERS.map(({ label, width }, index) => (
                    <th
                      key={label}
                      style={{
                        width,
                        padding: "12px 10px",
                        textAlign: [6, 9].includes(index + 1) ? "center" : "left",
                        whiteSpace: "normal",
                        wordWrap: "break-word",
                      }}
                    >
                      {index + 1 !== 5
                        ? label
                        : (<Box display="flex" gap={1} alignItems="center">
                          <Typography>{label}</Typography>
                          {(deviceStatus && Object.entries(deviceStatus).length) ?
                            (<Tooltip
                              title={
                                <Box display="flex" flexDirection="column">
                                  <Typography sx={{ fontWeight: 600 }}>
                                    {t("dashboardPage.deviceConnectionStatus")}
                                  </Typography>
                                  <Typography lineHeight={1.2}>
                                    <span style={{ color: "green", fontSize: 18, marginRight: 4 }}>&#x25CF;</span>
                                    Connected
                                  </Typography>
                                  <Typography lineHeight={1.2}>
                                    <span style={{ color: "red", fontSize: 18, marginRight: 4 }}>&#x25CF;</span>
                                    Disconnected
                                  </Typography>
                                  <Typography lineHeight={1.2}>
                                    <span style={{ color: "grey", fontSize: 18, marginRight: 4 }}>&#x25CF;</span>
                                    Unknown
                                  </Typography>
                                </Box>
                              }
                              placement="right-end"
                              variant="outlined"
                              arrow
                            >
                              <InfoOutlined sx={{ fontSize: 14 }} />
                            </Tooltip>) : null}
                        </Box>)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={9}>
                      <Backdrop
                        open
                        sx={{
                          position: "absolute",
                          height: "100%",
                          width: "100%",
                          backgroundColor: "rgba(221, 231, 238)",
                        }}
                      >
                        <CircularProgress variant="soft" />
                      </Backdrop>
                    </td>
                  </tr>
                ) : (
                  paginatedData?.map((row, index) => (
                    <tr key={index}>
                      <TableCell>{((currentPage - 1) * PER_PAGE) + index + 1}</TableCell>
                      <TableCell>{row.facility.name}</TableCell>
                      <TableCell>{row.facility.type}</TableCell>
                      <TableCell>{row.aitriosName}</TableCell>
                      <TableCell>
                        <Typography display="flex" alignItems="center">
                          {(deviceStatus && Object.entries(deviceStatus).length)
                            ? <span
                              style={{
                                color: getDeviceStatusColor(deviceStatus[row.serialNumber]),
                                fontSize: 20,
                                marginRight: 4
                              }}>&#x25CF;</span>
                            : null}
                          {row.serialNumber}
                        </Typography>
                      </TableCell>
                      <TableCell centerAlign>
                        <Chip
                          variant="soft"
                          size="sm"
                          color={
                            row.result === 4 ? "success"
                              : row.result === 3 ? "danger"
                                : row.result === 2 ? "warning"
                                  : "primary"
                          }
                        >
                          {t(`statusList.${statusToString(row.result)}`)}
                        </Chip>
                      </TableCell>
                      <TableCell>{[2, 3, 4].includes(row.result) ? formatDatetime(row.requested) : "-"}</TableCell>
                      <TableCell>{[3, 4].includes(row.result) ? formatDatetime(row.answered) : "-"}</TableCell>
                      <TableCell centerAlign>
                        {[2, 3, 4].includes(row.result) &&
                          <Button
                            variant="solid"
                            sx={{ width: 80 }}
                            onClick={() => {
                              navigate("/review", {
                                state: { reviewId: row.latestReviewId },
                              });
                            }}
                          >
                            {t("dashboardPage.details")}
                          </Button>}
                      </TableCell>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Sheet>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            variant="outlined"
            shape="rounded"
            color="primary"
            sx={{ marginTop: 2, display: "flex", justifyContent: "center" }}
          />
        </>
      ) : (
        <Stack
          sx={{
            display: "flex",
            justifyContent: "center",
            alignContent: "center",
            width: "100%",
            mt: 2,
            height: TABLE_HEIGHT,
          }}
        >
          {isLoading ? (
            <Card
              sx={{
                display: "flex",
                justifyContent: "center",
                alignContent: "center",
                width: "100%",
                height: "100%",
              }}
            >
              <Backdrop
                open
                sx={{
                  position: "absolute",
                  height: "100%",
                  width: "100%",
                  backgroundColor: "rgba(221, 231, 238)",
                }}
              >
                <CircularProgress variant="soft" />
              </Backdrop>
            </Card>
          ) : (
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
          )}
        </Stack>
      )}
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
