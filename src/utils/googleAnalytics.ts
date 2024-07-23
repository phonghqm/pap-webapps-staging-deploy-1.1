import { logEvent } from 'firebase/analytics';
import analytics from './firebase';
import { getPhoneTrack } from './localStorage';

export const EVENT_NAME = {
  PAGE_HOME: 'page_home',
  PAGE_TERM_CONDITION: 'page_term_and_condition',
  PAGE_CONTACT: 'page_contact_info',
  PAGE_SIGN_UP: 'page_sign_up',
  PAGE_LOG_IN: 'page_log_in',
  PAGE_CHOOSE_TYPE_REGISTRANT: 'page_choose_type_registrant',
  PAGE_EKYC: 'page_ekyc',
  PAGE_LIVENESS: 'page_liveness',
  PAGE_ID_CARD_FRONT: 'page_id_card_front',
  PAGE_ID_CARD_BACK: 'page_id_card_back',
  PAGE_FORM_REGISTRANT: 'page_form_registrant',
  PAGE_FORM_PATIENT: 'page_form_patient',
  PAGE_FORM_RELATIVE: 'page_form_relative',
  PAGE_LIST_PROFILES: 'page_list_profiles',
  PAGE_RESULT: 'page_result',
  PAGE_CANCEL_RESULT: 'page_cancel_result',
  PAGE_VIDEO_CALL: 'page_video_call',

  BTN_SIGN_UP: 'btn_sign_up',
  BTN_LOG_IN: 'btn_log_in',
  BTN_TERM_CONDITION_NEXT: 'btn_term_and_condition_next',
  BTN_TERM_CONDITION_BACK: 'btn_term_and_condition_back',
  BTN_RESEND_OTP: 'btn_resend_otp',
  BTN_CHOOSE_TYPE_REGISTRANT_NEXT: 'btn_choose_type_registrant_next',
  BTN_CHOOSE_TYPE_REGISTRANT_BACK: 'btn_choose_type_registrant_back',
  BTN_EKYC_GUIDELINE_NEXT: 'btn_ekyc_guideline_next',
  BTN_LIVENESS_NEXT: 'btn_liveness_next',
  BTN_LIVENESS_BACK: 'btn_liveness_back',
  BTN_LIVENESS_RETURN_CAPTURE: 'btn_liveness_return_capture',
  BTN_LIVENESS_UPLOAD: 'btn_liveness_upload',
  BTN_ID_CARD_FRONT_CAPTURE: 'btn_id_card_front_capture',
  BTN_ID_CARD_FRONT_NEXT: 'btn_id_card_front_next',
  BTN_ID_CARD_FRONT_BACK: 'btn_id_card_front_back',
  BTN_ID_CARD_FRONT_RETURN_CAPTURE: 'btn_id_card_front_return_capture',
  BTN_ID_CARD_FRONT_UPLOAD: 'btn_id_card_front_upload',
  BTN_ID_CARD_BACK_CAPTURE: 'btn_id_card_back_capture',
  BTN_ID_CARD_BACK_NEXT: 'btn_id_card_back_next',
  BTN_ID_CARD_BACK_BACK: 'btn_id_card_back_back',
  BTN_ID_CARD_BACK_RETURN_CAPTURE: 'btn_id_card_back_return_capture',
  BTN_ID_CARD_BACK_UPLOAD: 'btn_id_card_back_upload',
  BTN_EKYC_CONFIRM_NEXT: 'btn_ekyc_confirm_next',
  BTN_EKYC_CONFIRM_BACK: 'btn_ekyc_confirm_back',
  BTN_FORM_REGISTRANT_NEXT: 'btn_form_registrant_next',
  BTN_FORM_REGISTRANT_BACK: 'btn_form_registrant_back',
  BTN_FORM_PATIENT_NEXT: 'btn_form_patient_next',
  BTN_FORM_PATIENT_BACK: 'btn_form_patient_back',
  BTN_CREATE_RELATIVE: 'btn_create_relative',
  BTN_FORM_RELATIVE_NEXT: 'btn_form_relative_next',
  BTN_FORM_RELATIVE_BACK: 'btn_form_relative_back',
  BTN_SUBMIT_APPLICATION: 'btn_submit_application',
  BTN_SUBMIT_APPLICATION_CONFIRM: 'btn_submit_application_confirm',
  BTN_UPDATE_APPLICATION: 'btn_update_application',
  BTN_UPDATE_APPLICATION_CONFIRM: 'btn_update_application_confirm',
  BTN_CANCEL_RESULT: 'btn_cancel_result',
  BTN_CANCEL_RESULT_CONFIRM: 'btn_cancel_result_confirm',
  BTN_AGREE_RESULT: 'btn_agree_result',
  BTN_LOGOUT: 'btn_log_out',
  BTN_EXIT: 'btn_exit',
  BTN_HOTLINE_SUPPORT: 'btn_hotline_support',
  BTN_VIDEO_CALL_ACCEPT: 'btn_video_call_accept',
  BTN_VIDEO_CALL_REJECT: 'btn_video_call_reject',
  BTN_VIDEO_CALL_END: 'btn_video_call_end',
  BTN_RE_SUBMIT_APPLICATION: 'btn_re_submit_application',

  OTP_SUCCCESS_CONFIRM: 'successed_otp',
  OTP_FAILED_CONFIRM: 'failed_otp',
};

export const logGAEvent = (
  name: string,
  properties?: { [key: string]: any }
) => {
  if (!name || process.env.REACT_APP_ENV !== 'production') return;
  return logEvent(analytics, name, {
    phone: getPhoneTrack(),
    user_agent: navigator.userAgent,
    ...properties,
  });
};
