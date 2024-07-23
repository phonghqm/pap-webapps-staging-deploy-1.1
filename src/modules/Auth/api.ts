import request from 'utils/request';
import {
  LoginReq,
  ConfirmOtpReq,
  ConfirmOtpResponse,
  GenerateOtpReq,
  GenerateOtpResponse,
  GetProfileResponse,
  LoginResponse,
  CheckPresentUserReq,
  CheckExistingPresentUserPhoneAndPCCodeReq,
} from './type';
import API from 'common/API';

const apis = {
  generateOtp: (req: GenerateOtpReq) =>
    request.post<GenerateOtpResponse>(API.GENERATE_OTP, req),

  confirmOtp: (req: ConfirmOtpReq) =>
    request.post<ConfirmOtpResponse>(API.CONFIRM_OTP, req),

  confirmOtpSignUp: (req: ConfirmOtpReq) =>
    request.post<ConfirmOtpResponse>(API.CONFIRM_OTP_SIGNUP, req),
  login: (req: LoginReq) => request.post<LoginResponse>(API.LOGIN, req),

  getProfile: () => request.get<GetProfileResponse>(API.GET_PROFILE),

  checkExistingPresentUserPhoneAndPCCode: (
    req: CheckExistingPresentUserPhoneAndPCCodeReq
  ) => request.post<BaseResponse>(API.CHECK_PHONE, req),

  checkWebappPassword: (data: any) =>
    request.post<BaseResponse>(API.CHECK_WEBPASS, data),

  checkPresentUserByPhone: (req: CheckPresentUserReq) =>
    request.post<BaseResponse>(API.CHECK_PHONE_LOGIN, req),

  logOut: () => request.post<BaseResponse>(API.LOGOUT),
};

export default apis;
