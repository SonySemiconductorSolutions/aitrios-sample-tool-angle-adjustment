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
import cx from "classnames";
import CheckIcon from "@mui/icons-material/Check";

import styles from "./Step.module.css";


interface Props {
  stepName: string;
  stepTitle: string;
  stepChecked?: boolean;
  highlighting?: boolean;
  nextStepChecked?: boolean;
}

export const Step: React.FC<Props> = ({
  stepTitle,
  stepName = "",
  stepChecked = false,
  highlighting = false,
  nextStepChecked = false,
}) => {
  return (
    <div className={cx([styles.step, nextStepChecked && styles.stepChecked])}>
      {stepName ? (
        <span className={cx([styles.stepName, !highlighting && styles.gray])}>{stepName}</span>
      ) : null}
      <span className={cx([styles.stepTitle, !highlighting && styles.gray])}>
        {stepTitle}
      </span>
      <span className={cx([styles.stepBarCircle, stepChecked && styles.checked, highlighting && styles.yellowBorder])}>
        {stepChecked && <CheckIcon className={styles.stepBarCheckIcon} />}
      </span>
    </div>
  );
};
