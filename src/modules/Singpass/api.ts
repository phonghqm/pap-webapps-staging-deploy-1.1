import axios from "axios";
import API from "common/API";
import {
  MyInfoRequest,
  PollMyInfoRequest,
} from "modules/ApplicationSubmit/type";

const request = axios.create({
  baseURL: process.env.REACT_APP_SINGPASS_API_URL,
  timeout: 20 * 1000,
  validateStatus: null,
});

const headerConfig = {
  headers: {
    "x-client-id": process.env.REACT_APP_SINGPASS_CLIENT_ID,
    "x-client-secret": process.env.REACT_APP_SINGPASS_CLIENT_SECRET,
  },
};

const apis = {
  requestMyInfo: (data: MyInfoRequest) =>
    request.post(API.REQUEST_MYINFO, data, headerConfig),
  pollMyInfoData: (data: PollMyInfoRequest) =>
    request.post(API.POLL_MYINFO_DATA, data, headerConfig),
};

export default apis;
