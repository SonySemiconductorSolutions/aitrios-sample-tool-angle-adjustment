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
import LoadingIcons from "react-loading-icons";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
// Import components
import { MainButton } from "src/components";
import { Header } from "src/components/blocks/Header/Header";
// Import helpers
import {
  unsetSelectedDevice,
  useGlobalDispatch,
  useGlobalState,
} from "src/contexts/GlobalProvider";
import { fetchWorkProgressStatus } from "src/repositories/api";
import { DEVICE_PROGRESS_STATUS } from "src/repositories/constants";
// Import assets, styles
import EN from "../../assets/locales/English";
import styles from "./ReviewStatusPage.module.css";

const POLLING_INTERVAL = 1000 * 3;

// Review Status Page displayed to show the current status of the submitted review
export const ReviewStatusPage = () => {
  const dispatch = useGlobalDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const selectedDevice = useGlobalState((s) => s.selectedDevice);

  const [resultStatus, setResultStatus] = useState<number>(
    DEVICE_PROGRESS_STATUS.REQUESTING_FOR_REVIEW,
  );
  const [reviewComment, setReviewComment] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout>();
  const stopPolling = useRef(false);

  // Method called to check the current status of the submitted review
  const checkProgress = useCallback(() => {
    if (!selectedDevice?.id || stopPolling.current) return;

    fetchWorkProgressStatus({
      deviceId: selectedDevice?.id,
    })
      .then((data) => {
        setErrorMessage("");
        setResultStatus(data?.status || DEVICE_PROGRESS_STATUS.REQUESTING_FOR_REVIEW);
        setReviewComment(data?.review_comment);
        if (data?.status !== DEVICE_PROGRESS_STATUS.REQUESTING_FOR_REVIEW) {
          stopPolling.current = true;
          clearInterval(intervalId);
        }
      })
      .catch((e) => {
        setErrorMessage(e);
      });
  }, [selectedDevice, stopPolling, intervalId]);

  // Method to create interval and execute callback method at
  // every given interval, and delete the interval during unload
  const useInterval = (callback: () => void, delay: number) => {
    const savedCallback = useRef(() => {/**/});

    // Remember the latest callback
    useEffect(() => {
      if (callback) savedCallback.current = callback;
    }, [callback]);

    // Set up the interval
    useEffect(() => {
      const tick = () => {
        if (savedCallback.current) savedCallback.current();
      };
      if (delay !== null) {
        const id = setInterval(tick, delay);
        setIntervalId(id);
        return () => clearInterval(id);
      }
    }, [delay]);
  };

  // Called useInterval method with checkProgress method
  // at every POLLING_INTERVAL time to get the review status
  useInterval(() => {
    checkProgress();
  }, POLLING_INTERVAL);

  // Method to navigate the Contractor to respective pages on click of different buttons
  const goBack = async (path: string) => {
    if (path === "/devices") {
      await dispatch(unsetSelectedDevice());
    } else if (path === "/") {
      await dispatch(unsetSelectedDevice());
    }
    navigate(path, { replace: true });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className={styles.container}>
        <Header
          step={4}
          checked={resultStatus === DEVICE_PROGRESS_STATUS.APPROVED}
        />
        <div className={styles.content}>
          <div className={styles.description}>
            {resultStatus === DEVICE_PROGRESS_STATUS.REQUESTING_FOR_REVIEW ? (
              <>
                <div className={styles.deviceNameContainer}>
                  <span>{t("camera") + ": "}</span>
                  <span style={{ fontWeight: "bold" }}>
                    {selectedDevice?.device_name}
                  </span>
                </div>
                <LoadingIcons.SpinningCircles style={{ marginTop: 20 }} />
              </>
            ) : (
              <div className={styles.deviceNameContainer}>
                {t("camera") + ": "}
                <span style={{ fontWeight: "bold" }}>
                  {selectedDevice?.device_name}
                </span>
              </div>
            )}
          </div>
          <p
            className={styles.descriptionDetail}
            data-testid={
              resultStatus === DEVICE_PROGRESS_STATUS.REQUESTING_FOR_REVIEW
                ? "review-status-requesting"
                : resultStatus === DEVICE_PROGRESS_STATUS.REJECTED
                ? "review-status-rejected"
                : "review-status-approved"
            }
          >
            {resultStatus === DEVICE_PROGRESS_STATUS.REQUESTING_FOR_REVIEW
              ? t("review_status_page.des2_p1")
              : resultStatus === DEVICE_PROGRESS_STATUS.REJECTED
                ? t("review_status_page.reject_des1_p1")
                : t("review_status_page.approval_des1_p1")}
            <br />
            {resultStatus === DEVICE_PROGRESS_STATUS.REQUESTING_FOR_REVIEW
              ? t("review_status_page.des2_p2")
              : resultStatus === DEVICE_PROGRESS_STATUS.REJECTED
                ? t("review_status_page.reject_des1_p2")
                : t("review_status_page.approval_des1_p2")}
            <br />
          </p>
          {resultStatus === DEVICE_PROGRESS_STATUS.REJECTED && reviewComment ? (
            <div className={styles.reviewComment}>
              <span className={styles.bold}>
                {t("image_confirmation_page.review_comment") + ": "}
              </span>
              {reviewComment}
            </div>
          ) : null}
          <div
            data-testid="go-back-btn"
            className={styles.reportSubmit}
            onClick={() => {
              if (resultStatus === DEVICE_PROGRESS_STATUS.REJECTED) {
                goBack("/image-confirmation");
              } else {
                goBack("/devices");
              }
            }}
          >
            <MainButton>
              {resultStatus === DEVICE_PROGRESS_STATUS.REJECTED
                ? t("review_status_page.reject_retry")
                : t("review_status_page.setup_another_cam")}
            </MainButton>
          </div>
          <div
            onClick={() => goBack("/")}
            data-testid="go-to-home-btn"
            className={styles.reportSubmit}>
            <MainButton>{t("review_status_page.go_to_home")}</MainButton>
          </div>
        </div>
        {errorMessage ? (
          <Alert
            color="error"
            severity="error"
            variant="filled"
            className={styles.errorMsg}
            data-testid="alert-error-message"
            onClose={() => setErrorMessage("")}
          >
            {errorMessage in EN.error_code
              ? t("error_code." + errorMessage)
              : t("error_code.10000")}
          </Alert>
        ) : null}
      </div>
    </>
  );
};
