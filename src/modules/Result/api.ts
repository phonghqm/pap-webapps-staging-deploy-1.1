import API from 'common/API';
import request from 'utils/request';
import {
  ConfirmResultReq,
  ConfirmResultResponse,
  RejectResultResponse,
} from './type';

const apis = {
  confirmResult: (req: ConfirmResultReq) =>
    request.put<ConfirmResultResponse>(API.CONFIRM_RESULT, req),

  rejectResult: (req: ConfirmResultReq) =>
    request.put<RejectResultResponse>(API.REJECT_RESULT, req),
};

export default apis;
