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
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import EN from "./assets/locales/English"; // English translations
import JP from "./assets/locales/Japanese"; // Japanese translations
import { useStore } from "./store";

const initializeI18n = (defaultLanguage: string) => {
  i18n.use(initReactI18next).init({
    resources: {
      en: {
        translation: EN,
      },
      jp: {
        translation: JP,
      },
    },
    lng: defaultLanguage, // default language
    fallbackLng: "jp", // fallback language
    interpolation: {
      escapeValue: false,
    },
  });
};

// Initialize i18n with the default language from the store
initializeI18n(useStore.getState().currentLanguage);

// Listen to changes in the language and update i18n dynamically
useStore.subscribe(
  (state) => {
    i18n.changeLanguage(state.currentLanguage);
  }
);

export default i18n;
