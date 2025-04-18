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
  List,
  ListItem,
  CircularProgress,
  Sheet,
  Table,
  Chip,
  Card,
  Modal,
  Stack,
  ModalClose,
  Typography,
} from "@mui/joy";
import { Backdrop, IconButton, Pagination } from "@mui/material";
import { ArrowBackIosRounded, ImageSearch } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { formatDatetime, statusToString } from "../../utils";
import { getDeviceReviewsHistory } from "../../services";
import { NotFound } from "../../components/NotFound";
import { TableCell } from "../../components/TableCell";
import { useTranslation } from "react-i18next";
import { ImageWithFallback } from "src/components/ImageWithFallback";

const TABLE_HEIGHT = "500px";
const PER_PAGE = 10;

// Interface for table row in the ReviewHistory component
interface TableRow {
  id: number;
  result: number;
  facility: {
    name: string;
    type: string;
  };
  imageDate: string;
  requested: string;
  answered: string;
  reviewComment: string;
  imageBlob: string;
}

// Interface for Device details from Response payload
interface DeviceInfo {
  id: number;
  deviceId: string;
  deviceName: string;
  deviceType: string;
  sampleImageBlob: string;
}

// Interface for Review details from Response payload
interface Review {
  id: number;
  result: number;
  facility: {
    facility_name: string;
    facility_type: { name: string; };
  };
  image_date_utc: string;
  created_at_utc: string;
  last_updated_at_utc: string;
  review_comment: string;
  image_blob: string;
}

const IMAGE_NOT_SUBMITTED = "NoImageSubmitted";
const DEVICE_NOT_FOUND_ERROR = 40403;

