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
import LoadingIcons from "react-loading-icons";
// Import styles
import styles from "./Loading.module.css";

type LoadingProps = {
  loaderText?: string;
};

// Loading component displayed to show a loader to the user while any request is being processed
export const Loading = ({ loaderText }: LoadingProps) => {
  return (
    <div className={styles.container} data-testid="icon-loader">
      <LoadingIcons.TailSpin className={styles.loader} />
      {loaderText && <p style={{ marginTop: 10 }}>{loaderText}...</p>}
    </div>
  );
};
