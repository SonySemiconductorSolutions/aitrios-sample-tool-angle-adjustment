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
import cx from "classnames";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
// Import components
import { Header, Loading, MainButton } from "src/components";
// Import helpers
import { useGlobalDispatch, useGlobalState } from "src/contexts/GlobalProvider";
import {
  setAuthorized,
  setFacilityDetail,
} from "src/contexts/GlobalProvider/actions";
import useEffectOnce from "src/hooks/useEffectOnce";
import { checkAuth } from "src/repositories";
// Import assets, styles
import styles from "./TopPage.module.css";
import EN from "../../assets/locales/English";

// Main page of the application when it gets loaded
// Validates the Auth token
// If Auth is valid then shows facility details to be confirmed
export const TopPage = () => {
  const navigate = useNavigate(); // Used for navigation
  const { t } = useTranslation(); // Used for Translation
  const dispatch = useGlobalDispatch(); // Used for updating global variables
  const [isLoading, setLoading] = useState(true); // Used to handle loader
  const [hasErrorStatus, setErrorStatus] = useState(false); // Used to handle error status
  const isAuthorized = useGlobalState((s) => s.isAuthorized); // Used to check if already authorized by global variable
  const facilityDetails = useGlobalState((s) => s.facility); // Used to fetch facility details from global variable
  const location = useLocation(); // Used get routed url
  const searchParams = new URLSearchParams(location.search); // Used to parse routed url
  const authenticate = searchParams.get("authenticate"); // reading auth token from Url
  const [errorMessage, setErrorMessage] = useState<string>(""); // Used to update error message

  // Used for checking Auth token with API
  const checkToken = async (token: string) => {
    setLoading(true); // Show's loader
    await checkAuth({ token: token }) // Validating Auth token via API
      .then((data) => {
        if (data.facility_name) {
          // fetching Facility info from API
          dispatch(
            setFacilityDetail({
              facilityName: data.facility_name,
              municipality: data.municipality,
              prefecture: data.prefecture,
            }),
          );
          dispatch(setAuthorized(true)); // Updating authorized to global variable
        }
      })
      .catch((e) => {
        //Handling error scenario for auth validation
        setErrorMessage(e);
        setErrorStatus(true);
        dispatch(setAuthorized(false));
        setLoading(false);
        dispatch(setFacilityDetail({}));
      })
      .finally(() => {
        setLoading(false); // hiding loader
      });
  };

  // Code block is executed once when initial screen is loaded to validate auth token
  useEffectOnce(() => {
    if (!isAuthorized) {
      //checking if not authorized
      if (authenticate)
        checkToken(authenticate); // calling auth API if auth token exists
      else {
        // Added loader for 500 milliseconds for app states to be updated
        setTimeout(() => setLoading(false), 500);
      }
    } else {
      // Added loader for 500 milliseconds for app states to be updated
      setTimeout(() => setLoading(false), 500);
    }
  });

  // Contractor navigated to devices page on click of Confirm Facility button
  const handleNext = () => navigate("/devices"); // Navigate to devices page

  return (
    <>
      {isAuthorized ? (
        <div className={styles.container}>
          <Header step={1} />
          <div className={styles.content}>
            <p className={styles.description}>
              {t("top_page.para_1")}
              <br />
              <br />
              {t("top_page.facility_name")}
              {facilityDetails?.facilityName ?? ""}
              <br />
              {t("top_page.prefecture")}
              {facilityDetails?.prefecture ?? ""}
              <br />
              {t("top_page.municipality")}
              {facilityDetails?.municipality ?? ""}
              <br />
              <br />
              {t("top_page.para_2")}
            </p>
          </div>
          <div className={styles.buttonsContainer}>
            <MainButton onClick={handleNext}>
              {t("top_page.confirm_facility")}
            </MainButton>
          </div>
          <div style={{ alignSelf: "center", marginTop: "20px" }}>
            <p>v{t("version")}</p>
          </div>
        </div>
      ) : (
        <div className={styles.authContainer}>
          <Header step={0} />
          {isLoading && <Loading loaderText={t("top_page.loader_text")} />}
          <div className={styles.content}>
            {!isLoading && (
              <p className={cx([styles.description, styles.error])}>
                {!hasErrorStatus ? (
                  t("top_page.qr_para_1")
                ) : (
                  <>
                    {t("top_page.error")}
                    {errorMessage ? (
                      errorMessage in EN.error_code
                        ? t("error_code." + errorMessage)
                        : t("error_code.10000")
                    ) : t("top_page.qr_para_2")}
                  </>
                )}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};