export const ReviewHistoryPage = () => {
  const navigate = useNavigate();
  const deviceId = Number(useParams().deviceId);
  const { t } = useTranslation();

  const TABLE_HEADERS = [
    { label: t("reviewHistoryPage.slNo"), width: "50px" },
    { label: t("reviewHistoryPage.deviceApplicationStatus"), width: "150px" },
    { label: t("reviewHistoryPage.applicationDateTime"), width: "180px" },
    { label: t("reviewHistoryPage.reviewDateTime"), width: "150px" },
    { label: t("reviewHistoryPage.reviewImage"), width: "100px" },
    { label: t("reviewHistoryPage.reviewComment"), width: "200px" },
  ];

  const errorCodes: Record<number, string> = t("errorCodes", { returnObjects: true });

  // State variables
  const [data, setData] = useState<TableRow[]>([]);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<TableRow | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [deviceNotFound, setDeviceNotFound] = useState(false);

  // Handles showing image preview
  const handleOpenModal = (row: TableRow) => {
    setSelectedRow(row);
    setOpenModal(true);
  };

  // Handles hiding image preview
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRow(null);
  };

  // Fetches review history for a device
  const fetchDeviceReviewsHistory = async (deviceId: number) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const reviewsHistory = await getDeviceReviewsHistory(deviceId, currentPage, PER_PAGE);
      if (reviewsHistory) {
        setData(reviewsHistory?.reviews.map((value: Review) => {
          const submittedImageBlob = [2, 3, 4].includes(value?.result)
            ? (value?.image_blob ?? "") : IMAGE_NOT_SUBMITTED;

          return {
            id: value.id,
            result: value.result,
            facility: {
              name: value.facility.facility_name,
              type: value.facility.facility_type.name,
            },
            imageDate: value.image_date_utc,
            requested: value.created_at_utc,
            answered: value.last_updated_at_utc,
            imageBlob: submittedImageBlob,
            reviewComment: value.review_comment,
          }
        }));
        setDeviceInfo({
          id: reviewsHistory.device.id,
          deviceId: reviewsHistory.device.device_id,
          deviceName: reviewsHistory.device.device_name,
          deviceType: reviewsHistory.device.device_type.name,
          sampleImageBlob: reviewsHistory.device.device_type.sample_image_blob,
        });
        setTotalReviews(reviewsHistory.total);
        const newTotalPages = Math.ceil(reviewsHistory.total / PER_PAGE);
        setTotalPages(newTotalPages);
        setCurrentPage(Math.max(Math.min(currentPage, newTotalPages), 1));
      }
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handles errors during data fetching
  const handleError = (error: any) => {
    if (error?.error_code && error.error_code in errorCodes) {
      if (error.error_code === DEVICE_NOT_FOUND_ERROR) {
        setDeviceNotFound(true);
      }
      setErrorMessage(`errorCodes.${error.error_code}`);
    } else {
      setErrorMessage("errorCodes.10000");
    }
  };

  // Handles back navigation
  const handleBackNavigate = () => {
    if (data.length > 0) {
      navigate(`/reviews/${data[0].id}`);
    } else {
      navigate("/");
    }
  };

  // Effect hook to fetch data initially or when current page changes
  useEffect(() => {
    if (isNaN(deviceId)) {
      handleError({ error_code: DEVICE_NOT_FOUND_ERROR });
    } else {
      fetchDeviceReviewsHistory(deviceId);
    }
  }, [deviceId, currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  return deviceNotFound ? (
    <NotFound errorMessage={"invalidPage.reviewHistoryNotFound"} />
  ) : (
    <>
      <Box
        sx={{
          display: "flex",
          mt: { xs: 2, md: 0 },
          mb: 1,
          gap: 1,
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "start",
        }}
      >
        <IconButton onClick={handleBackNavigate}>
          <ArrowBackIosRounded />
        </IconButton>
        <Typography level="h2" component="h1">
          {t("reviewHistoryPage.reviewsHistory")}
        </Typography>
      </Box>

      <Typography sx={{ marginTop: 2 }}>
        {t("dashboardPage.showing")
          + Math.min((currentPage - 1) * PER_PAGE + 1, totalReviews)
          + "-"
          + Math.min(currentPage * PER_PAGE, totalReviews)
          + t("dashboardPage.items") + t("dashboardPage.outOf")
          + totalReviews + t("dashboardPage.items")}
      </Typography>

      {data.length ? (
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
                <tr>
                  {TABLE_HEADERS.map(({ label, width }) => (
                    <th
                      key={label}
                      style={{
                        padding: "12px 10px",
                        width,
                        whiteSpace: "normal",
                        wordWrap: "break-word",
                      }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={TABLE_HEADERS.length}>
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
                  data?.map((row, index) => (
                    <tr key={index}>
                      <TableCell>{((currentPage - 1) * PER_PAGE) + index + 1}</TableCell>
                      <TableCell>
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
                      <TableCell>
                        {[2, 3, 4].includes(row.result) ? (
                          <IconButton
                            onClick={() => handleOpenModal(row)}
                            data-testid={`show-image-btn-${index + 1}`}
                          >
                            <ImageSearch />
                          </IconButton>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{row.result === 3 ? row.reviewComment : "-"}</TableCell>
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
                {errorMessage ? t(errorMessage) : t("dashboardPage.noData")}
              </Typography>
            </Card>
          )}
        </Stack>
      )}

      {selectedRow && (
        <Modal
          aria-labelledby="review-modal"
          aria-describedby="compare submitted and reference"
          open={openModal}
          onClose={handleCloseModal}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backdropFilter: "blur(0.25px)",
            zIndex: 100000,
          }}
        >
          <Sheet
            variant="outlined"
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              borderRadius: "md",
              boxShadow: "lg",
              maxHeight: "80dvh",
              overflow: "auto",
            }}
          >
            <ModalClose variant="plain" size="sm" />
            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, flexGrow: 1, gap: 2, mx: 2 }}>
              <Card variant="outlined" sx={{ flex: 1 }}>
                <Typography sx={{ textAlign: "center", fontSize: 18, fontWeight: "bold" }}>
                  {t("reviewRequestPage.submittedImage")}
                </Typography>
                <ImageWithFallback
                  src={selectedRow.imageBlob}
                  alt={t("reviewRequestPage.submittedImage")}
                  height="240px"
                  aspectRatio={4 / 3}
                  fallbackIconSize={80}
                  data-testid="submitted-image"
                />
              </Card>
              <Card variant="outlined" sx={{ flex: 1 }}>
                <Typography sx={{ textAlign: "center", fontSize: 18, fontWeight: "bold" }}>
                  {t("reviewRequestPage.referenceImage")}
                </Typography>
                <ImageWithFallback
                  src={deviceInfo?.sampleImageBlob}
                  alt={t("reviewRequestPage.referenceImage")}
                  height="240px"
                  aspectRatio={4 / 3}
                  fallbackIconSize={80}
                  data-testid="reference-image"
                />
              </Card>
            </Box>
            <Card variant="outlined" sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, mx: 2 }}>
              <List>
                <ListItem>
                  <Typography sx={{ fontSize: "xs", fontWeight: "bold" }}>
                    {t("reviewRequestPage.facilityName")}:
                  </Typography>
                  <Typography level="body-xs">{selectedRow.facility.name}</Typography>
                </ListItem>
                <ListItem>
                  <Typography sx={{ fontSize: "xs", fontWeight: "bold" }}>
                    {t("reviewRequestPage.cameraDeviceName")}:
                  </Typography>
                  <Typography level="body-xs">{deviceInfo?.deviceName}</Typography>
                </ListItem>
                <ListItem>
                  <Typography sx={{ fontSize: "xs", fontWeight: "bold" }}>
                    {t("reviewRequestPage.deviceId")}:
                  </Typography>
                  <Typography level="body-xs">{deviceInfo?.deviceId}</Typography>
                </ListItem>
                <ListItem>
                  <Typography sx={{ fontSize: "xs", fontWeight: "bold" }}>
                    {t("reviewHistoryPage.applicationStatus")}:
                  </Typography>
                  <Chip
                    variant="soft"
                    size="sm"
                    color={
                      selectedRow.result === 4 ? "success"
                        : selectedRow.result === 3 ? "danger"
                          : selectedRow.result === 2 ? "warning"
                            : "primary"
                    }
                  >
                    {t(`statusList.${statusToString(selectedRow.result)}`)}
                  </Chip>
                </ListItem>
              </List>
              <List>
                <ListItem>
                  <Typography sx={{ fontSize: "xs", fontWeight: "bold" }}>
                    {t("reviewRequestPage.facilityPattern")}:
                  </Typography>
                  <Typography level="body-xs">
                    {selectedRow.facility.type} ({deviceInfo?.deviceType})
                  </Typography>
                </ListItem>
                <ListItem>
                  <Typography sx={{ fontSize: "xs", fontWeight: "bold" }}>
                    {t("reviewRequestPage.applicationDateTime")}:
                  </Typography>
                  <Typography level="body-xs">
                    {[2, 3, 4].includes(selectedRow.result) ? formatDatetime(selectedRow?.requested) : "-"}
                  </Typography>
                </ListItem>
                <ListItem sx={{ display: selectedRow?.answered ? "flex" : "none" }}>
                  <Typography sx={{ fontSize: "xs", fontWeight: "bold" }}>
                    {t("reviewRequestPage.reviewDateTime")}:
                  </Typography>
                  <Typography level="body-xs">
                    {[3, 4].includes(selectedRow.result) ? formatDatetime(selectedRow?.answered) : "-"}
                  </Typography>
                </ListItem>
                <ListItem>
                  <Typography sx={{ fontSize: "xs", fontWeight: "bold" }}>
                    {t("reviewHistoryPage.reviewComment")}:
                  </Typography>
                  <Typography level="body-xs">
                    {selectedRow.result === 3 ? selectedRow.reviewComment : "-"}
                  </Typography>
                </ListItem>
              </List>
            </Card>
          </Sheet>
        </Modal>
      )}
    </>
  );
}
