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
import CheckIcon from "@mui/icons-material/Check";
// Import styles
import styles from "./CheckListIcon.module.css";

// CheckListIcon component displayed to show the check mark icon
export const CheckListIcon = () => {
  return (
    <span className={styles.container}>
      <CheckIcon className={styles.checkIcon} />
    </span>
  );
};
