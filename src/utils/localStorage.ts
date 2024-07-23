// import { generateId } from './helpers';

import { PROFILES_PAGE } from "common/constants";

const AUTH_TOKEN = "auth";
export const PHONE = "phone";
const CURRENT_PAGE = "current_page";
const CALL_TOKEN = "call_token";
export const LANG = "lang";
const PHONE_TRACK = "phone_track";
export const NON_SUBMIT_PROFILE_DATA = "non_submit_profile_data";
export const IS_SUBMIT_APPLICATION = "isSubmitApplication";
export const NOT_SUBMIT_APPLICATION_TOKEN = "notSubmitApplicationToken";

export const localStorageService = {
  set: (storageKey: string, value: any) => {
    return window.localStorage.setItem(storageKey, JSON.stringify(value));
  },
  get: (storageKey: string) => {
    const item = window.localStorage.getItem(storageKey);
    try {
      return JSON.parse(item as string);
    } catch (error) {
      return null;
    }
  },
};

export function getToken() {
  return localStorage.getItem(AUTH_TOKEN);
}

export function setToken(token: string) {
  window.localStorage.setItem(AUTH_TOKEN, token);
}

export function removeToken() {
  localStorage.clear();
}

export function getPhone() {
  return localStorage.getItem(PHONE);
}

export function getCache() {
  const phone = localStorage.getItem(PHONE);

  if (!phone) {
    return null;
  }

  const data = [];
  for (const k in localStorage) {
    // eslint-disable-next-line no-prototype-builtins
    if (localStorage.hasOwnProperty(k)) {
      if (k.match(/^draft-\w+$/)) {
        data.push(localStorage.getItem(k));
      }
    }
  }

  return {
    phone,
    data,
    current_page: localStorage.getItem(CURRENT_PAGE),
    profiles: localStorage.getItem(PROFILES_PAGE) === "true",
  };
}

export function setPhone(phone: string) {
  localStorage.setItem(PHONE, phone);
}

export function setCurrentPage(current_page: string) {
  localStorage.setItem(CURRENT_PAGE, current_page);
}

export function setProfilesPage() {
  localStorage.setItem(PROFILES_PAGE, "true");
}

export function setData(data: string, index: string) {
  const key = `draft-${index}`;
  localStorage.setItem(key, data);
}

export function removeOneCache(index: string) {
  const key = `draft-${index}`;
  localStorage.removeItem(key);
}

export function removeCache() {
  const keyToRemove =
    /^(phone)|(profiles)|(current_page)|(phone_track)|(draft-\w+)$/;
  for (const k in localStorage) {
    // eslint-disable-next-line no-prototype-builtins
    if (localStorage.hasOwnProperty(k)) {
      if (k.match(keyToRemove)) {
        localStorage.removeItem(k);
      }
    }
  }
}

export function getCallToken() {
  return localStorage.getItem(CALL_TOKEN);
}

export function setCallToken(token: string) {
  localStorage.setItem(CALL_TOKEN, token);
}

export function removeCallToken() {
  localStorage.removeItem(CALL_TOKEN);
}

export function getLang() {
  localStorage.setItem(LANG, "en-US");
  return localStorage.getItem(LANG);
}

export function setLang(lang: string) {
  localStorage.setItem(LANG, lang);
}

export function setPhoneTrack(phone: string) {
  localStorage.setItem(PHONE_TRACK, phone);
}

export function getPhoneTrack() {
  return localStorage.getItem(PHONE_TRACK);
}

export function removePhoneTrack() {
  localStorage.removeItem(PHONE_TRACK);
}
