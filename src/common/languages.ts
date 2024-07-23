import { VnFlag, PhilFlag } from "core/icons";

const languages = {
  "en-US": {
    label: "English",
    flag: PhilFlag(),
    phoneCode: "+63",
    phoneRegex: /^(\+63|0)?[9]\d{9}$/,
  },
  "vi-VN": {
    label: "Tiếng Việt",
    flag: VnFlag(),
    phoneCode: "+84",
    phoneRegex: /^(\+84|0)?[3|5|7|8|9]\d{8}$/,
  },
};

export default languages;
