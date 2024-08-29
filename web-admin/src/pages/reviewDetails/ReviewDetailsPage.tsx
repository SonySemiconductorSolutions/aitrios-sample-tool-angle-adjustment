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
  CircularProgress,
  FormHelperText,
  List,
  ListItem,
  Stack,
  Snackbar,
  Textarea,
  Typography,
  useTheme,
} from "@mui/joy";
import {
  ArrowBackIosRounded,
  AssignmentTurnedInRounded,
  CloseRounded,
  ErrorRounded,
  ImageNotSupportedOutlined
} from "@mui/icons-material";
import { Backdrop, IconButton } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { approveReview, getReviewById, rejectReview } from "../../services";
import { getBase64ImageUrl, formatDatetime, statusToString } from "../../utils";
import { useTranslation } from "react-i18next";

// Interface for Review details from Response payload
interface ReviewAPIResponse {
  id: number;
  device: {
    id: number;
    device_name: string;
    device_id: string;
    device_type: {
      name: string;
      sample_image_blob: string | null;
    };
  }
  facility: {
    facility_name: string;
    facility_type: {
      name: string
    };
  },
  result: number;
  image_blob: string | null;
  image_date_utc: string;
  created_at_utc: string;
  last_updated_at_utc: string;
  review_comment: string;
}

// Interface for Review details to be rendered in the component
interface ReviewDetails {
  id: number;
  aitriosName: string;
  serialNumber: string;
  device: {
    id: number;
    type: string;
  },
  facility: {
    name: string;
    type: string;
  },
  imageDate: string;
  result: number;
  requested: string;
  answered: string;
}

// Constants
const CHARACTER_LIMIT = 255;
const NOT_LATEST_REVIEW_ERROR = [40303, 40304];
const NAVIGATE_TIMEOUT = 3000;
const IMAGE_NOT_SUBMITTED = "NoImageSubmitted";
const SUBMITTED_IMAGE_NOT_FOUND = "SubmittedImageNotFound";
const REFERENCE_IMAGE_NOT_FOUND = "ReferenceImageNotFound";

