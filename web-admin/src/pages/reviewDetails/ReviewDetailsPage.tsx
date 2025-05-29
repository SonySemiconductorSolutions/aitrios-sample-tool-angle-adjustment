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
  Checkbox,
  Card,
  CircularProgress,
  FormHelperText,
  List,
  ListItem,
  Modal,
  ModalDialog,
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
  ColorLensOutlined,
  InfoOutlined,
} from "@mui/icons-material";
import { HexColorPicker } from "react-colorful";
import { IconButton } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { approveReview, deleteDeviceReviews, editDeviceType, getReviewById, rejectReview } from "../../services";
import { NotFound } from "../../components/NotFound";
import { ImageWithFallback } from "../../components/ImageWithFallback";
import { formatDatetime, statusToString } from "../../utils";
import { useStore } from "../../store";
import { useTranslation } from "react-i18next";
import { ResponsiveBackdrop } from "../../components/ResponsiveBackdrop";

// Interface for Review details from Response payload
interface ReviewAPIResponse {
  id: number;
  device: {
    id: number;
    device_name: string;
    device_id: string;
    device_type: {
      id: number;
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
    typeId: number;
    typeName: string;
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

const CHECKBOX_SX = { fontSize: 14 }; // Styling for checkboxes

// Constants
const CHARACTER_LIMIT = 255;
const NOT_LATEST_REVIEW_ERROR = [40303, 40304];
const REVIEW_NOT_FOUND_ERROR = 40404;
const NAVIGATE_TIMEOUT = 3000;
const IMAGE_NOT_SUBMITTED = "NoImageSubmitted";

export const ReviewDetailsPage = () => {
  const { gridLine, setGridLineColor, setGridLineVisibility } = useStore();
  const theme = useTheme();
  const navigate = useNavigate();
  const reviewId = Number(useParams().reviewId);
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
  const [initialReferenceImageBase64, setInitialReferenceImageBase64] = useState<string>();
  const [submittedImageBase64, setSubmittedImageBase64] = useState<string>();
  const [submittedImageDimension, setSubmittedImageDimension] = useState({ width: 0, height: 0 });
  const [adjustedImageBase64, setAdjustedImageBase64] = useState<string>();
  const [savedGridLineVisibility, setSavedGridLineVisibility] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number>(4 / 3);
  const [preserveAspectRatio, setPreserveAspectRatio] = useState<boolean>(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startAdjust, setStartAdjust] = useState(false);
  const [reviewNotFound, setReviewNotFound] = useState(false);
  const [openDeleteReviewsModal, setOpenDeleteReviewsModal] = useState(false);
  const [isDeletingReviews, setIsDeletingReviews] = useState(false);
  const [isDeleteDone, setIsDeleteDone] = useState(false);

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
      if (error.error_code === REVIEW_NOT_FOUND_ERROR) {
        setReviewNotFound(true);
      }
      setErrorMessage(`errorCodes.${error.error_code}`);
    } else {
      setErrorMessage("errorCodes.10000");
    }
    setOpenSnackbar(true);
  };

  // Handles the rejection of a review request
  const onReject = async () => {
    if (!rejectReason.trim()) return;
    setOpenSnackbar(false);
    setIsRejecting(true);
    try {
      if (reviewData?.device?.typeId && referenceImageBase64 && referenceImageBase64 !== initialReferenceImageBase64) {
        await editDeviceType(reviewData.device.typeId, reviewData.device.typeName, referenceImageBase64);
      }
      await rejectReview(reviewId, 3, rejectReason.trim()); // 3 means reject
      setIsReviewDone(true);
      setOpenSnackbar(true);
      setInitialRejectReason(rejectReason.trim());
      setSuccessMessage("reviewRequestPage.rejectSuccess");
      setTimeout(() => {
        navigate("/");
      }, NAVIGATE_TIMEOUT);
    } catch (err: any) {
      handleError(err);
      if (NOT_LATEST_REVIEW_ERROR.includes(err?.error_code)) {
        setIsReviewDone(true);
        setTimeout(() => {
          navigate("/");
        }, NAVIGATE_TIMEOUT);
      }
    } finally {
      setIsRejecting(false);
    }
  };

  // Handles the approval of a review request
  const onApprove = () => {
    setOpenSnackbar(false);
    setIsApproving(true);
    approveReview(reviewId, 4) // 4 mean approval
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
            typeId: responseData.device?.device_type?.id,
            typeName: responseData.device?.device_type?.name,
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

        const submittedImageBlob = [2, 3, 4].includes(reviewDetails?.result)
          ? (responseData?.image_blob ?? "") : IMAGE_NOT_SUBMITTED;

        setSubmittedImageBase64(submittedImageBlob);
        calculateImageAspectRatio(submittedImageBlob, setSubmittedImageDimension, setAspectRatio);

        setReferenceImageBase64(responseData?.device?.device_type?.sample_image_blob ?? "");
        setInitialReferenceImageBase64(responseData?.device?.device_type?.sample_image_blob ?? "");

        setReviewData(reviewDetails);
      })
      .catch((err) => {
        handleError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Function to calculate image aspect ratio from base64 string
  const calculateImageAspectRatio = (
    base64Url: string | undefined,
    setImageDimension: React.Dispatch<React.SetStateAction<{ width: number; height: number }>>,
    setImageAspectRatio: React.Dispatch<React.SetStateAction<number>>,
  ) => {
    if (!base64Url) {
      setImageAspectRatio(4 / 3); // Default aspect ratio
      return;
    }

    const img = new Image();

    img.onload = () => {
      const { naturalWidth, naturalHeight } = img;
      setImageDimension({ width: naturalWidth, height: naturalHeight });
      setImageAspectRatio(naturalWidth / naturalHeight);
    };

    img.onerror = () => setImageAspectRatio(4 / 3); // Default aspect ratio

    img.src = base64Url;
  };

  // Determine text color based on background brightness
  const getContrastingColor = (hexColor: string) => {
    // Convert hex color to RGB
    const rgb = parseInt(hexColor.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    // Calculate brightness (luminance)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 125 ? '#000' : '#fff'; // Return black for light colors and white for dark colors
  };

  // Handles adjusting Submitted image
  const toggleAdjustMode = () => {
    if (startAdjust) {
      setPosition({ x: 0, y: 0 });
      setGridLineVisibility(savedGridLineVisibility);
    } else {
      setSavedGridLineVisibility(gridLine.visibility);
      setGridLineVisibility(true);
    }
    setStartAdjust(!startAdjust);
  };

  // Handles updating referenceImageBase64 for rejection
  const updateReferenceImage = () => {
    setReferenceImageBase64(adjustedImageBase64);
    if (!rejectReason.trim()) setRejectReason(t("reviewRequestPage.adjustToMatchSampleImage"))
    toggleAdjustMode();
  };

  // Handles restoring original referenceImageBase64
  const restoreReferenceImage = () => {
    setReferenceImageBase64(initialReferenceImageBase64);
  };

  // Handles deleting reviews
  const handleDeleteReviews = async () => {
    if (!reviewData?.device?.id) return;
    setOpenSnackbar(false);
    setIsDeletingReviews(true);
    try {
      await deleteDeviceReviews(reviewData.device.id);
      setIsDeleteDone(true);
      setSuccessMessage("reviewRequestPage.deleteReviewsSuccess");
      setOpenDeleteReviewsModal(false);
      setOpenSnackbar(true);
      setTimeout(() => {
        navigate("/");
      }, NAVIGATE_TIMEOUT);
    } catch (err: any) {
      handleError(err);
    } finally {
      setIsDeletingReviews(false);
    }
  };

  // Effect hook to fetch data initially
  useEffect(() => {
    if (isNaN(reviewId)) {
      handleError({ error_code: REVIEW_NOT_FOUND_ERROR });
    } else {
      fetchReviewDetails(reviewId);
    }
  }, [reviewId]); // eslint-disable-line react-hooks/exhaustive-deps


  return (
    <>
      {isLoading ? (
        <ResponsiveBackdrop
          open={true}
          zIndex={499}
          children={<CircularProgress variant="soft" />}
        />
      ) : reviewNotFound ? (
        <NotFound errorMessage={errorMessage} />
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
                gap: 1,
                flexDirection: { xs: "column", sm: "row" },
                alignItems: "center",
                flexWrap: "wrap",
                justifyContent: { xs: "center", sm: "space-between" },
              }}
            >
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <IconButton onClick={() => navigate("/")}>
                  <ArrowBackIosRounded />
                </IconButton>
                <Typography level="h2" component="h1">
                  {reviewData?.facility.name + t("reviewRequestPage.facilityCameraImage")}
                </Typography>
              </Box>
              <Box display="flex" gap={2}>
                <Button
                  variant="plain"
                  sx={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: '#c41c1c',
                    cursor: 'pointer',
                    '&:hover': {
                      color: '#a51818',
                      backgroundColor: theme.palette.danger[50],
                    },
                    '&:focus': {
                      color: '#a51818',
                      backgroundColor: theme.palette.danger[50],
                    },
                  }}
                  onClick={() => setOpenDeleteReviewsModal(true)}
                  data-testid="delete-reviews-link"
                  disabled={isReviewDone || isDeleteDone}
                >
                  {t("reviewRequestPage.deleteReviews")}
                </Button>
                <Button
                  variant="plain"
                  sx={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: '#2659ff',
                    cursor: 'pointer',
                    '&:hover': {
                      color: '#1e40af',
                      backgroundColor: theme.palette.primary[50],
                    },
                    '&:focus': {
                      color: '#1e40af',
                      backgroundColor: theme.palette.primary[50],
                    },
                  }}
                  onClick={() => navigate(
                    `/reviews/devices/${reviewData?.device?.id}/history`
                  )}
                  data-testid="review-history-link"
                  disabled={isReviewDone || isDeleteDone}
                >
                  {t("reviewRequestPage.viewHistory")}
                </Button>
              </Box>
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
                  sx={{ flex: 2, display: "flex", flexDirection: { xs: "column", md: "row" }, }}
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
              <Box sx={{ display: "flex", gap: 2, alignItems: "center", justifyContent: "center" }}>
                <Checkbox
                  label={t("reviewRequestPage.showGridLines")}
                  sx={CHECKBOX_SX}
                  checked={gridLine.visibility}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setGridLineVisibility(e.target.checked)
                  }
                  data-testId="grid-line-toggler"
                />
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  sx={{
                    width: 30,
                    height: 30,
                    backgroundColor: gridLine.color,
                    cursor: "pointer",
                    border: "1px solid #ccc",
                  }}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  data-testid="grid-color-picker-btn"
                >
                  <ColorLensOutlined sx={{ fill: getContrastingColor(gridLine.color) }} />
                </Box>
              </Box>
              <Modal
                aria-labelledby="color-picker-modal"
                aria-describedby="pick grid color"
                open={showColorPicker}
                onClose={() => setShowColorPicker(false)}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backdropFilter: "blur(0.25px)",
                  zIndex: 100000,
                }}
              >
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  gap={2}
                  position="absolute"
                  marginLeft={{ md: "200px" }}
                >
                  <HexColorPicker color={gridLine.color} onChange={setGridLineColor} data-testid="hex-color-picker" />
                  <Button
                    size="lg"
                    sx={{ width: 125, maxHeight: 20 }}
                    onClick={() => setShowColorPicker(false)}
                    data-testid="close-color-picker-btn"
                  >
                    {t("reviewRequestPage.close")}
                  </Button>
                </Box>
              </Modal>
              <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, flexGrow: 1, gap: 2 }}>
                <Card variant="outlined" sx={{ flex: 1 }}>
                  <Box display="flex" flexDirection="column" height="48px">
                    <Typography sx={{ textAlign: "center", fontSize: 18, fontWeight: "bold", mt: "auto" }}>
                      {t("reviewRequestPage.submittedImage")}
                      {submittedImageDimension?.width && submittedImageDimension?.height ? (
                        <span style={{ marginLeft: "4px" }}>
                          ({submittedImageDimension.width}x{submittedImageDimension.height})
                        </span>
                      ) : null}
                    </Typography>
                  </Box>
                  <AspectRatio
                    variant="plain"
                    ratio={aspectRatio}
                    maxHeight="360px"
                    sx={{ borderRadius: 0 }}
                  >
                    <ImageWithFallback
                      src={submittedImageBase64}
                      alt={t("reviewRequestPage.submittedImage")}
                      height="360px"
                      aspectRatio={aspectRatio}
                      fallbackIconSize={100}
                      showGrid
                      data-testid="submitted-image-main"
                    />
                  </AspectRatio>
                </Card>
                <Card variant="outlined" sx={{ flex: 1 }}>
                  <Box display="flex" flexDirection="column" height="48px">
                    <Checkbox
                      label={t("reviewRequestPage.preserveAspectRatio")}
                      sx={{ alignSelf: "flex-end", ...CHECKBOX_SX }}
                      checked={preserveAspectRatio}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setPreserveAspectRatio(e.target.checked)
                      }
                      data-testid="aspect-ratio-toggler"
                    />
                    <Typography sx={{ textAlign: "center", fontSize: 18, fontWeight: "bold", mt: "auto" }}>
                      {t("reviewRequestPage.referenceImage")}
                    </Typography>
                  </Box>
                  <AspectRatio
                    variant="plain"
                    ratio={aspectRatio}
                    maxHeight="360px"
                    sx={{ borderRadius: 0 }}
                  >
                    <ImageWithFallback
                      src={referenceImageBase64}
                      alt={t("reviewRequestPage.referenceImage")}
                      height="360px"
                      aspectRatio={aspectRatio}
                      preserveAspectRatio={preserveAspectRatio}
                      fallbackIconSize={100}
                      showGrid
                      data-testid="reference-image-main"
                    />
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
                          ? `${reviewData.facility.type} (${reviewData?.device?.typeName})`
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
                        isReviewDone || isRejecting || isApproving ||
                        referenceImageBase64 !== initialReferenceImageBase64 ||
                        isDeleteDone
                      }
                      data-testid="approve-review-btn"
                    >
                      {t("reviewRequestPage.approve")}
                    </Button>
                  </Box>
                </Card>
              </Box>
              <Box
                display="flex"
                flexDirection={{ xs: "column", lg: "row" }}
                rowGap={2}
                columnGap={4}
                justifyContent="center"
                alignItems="center"
              >
                <Button
                  onClick={toggleAdjustMode}
                  size="lg"
                  sx={{ width: 230, maxHeight: 20 }}
                  data-testid="update-reference-image-modal-toggler"
                  disabled={
                    !submittedImageDimension?.width || !submittedImageDimension?.height ||
                    isReviewDone || isApproving || isRejecting || isDeleteDone
                  }
                >
                  {t("reviewRequestPage.updateReferenceImage")}
                </Button>
                <Button
                  onClick={restoreReferenceImage}
                  size="lg"
                  sx={{ width: 230, maxHeight: 20 }}
                  data-testid="restore-reference-image-btn"
                  disabled={
                    referenceImageBase64 === initialReferenceImageBase64 ||
                    isReviewDone || isApproving || isRejecting || isDeleteDone
                  }
                >
                  {t("reviewRequestPage.restoreReferenceImage")}
                </Button>
              </Box>
              <Modal
                open={startAdjust}
                onClose={toggleAdjustMode}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backdropFilter: "blur(0.75px)",
                  zIndex: 100000,
                }}
              >
                <ModalDialog sx={{
                  overflow: "auto",
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  borderRadius: "md",
                  boxShadow: "lg",
                  maxWidth: "80dvw",
                }}>
                  <Typography textAlign="center" level="h3">
                    {t("reviewRequestPage.adjustSubmittedImage")}
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, flexGrow: 1, gap: 2, mx: 2 }}>
                    <Card variant="outlined" sx={{ flex: 1, width: { xs: "100%", md: 680 } }}>
                      <Typography sx={{ textAlign: "center", fontSize: 18, fontWeight: "bold", mb: "auto" }}>
                        {t("reviewRequestPage.submittedImage")} ({t("reviewRequestPage.editHere")})
                      </Typography>
                      <ImageWithFallback
                        src={submittedImageBase64}
                        alt={t("reviewRequestPage.submittedImage")}
                        height="480px"
                        aspectRatio={aspectRatio}
                        fallbackIconSize={100}
                        showGrid
                        draggable
                        draggedPosition={position}
                        setDraggedPosition={setPosition}
                        setDraggedImage={setAdjustedImageBase64}
                        data-testid="submitted-image-draggable"
                      />
                    </Card>
                    <Card variant="outlined" sx={{ flex: 1, width: { xs: "100%", md: 680 } }}>
                      <Typography sx={{ textAlign: "center", fontSize: 18, fontWeight: "bold", mb: "auto" }}>
                        {t("reviewRequestPage.referenceImage")}
                      </Typography>
                      <ImageWithFallback
                        src={referenceImageBase64}
                        alt={t("reviewRequestPage.referenceImage")}
                        height="480px"
                        aspectRatio={aspectRatio}
                        preserveAspectRatio={false}
                        fallbackIconSize={100}
                        showGrid
                        data-testid="reference-image-preview"
                      />
                    </Card>
                  </Box>
                  <Typography
                    textAlign="justify"
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 1,
                      px: 2,
                      mx: "auto",
                    }}
                  >
                    <InfoOutlined sx={{ fontSize: 24 }} />
                    {t("reviewRequestPage.updateReferenceImageNote")}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      flexDirection: { xs: "column", md: "row-reverse" },
                    }}
                  >
                    <Button
                      size="lg"
                      color="primary"
                      onClick={updateReferenceImage}
                      data-testid="save-updated-reference-image-btn"
                      disabled={position.x === 0 && position.y === 0}
                    >
                      {t("reviewRequestPage.updateReferenceImage")}
                    </Button>
                    <Button
                      variant="outlined"
                      size="lg"
                      color="neutral"
                      onClick={toggleAdjustMode}
                      data-testid="cancel-updated-reference-image-btn"
                    >
                      {t("reviewRequestPage.cancel")}
                    </Button>
                  </Box>
                </ModalDialog>
              </Modal>
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
                data-testid="reject-reason-textarea"
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
                    (rejectReason.trim() === initialRejectReason &&
                      referenceImageBase64 === initialReferenceImageBase64) ||
                    ![2, 3, 4].includes(reviewData?.result ?? 1) ||
                    isReviewDone || isApproving || isRejecting || !rejectReason.trim()
                    || isDeleteDone
                  }
                  onClick={onReject}
                  data-testid="reject-review-btn"
                >
                  {t("reviewRequestPage.reject")}
                </Button>
              </Box>
            </Card>
          </Stack>
          <Modal
            open={openDeleteReviewsModal}
            onClose={() => setOpenDeleteReviewsModal(false)}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backdropFilter: "blur(0.75px)",
              zIndex: 10001,
            }}
          >
            <Box sx={{
              width: '600px',
              maxWidth: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
              borderRadius: 1,
              bgcolor: '#fff',
              boxShadow: 'lg',
              p: 4,
            }}>
              <Typography level="h4" component="h2" sx={{ mb: 2 }}>
                {t('reviewRequestPage.deleteReviews')}
              </Typography>
              <Typography level="body-sm" sx={{ mb: 2 }}>
                {t('reviewRequestPage.deleteReviewsConfirm')}
                <strong>{reviewData?.aitriosName}</strong>?
              </Typography>
              <Box sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
                pt: 3
              }}>
                <Button
                  variant="outlined"
                  color="neutral"
                  disabled={isDeletingReviews}
                  onClick={() => setOpenDeleteReviewsModal(false)}
                  data-testid="cancel-delete-reviews-btn"
                >
                  {t('reviewRequestPage.cancel')}
                </Button>
                <Button
                  variant="solid"
                  color="danger"
                  loading={isDeletingReviews}
                  loadingPosition="start"
                  disabled={isLoading || isApproving || isRejecting || isDeletingReviews}
                  onClick={handleDeleteReviews}
                  data-testid="confirm-delete-reviews-btn"
                >
                  {t('reviewRequestPage.delete')}
                </Button>
              </Box>
            </Box>
          </Modal>
          {(successMessage || errorMessage) ? <Snackbar
            variant="soft"
            size="lg"
            open={openSnackbar}
            color={successMessage ? "success" : "danger"}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            sx={{ zIndex: 12000 }}
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
