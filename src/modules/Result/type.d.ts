import { SubmitApplicationProfile } from 'modules/Auth/type';

export type ConfirmResultResponse = BaseResponse & {
  data: {
    profiles: SubmitApplicationProfile[];
    re_submit: boolean;
  };
};

export type RejectResultResponse = BaseResponse & {
  data: {
    profiles: SubmitApplicationProfile[];
    re_submit: boolean;
  };
};

export type ConfirmResultReq = {
  phone: string;
  otp_code?: string;
};