export const ReviewDetailsPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { t } = useTranslation();

  const errorCodes: Record<number, string> = t("errorCodes", { returnObjects: true });

  // State variables
  const [rejectReason, setRejectReason] = useState("");
  const [initialRejectReason, setInitialRejectReason] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isReviewDone, setIsReviewDone] = useState(false);
  const [reviewData, setReviewData] = useState<ReviewDetails>();
  const [referenceImageBase64, setReferenceImageBase64] = useState<string>();
  const [submittedImageBase64, setSubmittedImageBase64] = useState<string>();

  // Handles input change for Rejection comment
  const onRejectReasonChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    if (value.length <= CHARACTER_LIMIT) {
      setRejectReason(value);
    }
  };

  // Handles errors during data fetching or submission
  const handleError = (error: any) => {
    if (error?.error_code && error.error_code in errorCodes) {
      setErrorMessage(`errorCodes.${error.error_code}`);
    } else {
      setErrorMessage("errorCodes.10000");
    }
    setOpenSnackbar(true);
  };

  // Handles the rejection of a review request
  const onReject = () => {
    if (!rejectReason.trim()) return;
    setOpenSnackbar(false);
    setIsRejecting(true);
    rejectReview(state.reviewId, 3, rejectReason.trim()) // 3 mean reject
      .then(() => {
        setIsReviewDone(true);
        setOpenSnackbar(true);
        setInitialRejectReason(rejectReason.trim());
        setSuccessMessage("reviewRequestPage.rejectSuccess");
        setTimeout(() => {
          navigate("/");
        }, NAVIGATE_TIMEOUT);
      })
      .catch((err) => {
        handleError(err);
        if (NOT_LATEST_REVIEW_ERROR.includes(err?.error_code)) {
          setIsReviewDone(true);
          setTimeout(() => {
            navigate("/");
          }, NAVIGATE_TIMEOUT);
        }
      })
      .finally(() => {
        setIsRejecting(false);
      });
  };

  // Handles the approval of a review request
  const onApprove = () => {
    setOpenSnackbar(false);
    setIsApproving(true);
    approveReview(state.reviewId, 4) // 4 mean approval
      .then(() => {
        setIsReviewDone(true);
        setOpenSnackbar(true);
        setSuccessMessage("reviewRequestPage.approveSuccess");
        setTimeout(() => {
          navigate("/");
        }, NAVIGATE_TIMEOUT);
      })
      .catch((err) => {
        handleError(err);
        if (NOT_LATEST_REVIEW_ERROR.includes(err?.error_code)) {
          setIsReviewDone(true);
          setTimeout(() => {
            navigate("/");
          }, NAVIGATE_TIMEOUT);
        }
      })
      .finally(() => {
        setIsApproving(false);
      });
  };

  // Fetches details of a review
  const fetchReviewDetails = async (reviewId: number) => {
    if (isLoading) return;
    setOpenSnackbar(false);
    setIsLoading(true);

    getReviewById(reviewId)
      ?.then((responseData: ReviewAPIResponse) => {
        const reviewDetails: ReviewDetails = {
          id: responseData.id,
          aitriosName: responseData.device?.device_name,
          serialNumber: responseData.device?.device_id,
          device: {
            id: responseData.device?.id,
            type: responseData.device?.device_type?.name,
          },
          facility: {
            name: responseData.facility?.facility_name,
            type: responseData.facility?.facility_type?.name,
          },
          imageDate: responseData.image_date_utc,
          result: responseData.result ?? 1,
          requested: responseData.created_at_utc,
          answered: responseData.last_updated_at_utc,
        };

        setRejectReason(responseData?.review_comment ?? "");
        setInitialRejectReason(responseData?.review_comment ?? "");

        if (reviewDetails.result === 1) {
          setSubmittedImageBase64(IMAGE_NOT_SUBMITTED);
        } else {
          setSubmittedImageBase64(responseData?.image_blob ?? SUBMITTED_IMAGE_NOT_FOUND);
        }

        setReferenceImageBase64(responseData?.device?.device_type?.sample_image_blob ?? REFERENCE_IMAGE_NOT_FOUND);

        setReviewData(reviewDetails);
      })
      .catch((err) => {
        handleError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Effect hook to fetch data initially
  useEffect(() => {
    fetchReviewDetails(state.reviewId)
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps


  return (
    <>
      {isLoading ? (
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
      ) : (
        <>
          <Stack
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                mt: { xs: 2, md: 0 },
                mb: 1,
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "start", sm: "center" },
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <IconButton onClick={() => navigate(-1)}>
                  <ArrowBackIosRounded />
                </IconButton>
                <Typography level="h2" component="h1">
                  {reviewData?.facility.name + t("reviewRequestPage.facilityCameraImage")}
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: '#2659ff',
                  cursor: 'pointer',
                  '&:hover': {
                    color: '#1e40af',
                  },
                  '&:focus': {
                    color: '#1e40af',
                  },
                }}
                onClick={() => navigate("history", {
                  state: { deviceId: reviewData?.device?.id }
                })}
              >
                {t("reviewRequestPage.viewHistory")}
              </Typography>
            </Box>
            <Stack sx={{ display: "flex", gap: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  flexGrow: 5,
                  flexDirection: { xs: "column", lg: "row" },
                  gap: 2,
                }}
              >
                <Card
                  variant="outlined"
                  sx={{ flex: 2, display: "flex", flexDirection: "row" }}
                >
                  <List>
                    <ListItem>
                      <Typography sx={{ fontWeight: "bold" }}>
                        {t("reviewRequestPage.cameraDeviceName")}:
                      </Typography>
                      <Typography level="body-sm">
                        {reviewData?.aitriosName}
                      </Typography>
                    </ListItem>
                    <ListItem>
                      <Typography sx={{ fontWeight: "bold" }}>
                        {t("reviewRequestPage.deviceId")}:
                      </Typography>
                      <Typography level="body-sm">
                        {reviewData?.serialNumber}
                      </Typography>
                    </ListItem>
                  </List>
                  <List>
                    <ListItem>
                      <Typography sx={{ fontWeight: "bold" }}>
                        {t("reviewRequestPage.imageDateTime")}:
                      </Typography>
                      <Typography level="body-sm">
                        {[2, 3, 4].includes(reviewData?.result ?? 1) ? formatDatetime(reviewData?.imageDate) : "-"}
                      </Typography>
                    </ListItem>
                    <ListItem>
                      <Typography sx={{ fontWeight: "bold" }}>
                        {t("reviewRequestPage.applicationDateTime")}:
                      </Typography>
                      <Typography level="body-sm">
                        {[2, 3, 4].includes(reviewData?.result ?? 1) ? formatDatetime(reviewData?.requested) : "-"}
                      </Typography>
                    </ListItem>
                    <ListItem>
                      <Typography sx={{ fontWeight: "bold" }}>
                        {t("reviewRequestPage.reviewDateTime")}:
                      </Typography>
                      <Typography level="body-sm">
                        {[3, 4].includes(reviewData?.result ?? 1) ? formatDatetime(reviewData?.answered) : "-"}
                      </Typography>
                    </ListItem>
                  </List>
                </Card>
                <Card
                  variant="outlined"
                  sx={{ flex: 1, display: "flex", justifyContent: "center" }}
                >
                  <Card variant="plain">
                    <Typography
                      textAlign="center"
                      sx={{ fontWeight: "bold" }}
                      level="body-lg"
                    >
                      {t(`statusList.${statusToString(reviewData?.result)}`)}
                    </Typography>
                  </Card>
                </Card>
              </Box>
              <Box sx={{ display: "flex", flexGrow: 1, columnGap: 2 }}>
                <Card variant="outlined" sx={{ flex: 1 }}>
                  <Typography sx={{ textAlign: "center", fontSize: 18, fontWeight: "bold" }}>
                    {t("reviewRequestPage.submittedImage")}
                  </Typography>
                  <AspectRatio maxHeight={360}>
                    {submittedImageBase64 === IMAGE_NOT_SUBMITTED || submittedImageBase64 === SUBMITTED_IMAGE_NOT_FOUND ? (
                      <Stack
                        justifyContent="center"
                        alignItems="center"
                        width="100%"
                        height="100%"
                        bgcolor="rgba(221, 231, 238, 0.5)"
                      >
                        <ImageNotSupportedOutlined sx={{ fontSize: 100 }} />
                        <Typography textAlign="center">
                          {submittedImageBase64 === IMAGE_NOT_SUBMITTED
                            ? t("reviewRequestPage.notSubmitted")
                            : t("reviewRequestPage.submittedImageNotFound")}
                        </Typography>
                      </Stack>
                    ) : (
                      <Card
                        sx={{
                          backgroundImage: getBase64ImageUrl(submittedImageBase64),
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "center",
                          backgroundSize: "contain",
                          width: "100%",
                          height: "100%",
                        }}
                        variant="plain"
                      />
                    )}
                  </AspectRatio>
                </Card>
                <Card variant="outlined" sx={{ flex: 1 }}>
                  <Typography sx={{ textAlign: "center", fontSize: 18, fontWeight: "bold" }}>
                    {t("reviewRequestPage.referenceImage")}
                  </Typography>
                  <AspectRatio maxHeight={300}>
                    {referenceImageBase64 === REFERENCE_IMAGE_NOT_FOUND ? (
                      <Stack
                        justifyContent="center"
                        alignItems="center"
                        width="90%"
                        height="100%"
                        bgcolor="rgba(221, 231, 238, 0.5)"
                      >
                        <ImageNotSupportedOutlined sx={{ fontSize: 100 }} />
                        <Typography textAlign="center">{t("reviewRequestPage.referenceImageNotFound")}</Typography>
                      </Stack>
                    ) : (
                      <Card
                        sx={{
                          backgroundImage: getBase64ImageUrl(referenceImageBase64),
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "center",
                          backgroundSize: "contain",
                          width: "100%",
                          height: "100%",
                        }}
                        variant="plain"
                      />
                    )}
                  </AspectRatio>
                  <Box sx={{
                    display: "flex",
                    gap: 2,
                    flexDirection: { xs: "column", md: "row" },
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                    <Box display="flex" gap={1} alignItems="center">
                      <Typography sx={{ fontWeight: "bold" }}>
                        {t("reviewRequestPage.facilityPattern")}:
                      </Typography>
                      <Typography level="body-sm">
                        {reviewData?.facility?.type
                          ? `${reviewData.facility.type} (${reviewData?.device?.type})`
                          : "-"
                        }
                      </Typography>
                    </Box>
                    <Button
                      onClick={onApprove}
                      size="lg"
                      loading={isApproving}
                      loadingPosition="start"
                      sx={{ width: 125, maxHeight: 20, alignSelf: "flex-end" }}
                      disabled={
                        ![2, 3].includes(reviewData?.result ?? 1) ||
                        isReviewDone || isRejecting
                      }
                    >
                      {t("reviewRequestPage.approve")}
                    </Button>
                  </Box>
                </Card>
              </Box>
            </Stack>

            <Card variant="outlined" sx={{ flex: 1 }}>
              <Textarea
                minRows={2}
                maxRows={5}
                placeholder={t("reviewRequestPage.adviceForContractors")}
                value={[2, 3, 4].includes(reviewData?.result ?? 1) ? rejectReason : ""}
                onChange={onRejectReasonChange}
                disabled={
                  ![2, 3, 4].includes(reviewData?.result ?? 1) ||
                  isReviewDone || isApproving || isRejecting
                }
                required
                sx={{ flex: 1, p: 2 }}
              />
              {rejectReason.length >= CHARACTER_LIMIT &&
                <FormHelperText sx={{ mx: 2, color: theme.palette.warning[400] }}>
                  {t("errorCodes.10001")}
                </FormHelperText>}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  color="danger"
                  type="submit"
                  size="lg"
                  loading={isRejecting}
                  loadingPosition="start"
                  sx={{ width: 125, maxHeight: 20 }}
                  disabled={
                    rejectReason.trim() === initialRejectReason ||
                    ![2, 3, 4].includes(reviewData?.result ?? 1) ||
                    isReviewDone || isApproving
                  }
                  onClick={onReject}
                >
                  {t("reviewRequestPage.reject")}
                </Button>
              </Box>
            </Card>
          </Stack>
          {(successMessage || errorMessage) ? <Snackbar
            variant="soft"
            size="lg"
            open={openSnackbar}
            color={successMessage ? "success" : "danger"}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            startDecorator={successMessage ? <AssignmentTurnedInRounded /> : <ErrorRounded />}
            endDecorator={
              <IconButton
                color={successMessage ? "success" : "error"}
                onClick={() => setOpenSnackbar(false)}
              >
                <CloseRounded />
              </IconButton>
            }
          >
            {t(successMessage) || t(errorMessage)}
          </Snackbar> : null}
        </>
      )}
    </>
  );
};
