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
import { useTranslation } from "react-i18next";
// Import styles
import styles from "./NotFound.module.css";

// Not Found component displayed to show when the request page is not found
export const NotFound = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.container}>
      <h2>404</h2>
      <p>{t("page_not_found")}</p>
    </div>
  );
};
