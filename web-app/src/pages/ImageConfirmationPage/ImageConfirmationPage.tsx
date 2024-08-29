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
import Alert from "@mui/material/Alert";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import LinearProgress from "@mui/material/LinearProgress";
import { useCallback, useEffect, useRef, useState } from "react";
import ImageNotSupportedOutlinedIcon from '@mui/icons-material/ImageNotSupportedOutlined';
// Import components
import { MainButton, Header, CheckListIcon, Loading } from "src/components";
import { ImageWithFallback } from "src/components/elements/ImageWithFallback";
// Import helpers
import {
  unsetSelectedDevice,
  useGlobalDispatch,
  useGlobalState,
} from "src/contexts/GlobalProvider";
import {
  createReview,
  IMAGE_FETCH_TYPE,
  DEVICE_PROGRESS_STATUS,
  fetchCameraCaptureImage,
  fetchWorkProgressStatus,
} from "src/repositories";
// Import assets, styles
import placeHolder from "../../assets/images/place-holder.svg";
import EN from "../../assets/locales/English";
import styles from "./ImageConfirmationPage.module.css";

const NAVIGATE_TIMEOUT = 3000,
  ALREADY_SUBMITTED_ERROR_CODE = "10002",
  ALREADY_APPROVED_ERROR_CODE = "10003";

