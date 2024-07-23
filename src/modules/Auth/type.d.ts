export type GenerateOtpReq = {
  phone: string;
};

export type UserNotSubmitAccount = {
  id: number;
  phone: string;
};

export type GenerateOtpResponse = BaseResponse & {
  data: string;
};

export type ConfirmOtpReq = {
  phone: string;
  otp_code: string;
  pc_code?: string;
  agree_term: boolean;
};

export type ConfirmOtpResponse = BaseResponse & {
  data: {
    hospital: string;
    user_account: UserNotSubmitAccount;
    user_account_token: string;
  };
};

export type SubmitApplicationProfile = {
  id: number;
  full_name: string;
  phone: string;
  dob: string;
  gender: string;
  id_card_number: string;
  email: string;
  agree_term: boolean;
  papers: string;
  pap_relationship: string;
  pap_submitted_application_id: number;
  is_present: boolean;
  coordination: string;
  scheme: Scheme;
  status: ApplicationStatus;
  active_status: 'ACTIVE' | 'INACTIVE';
  pc_code: string;
  token: string;
  stringee_token: string;
};

export type LoginReq = {
  phone: string;
  otp_code: string;
  coordination: string | null;
};

export type LoginResponse = BaseResponse & {
  data: {
    profiles: SubmitApplicationProfile[];
    token: string;
    stringee_token: string;
    re_submit: boolean;
    is_submitted_application: boolean;
    pc_code: string;
    hospital: string;
    user_account: UserNotSubmitAccount;
    user_account_token: string | null;
  };
};

export type GetProfileResponse = BaseResponse & {
  data: {
    profiles: SubmitApplicationProfile[];
    token: string;
    stringee_token: string;
    re_submit: boolean;
    pc_code;
  };
};

export type CheckPresentUserReq = {
  phone: string;
};

export type CheckExistingPresentUserPhoneAndPCCodeReq = {
  phone: string;
  pc_code: string;
};
