import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import translationVi from "locales/vi/translation.json";
import translationEn from "locales/en/translation.json";

import { getLang } from "utils/localStorage";

const resources = {
  "vi-VN": {
    translation: translationVi,
  },
  "en-US": {
    translation: translationEn,
  },
};

i18next.use(initReactI18next).init({
  resources,
  lng: getLang() as any,
  fallbackLng: "en-US",
  keySeparator: false,
  interpolation: {
    escapeValue: false,
  },
});

export default i18next;
