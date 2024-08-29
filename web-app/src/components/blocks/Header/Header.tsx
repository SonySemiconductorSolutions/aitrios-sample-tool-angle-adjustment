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
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
// Import components
import { Step } from "src/components";
// Import helpers
import {
  useGlobalState,
  useGlobalDispatch,
  setSelectedLanguage,
} from "src/contexts/GlobalProvider";
// Import styles
import styles from "./Header.module.css";

interface Props {
  step: number;
  goBack?: boolean;
  checked?: boolean;
  onGoBack?: () => void;
}

// Header component displayed to show the current step of the camera setup
export const Header: React.FC<Props> = ({
  step,
  goBack = false,
  checked = false,
  onGoBack = () => {/* empty method */},
}) => {
  const dispatch = useGlobalDispatch();
  const { t, i18n } = useTranslation();
  const selectedLanguage = useGlobalState((state) => state.selectedLanguage);

  // Used to mark Step 1 as checked
  const step1Checked = useMemo(
    () => step > 1 || (step === 1 && checked),
    [checked, step],
  );
  // Used to mark Step 2 as checked
  const step2Checked = useMemo(
    () => step > 2 || (step === 2 && checked),
    [checked, step],
  );
  // Used to mark Step 3 as checked
  const step3Checked = useMemo(
    () => step > 3 || (step === 3 && checked),
    [checked, step],
  );
  // Used to mark Step 4 as checked
  const step4Checked = useMemo(() => step === 4 && checked, [checked, step]);

  // Method to toggle the selected language of the application
  const toggleSelectedLanguage = (lang: string) => {
    if (lang !== selectedLanguage) {
      dispatch(setSelectedLanguage(lang));
      i18n.changeLanguage(lang);
    }
  };

  return (
    <div className={styles.headerContainer}>
      <div className={styles.topContainer}>
        <div className={styles.toolContainer}>
          <span className={styles.backButton} onClick={() => onGoBack()}>
            {goBack ? <ChevronLeftIcon /> : null}
          </span>
          {t("app_title")}
        </div>
        <div className={styles.languageToggler}>
          <span
            onClick={() => toggleSelectedLanguage("ja")}
            className={cx([
              styles.language,
              selectedLanguage === "ja" && styles.selected,
            ])}
          >
            日本語
          </span>
          <span
            onClick={() => toggleSelectedLanguage("en")}
            className={cx([
              styles.language,
              selectedLanguage === "en" && styles.selected,
            ])}
          >
            ENG
          </span>
        </div>
      </div>
      {step > 0 && (
        <div className={styles.steps}>
          <Step
            highlighting={step >= 1}
            stepChecked={step1Checked}
            nextStepChecked={step2Checked}
            stepName={t("header.step1_p1")}
            stepTitle={t("header.step1_p2")}
          />
          <Step
            highlighting={step >= 2}
            stepChecked={step2Checked}
            nextStepChecked={step3Checked}
            stepName={t("header.step2_p1")}
            stepTitle={t("header.step2_p2")}
          />
          <Step
            highlighting={step >= 3}
            stepChecked={step3Checked}
            nextStepChecked={step4Checked}
            stepName={t("header.step3_p1")}
            stepTitle={t("header.step3_p2")}
          />
          <Step
            highlighting={step === 4}
            stepChecked={step4Checked}
            stepName={t("header.step4_p1")}
            stepTitle={t("header.step4_p2")}
          />
        </div>
      )}
    </div>
  );
};
