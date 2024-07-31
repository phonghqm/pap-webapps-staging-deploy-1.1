import axios from "axios";
import API from "common/API";
import {
  MyInfoRequest,
  PollMyInfoRequest,
} from "modules/ApplicationSubmit/type";
import request from "utils/request";

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
