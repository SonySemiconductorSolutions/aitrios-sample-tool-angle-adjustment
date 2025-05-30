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
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
// Import hooks
import useEffectOnce from "src/hooks/useEffectOnce";
import useApiGlobalErrorHandler from "src/hooks/useApiGlobalErrorHandler";
// Import helpers, utils
import { getSelectedLanguage } from "src/utils/languageStore";
import { useGlobalDispatch, setSelectedLanguage } from "src/contexts/GlobalProvider";

interface GlobalListenerProps {
  children: React.ReactNode;
}

export default function GlobalListener({ children }: GlobalListenerProps) {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const dispatch = useGlobalDispatch();

  useApiGlobalErrorHandler();

  // 初回アクセス時トップページにリダイレクト
  useEffectOnce(() => {
    const storedLanguage = getSelectedLanguage();
    if (storedLanguage) {
      dispatch(setSelectedLanguage(storedLanguage));
      i18n.changeLanguage(storedLanguage);
    }
    if (location.pathname !== "/") navigate("/", { replace: true });
  });

  return <>{children}</>;
}
