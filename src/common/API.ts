const API = {
  GENERATE_OTP: "/otp/generate",
  CONFIRM_OTP: "/otp/confirm",
  UPLOAD: "/uploads",
  ALL_CITY: "/addresses/provinces",
  ALL_DISTRICT: (cityId: number) => `/addresses/provinces/${cityId}/cities`,
  ALL_WARD: (districtId: number) => `/addresses/cities/${districtId}/wards`,
  SUBMIT: "/profiles/submit-application",
  UPDATE_SUBMIT: "/profiles/upsert",
  UPLOAD_OCR: "/profiles/ocr",
  UNLINK_UPLOADED_FILE: "/profiles/unlink-uploaded-file",
  UNLINK_UPLOADED_FILE_WITH_ONLY_PHONE:
    "/profiles/unlink-uploaded-file-only-phone",
  LOGIN: "/profiles/login",
  LOGOUT: "/profiles/logout",
  LIST_PROFILES: "/profiles/registered",
  GET_PROFILE: "/profiles",
  GET_HOSPITALS: "/profiles/hospitals",
  GET_SCHOOLS: "/profiles/schools",
  GET_COMMON_OPTIONS_CONFIG: (config: string) => `/profiles/options/${config}`,
  CREATE_USER_DEVICE_LOG: "/profiles/user-devices",

  REJECT_RESULT: "/profiles/reject-application",
  CONFIRM_RESULT: "/profiles/confirm-application",
  CHECK_PHONE: "/profiles/signup",
  CHECK_PHONE_LOGIN: "/profiles/check-phone",

  CHECK_WEBPASS: "/check-web-pw",
  SYSTEM_LOG: "/system-log",
  DOCUMENT_NEEDED: "/profiles/application",
  SAVE_APPLICATION: "/profiles/save-application",
  CONFIRM_OTP_SIGNUP: "profiles/confirm-otp-sign-up",
  GET_EKYC: "profiles/ekyc-image ",
  ADD_ADDRESS: "/addresses/create-address",
  REQUEST_MYINFO: "/singpass/myInfo",
  POLL_MYINFO_DATA: "/singpass/poll-data",
};

export default API;
