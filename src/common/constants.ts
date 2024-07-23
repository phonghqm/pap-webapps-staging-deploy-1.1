import PATH from "./path";

export const COMMON_IMAGE = {
  INTRO_IMAGE: "/Intro_Img.webp",
  WAITING: "/Waiting.webp",
  UPDATE_SUCCESS: "/UpdateSuccess.webp",
};

export const SUPPORT_EMAIL = "vepap@easygop.com";
export const HOTLINE = "028 8889 8949";
// export const HOTLINE_2 = '024 9995 5977';

export const ADDRESS = [
  "1B Street No. 30, Ward An Khanh",
  "Thu Duc City",
  "Ho Chi Minh City",
];

export type MenuType = {
  label: string;
  path: string;
  event?: string;
};

export const MENUS = [
  // {
  //   label: 'Giới thiệu chương trình',
  //   path: PATH.INTRO,
  // },
  {
    label: "TERM_AND_CONDITION_TITLE",
    path: PATH.TERM_CONDITION,
  },
  // {
  //   label: 'Câu hỏi thường gặp',
  //   path: PATH.FAQ,
  // },
  {
    label: "CONTACT_INFO",
    path: PATH.CONTACT,
  },
] as MenuType[];

export const EKYC_STEP = {
  PORTRAIT: "portrait",
  FRONT: "front",
  BACK: "back",
};

export const STATUS_PROFILE = {
  PROCESSING: "PROCESSING",
  RE_APPROVAL: "RE_APPROVAL",
  DOCUMENT_NEEDED: "DOCUMENT_NEEDED",
  CONFIRMING: "CONFIRMING",
  CONFIRMED: "CONFIRMED",
  REJECTED: "REJECTED",
  DUPLICATE_PROFILE: "DUPLICATE_PROFILE",
  NOT_QUALIFIED_FOR_EVALUATION: "NOT_QUALIFIED_FOR_EVALUATION",
  CREATING: "CREATING",
};

export const STATUS_PROFILE_MAPPING = {
  [STATUS_PROFILE.PROCESSING]: {
    color: "#FA9A0A",
    label: "PROCESSING",
    text: "white",
  },
  [STATUS_PROFILE.RE_APPROVAL]: {
    color: "#FA9A0A",
    label: "RE_APPROVAL",
    text: "white",
  },
  [STATUS_PROFILE.DOCUMENT_NEEDED]: {
    color: "#5959f7",
    label: "DOCUMENT_NEEDED",
    text: "white",
  },
  [STATUS_PROFILE.CONFIRMING]: {
    color: "#00B28F",
    label: "CONFIRMING",
    text: "white",
  },
  [STATUS_PROFILE.CONFIRMED]: {
    color: "#DAF7F0",
    label: "CONFIRMED",
    text: "#00B28F",
  },
  [STATUS_PROFILE.REJECTED]: {
    color: "#1ba7a6",
    label: "REJECTED",
    text: "white",
  },
  [STATUS_PROFILE.DUPLICATE_PROFILE]: {
    color: "#5959f7",
    label: "DUPLICATE_PROFILE",
    text: "white",
  },
  [STATUS_PROFILE.NOT_QUALIFIED_FOR_EVALUATION]: {
    color: "#EBEBFF",
    label: "NOT_QUALIFIED_FOR_EVALUATION",
    text: "#2929CC",
  },
};

export const SCHEME = {
  TYPE_A: "TYPE_A",
  TYPE_B: "TYPE_B",
  TYPE_C: "TYPE_C",
  NONE: "NONE",
};

export const SCHEME_MAPPING = {
  [SCHEME.TYPE_A]: {
    level: "SUPPORT_LEVEL_1",
    content: "SUPPORT_LEVEL_1_CONTENT",
  },
  [SCHEME.TYPE_B]: {
    level: "SUPPORT_LEVEL_2",
    content: "SUPPORT_LEVEL_2_CONTENT",
  },
  [SCHEME.TYPE_C]: {
    level: "SUPPORT_LEVEL_3",
    content: "SUPPORT_LEVEL_3_CONTENT",
  },
  [SCHEME.NONE]: {
    level: "SUPPORT_LEVEL_NONE",
    content: "SUPPORT_LEVEL_NONE_CONTENT",
  },
};

export const ADDRESS_KIND = {
  PERMARNENT_RESIDENT: "PERMARNENT_RESIDENT",
  TEMPORARY_RESIDENT: "TEMPORARY_RESIDENT",
};

export const OWNER_RELATIVE = "OWNER";

export const OTHER = "Khác";

export const PROFILES_PAGE = "profiles";
export const IMAGE_STATUS = {
  ACTIVE: "ACTIVE",
  REMOVE: "REMOVE",
};

export const EXPIRED_TOKEN = "EXPIRED_TOKEN";
