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
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
// Import helpers
import {
  unsetSelectedDevice,
  useGlobalDispatch,
} from "src/contexts/GlobalProvider";
import { retryAuth } from "src/repositories";
// Import components
import { Header, MainButton } from "src/components";
// Import assets, styles
import EN from "../../assets/locales/English";
import styles from "./ErrorPage.module.css";

const UNAUTHORIZED = 401; // Unauthorized error code
const NO_INTERNET = "ERR_NETWORK"; // No Internet error code
const CHECK_INTERNET_INTERVAL = 5000; // Check Internet connection at 5 seconds interval

// Error Page displayed to show application-wide common errors like Network error
export const ErrorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const dispatch = useGlobalDispatch();

  // Contractor navigated to Main page
  const goToHome = async () => {
    await dispatch(unsetSelectedDevice());
    navigate("/");
  };

  // Method to check internet connection by calling the verify authentication API
  const checkInternet = async () => {
    if (location.state?.error_code === NO_INTERNET) {
      await retryAuth() // Retrying Auth token validation via API
      .then((data) => {
        if (data?.facility_name) goToHome();
      }).catch(() => {/**/});
    }
  }

  // Called on page load
  useEffect(() => {
    // Used to create interval, to call checkInternet method after every specified time period
    const intervalId = setInterval(() => checkInternet(), CHECK_INTERNET_INTERVAL);

    // Called on page unload to remove checkInternet interval
    return () => {
      clearInterval(intervalId);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className={styles.container}>
        <Header step={0} />
        <div className={styles.content}>
          <div className={styles.errorContainer}>
            <ErrorOutlineIcon sx={{fontSize: 60, textAlign: "center"}} color="error" />
            <p className={styles.description}>
              {location.state?.error_code ? (
                location.state.error_code in EN.error_code
                  ? t("error_code." + location.state.error_code)
                  : t("error_code.10000")
              ) : (
                t("error_page.error_msg_1")
              )}
            </p>
          </div>
        </div>
        {location.state?.status_code === UNAUTHORIZED || location.state?.error_code === NO_INTERNET ? null : (
          <div className={styles.errBtn}>
            <MainButton onClick={goToHome}>
              {t("error_page.error_btn")}
            </MainButton>
          </div>
        )}
      </div>
    </>
  );
};