// Image Confirmation Page displayed to show the camera image and other details to verify the angle of view
export const ImageConfirmationPage = () => {
  const dispatch = useGlobalDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const selectedDevice = useGlobalState((s) => s.selectedDevice);

  const [sampleImage, setSampleImage] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [intervalId, setintervalId] = useState<NodeJS.Timeout>();
  const [reviewComment, setReviewComment] = useState<string>();
  const [isIntervalCapture, setIsIntervalCapture] = useState(false);
  const [cameraImageBase64, setCameraImageBase64] = useState<string>();
  const [fetchingImage, setFetchingImage] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reportClicked, setReportClicked] = useState<boolean>(false);
  const [retrySampleImageFetch, setRetrySampleImageFetch] = useState<boolean>(false);
  const [sampleErrorMessage, setSampleErrorMessage] = useState<string>();

  const isIntervalRef = useRef(false);
  const interval = 5 * 1000; // Interval time for capturing image
  const SAMPLE_IMAGE_NOT_FOUND = "SAMPLE_IMAGE_NOT_FOUND";
  const DEVICE_IMAGE_NOT_FOUND = "DEVICE_IMAGE_NOT_FOUND";

  // Method to fetch the sample image for the selected camera
  const fetchSampleImage = () => {
    if (!selectedDevice?.id) return;

    fetchCameraCaptureImage({
      deviceId: selectedDevice.id,
      imageType: IMAGE_FETCH_TYPE.SAMPLE_IMAGE,
    })
      .then((data) => {
        setReviewComment(data?.comment);
        setSampleImage(data?.sample_image || SAMPLE_IMAGE_NOT_FOUND);
      })
      .catch((errMsg) => {
        if (!retrySampleImageFetch) setRetrySampleImageFetch(true);
        setSampleImage(SAMPLE_IMAGE_NOT_FOUND);
        setSampleErrorMessage(errMsg);
      });
  }

  // Method to fetch the latest camera image
  const fetchDeviceImage = () => {
    if (fetchingImage || !selectedDevice?.id) return;
    setErrorMessage("");
    setFetchingImage(true);

    fetchCameraCaptureImage({
      deviceId: selectedDevice.id,
      imageType: IMAGE_FETCH_TYPE.CAMERA_IMAGE,
    })
      .then((data) => {
        if (data?.device_image) {
          setCameraImageBase64(data.device_image);
        } else if (isIntervalRef.current && !cameraImageBase64) {
          setCameraImageBase64(DEVICE_IMAGE_NOT_FOUND);
        } else if (!isIntervalRef.current) {
          setCameraImageBase64(DEVICE_IMAGE_NOT_FOUND);
        }
        if (isIntervalCapture) {
          isIntervalRef.current &&
            setintervalId(
              setTimeout(() => {
                fetchDeviceImage();
              }, interval),
            );
        } else {
          clearTimeout(intervalId);
        }
      })
      .catch((errMsg) => {
        setErrorMessage(errMsg);
        setIsIntervalCapture(false);
        isIntervalRef.current = isIntervalCapture;
        if (isIntervalRef.current && !cameraImageBase64) {
          setCameraImageBase64(DEVICE_IMAGE_NOT_FOUND);
        } else if (!isIntervalRef.current) {
          setCameraImageBase64(DEVICE_IMAGE_NOT_FOUND);
        }
      })
      .finally(() => {
        setFetchingImage(false);
      });
  };

  // Method called when retrySampleImageFetch is updated, and gets the sample image if retrying
  useEffect(() => {
    if(retrySampleImageFetch) fetchSampleImage();
  }, [retrySampleImageFetch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Method called when selectedDevice is updated, to fetch the sample image and
  // latest image of the camera, and to delete the image capture interval on unload
  useEffect(() => {
    if (selectedDevice?.id) {
      fetchSampleImage();
      fetchDeviceImage();
    } else {
      backClick();
    }
    const handleBeforeUnload = () => {
      //Stopping interval capture before the page is being closed
      setIsIntervalCapture(false);
      isIntervalRef.current = false;
      if (intervalId) {
        clearTimeout(intervalId);
      }
    };
    return () => {
      handleBeforeUnload();
    };
  }, [selectedDevice]); // eslint-disable-line react-hooks/exhaustive-deps

  // Method called when isIntervalCapture is updated to fetch the camera image or remove interval on unload
  useEffect(() => {
    isIntervalRef.current = isIntervalCapture;
    if (isIntervalRef.current) {
      fetchDeviceImage();
    } else {
      if (intervalId) clearTimeout(intervalId);
    }

    return () => {
      if (intervalId) clearTimeout(intervalId);
    };
  }, [isIntervalCapture]); // eslint-disable-line react-hooks/exhaustive-deps

  // Method called when angle of view is reported by Contractor for submission
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (reportClicked || !selectedDevice?.id || !cameraImageBase64 || cameraImageBase64 === DEVICE_IMAGE_NOT_FOUND) return;
      setReportClicked(true);
      setIsIntervalCapture(false);
      setIsLoading(true);
      setErrorMessage("");

      fetchWorkProgressStatus({
        deviceId: selectedDevice.id,
      })
        .then((data) => {
          if (data?.status === DEVICE_PROGRESS_STATUS.APPLIED) {
            setIsLoading(false);
            setErrorMessage(ALREADY_SUBMITTED_ERROR_CODE);
            setTimeout(() => {
              backClick();
            }, NAVIGATE_TIMEOUT);
          } else if (data?.status === DEVICE_PROGRESS_STATUS.APPROVED) {
            setIsLoading(false);
            setErrorMessage(ALREADY_APPROVED_ERROR_CODE);
            setTimeout(() => {
              backClick();
            }, NAVIGATE_TIMEOUT);
          } else {
            createReview({
              image: cameraImageBase64,
              deviceId: selectedDevice.id,
            })
              .then(() => navigate("/review-status"))
              .catch((e) => {
                setIsLoading(false);
                setErrorMessage(e);
                setReportClicked(false);
              });
          }
        })
        .catch((e) => {
          setIsLoading(false);
          setErrorMessage(e);
        });
    }, [cameraImageBase64]); // eslint-disable-line react-hooks/exhaustive-deps

  // Contractor is navigated back to the devices page
  const backClick = () => {
    dispatch(unsetSelectedDevice());
    navigate("/devices", { replace: true });
  };

  return (
    <div className={styles.container}>
      <Header step={3} goBack={true} onGoBack={backClick} />
      {isLoading ? <Loading /> : <div className={styles.overlayFrame} />}
      <div>
        <div style={{ textAlign: "center", marginTop: "10px" }}>
          {t("camera") + ": "}
          <span style={{ fontWeight: "bold" }}>
            {selectedDevice?.device_name}
          </span>
        </div>
        <div className={styles.imageWrap}>
          {!cameraImageBase64 ? (
            <img
              src={placeHolder}
              style={{ width: "100%" }}
              alt={t("image_confirmation_page.facility_img")}
            />
          ) : (
            cameraImageBase64 === DEVICE_IMAGE_NOT_FOUND ? (
              <ImageNotSupportedOutlinedIcon sx={{fontSize: 200}} />
            ) : (
              <ImageWithFallback
                src={cameraImageBase64}
                alt={t("image_confirmation_page.facility_img")}
              />
            )
          )}
        </div>
        <div>{fetchingImage && <LinearProgress color="inherit" />}</div>
      </div>
      <div className={styles.content}>
        <div className={styles.tabs}>
          <p
            className={`${styles.tab} ${!isIntervalCapture && styles.selected}`}
            onClick={() => setIsIntervalCapture(false)}
          >
            {t("image_confirmation_page.single_capture")}
          </p>
          <p
            className={
              `${styles.tab} ` +
              `${isIntervalCapture && styles.selected} ` +
              `${!isIntervalCapture && fetchingImage && styles.disabled}`
            }
            onClick={() => !fetchingImage && setIsIntervalCapture(true)}
          >
            {t("image_confirmation_page.interval_capture")}
          </p>
        </div>
        <MainButton
          onClick={() => !fetchingImage && fetchDeviceImage()}
          disabled={isIntervalCapture || fetchingImage}
        >
          {t("image_confirmation_page.reacquisition_img")}
        </MainButton>
        {reviewComment ? (
          <div className={styles.reviewComment}>
            <span className={styles.bold}>
              {t("image_confirmation_page.review_comment") + ": "}
            </span>
            {reviewComment}
          </div>
        ) : null}
        <h3 className={styles.sectionTitle}>
          {t("image_confirmation_page.title_chk_angle_view")}
        </h3>
        <ul className={styles.checkList}>
          <li>
            <div className={styles.checkListItem}>
              <CheckListIcon />
              <span className={styles.checkListItemText}>
                {t("image_confirmation_page.chk_list_1")}
              </span>
            </div>
            <div style={{ textAlign: "center" }}>
              {sampleImage === undefined ? (
                <img
                  src={placeHolder}
                  style={{ width: "100%" }}
                  alt={t("image_confirmation_page.facility_img")}
                />
              ) : (
                sampleImage === SAMPLE_IMAGE_NOT_FOUND && sampleErrorMessage ? (
                  <div className={styles.sampleImageNotFound}>
                    <ImageNotSupportedOutlinedIcon sx={{fontSize: 200}} />
                    <span>
                      {sampleErrorMessage in EN.error_code
                        ? t("error_code." + sampleErrorMessage)
                        : t("error_code.50008")}
                    </span>
                  </div>
                ) : (
                  <ImageWithFallback
                    src={sampleImage}
                    alt={t("image_confirmation_page.facility_sample_img")}
                  />
                )
              )}
            </div>
          </li>
          <li className={styles.checkListItem}>
            <CheckListIcon />
            <span className={styles.checkListItemText}>
              {t("image_confirmation_page.chk_list_2")}
            </span>
          </li>
          <li className={styles.checkListItem}>
            <CheckListIcon />
            <span className={styles.checkListItemText}>
              {t("image_confirmation_page.chk_list_3")}
            </span>
          </li>
          <li className={styles.checkListItem}>
            <CheckListIcon />
            <span className={styles.checkListItemText}>
              {t("image_confirmation_page.chk_list_4")}
            </span>
          </li>
        </ul>

        <form className={styles.review} onSubmit={handleSubmit}>
          <div className={styles.reportSubmit}>
            <MainButton
              type="submit"
              disabled={
                !cameraImageBase64 ||
                cameraImageBase64 === DEVICE_IMAGE_NOT_FOUND ||
                (!isIntervalCapture && fetchingImage) ||
                reportClicked
              }
            >
              {t("image_confirmation_page.report_btn")}
            </MainButton>
          </div>
        </form>
      </div>
      {errorMessage ? (
        <Alert
          color="error"
          severity="error"
          variant="filled"
          className={styles.errorMsg}
          onClose={() => setErrorMessage("")}
        >
          {errorMessage in EN.error_code
            ? t("error_code." + errorMessage)
            : t("error_code.10000")}
        </Alert>
      ) : null}
    </div>
  );
};