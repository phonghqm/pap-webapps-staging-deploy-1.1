import axios from 'axios';
import API from 'common/API';
import { getPhoneTrack } from './localStorage';

export const getErrorMessage = (defaultError: string, error?: any) => {
  if (typeof error === 'string') {
    return error;
  }

  if (!error || !error?.error) {
    return error?.message || defaultError;
  }

  const err = error.error;

  return err.error || err.show || defaultError;
};

export const ERROR_LOG_TYPE = {
  UPLOAD_FILE: 'UPLOAD FILE',
  SOUND_PERMISSION: 'SOUND PERMISSION',
  DISALLOW_LOCATION: 'DISALLOW LOCATION',
  HANDLE_UPLOAD: 'HANDLE UPLOAD',
  UPDATE_FLOW: 'UPDATE FLOW',
  SUBMIT_FLOW: 'SUBMIT FLOW',
};

export const sendErrorLog = (type: string, error: any) => {
  const errorMessage = (() => {
    if (error?.message) return error?.message;
    if (typeof error === 'object') {
      return JSON.stringify(error);
    }
    return error?.toString();
  })();
  return axios
    .post(API.SYSTEM_LOG, {
      type,
      log: JSON.stringify({ msg: errorMessage, phone: getPhoneTrack() }),
    })
    .catch(() => {});
};
