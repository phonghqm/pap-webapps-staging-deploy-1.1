import axios, { AxiosError } from 'axios';
import { getToken, localStorageService } from './localStorage';

const request = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 20 * 1000,
  validateStatus: null,
});

request.interceptors.request.use(
  config => {
    const token = getToken();

    const isSubmitApplication = localStorageService.get('isSubmitApplication');

    if (!isSubmitApplication) {
      const notSubmitApplicationToken = localStorageService.get(
        'notSubmitApplicationToken'
      );

      if (notSubmitApplicationToken) {
        config.headers.Authorization = `Bearer ${notSubmitApplicationToken}`;
      }
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }

    if (token) config.headers.Authorization = `Bearer ${token}`;

    return config;
  },
  error => Promise.reject(error)
);

request.interceptors.response.use(
  response => {
    const res = response.data;
    if (res.success) return res;
    return Promise.reject(res);
  },
  error => {
    if (error.error) {
      return Promise.reject(error.error);
    }
    if (error instanceof AxiosError && error.message === 'Network Error') {
      return Promise.reject({
        error: {
          error: 'Lỗi kết nối máy chủ',
        },
      });
    }

    return Promise.reject({
      error: {
        error: 'Có lỗi xảy ra',
      },
    });
  }
);

export default request;
