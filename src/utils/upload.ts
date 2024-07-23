import API from 'common/API';
import request from './request';
import { b64toBlob, getLastElement } from './helpers';

type UploadResponse = BaseResponse & {
  data: {
    url: string;
    id: number;
    status: 'ACTIVE' | 'REMOVED';
  };
};

export type OCRResponse = BaseResponse & {
  data: {
    id: string;
    name: string;
    address: string;
    dob: string;
    home: string;
    gender: string;
    expiredDate: string;
    documentType: string;
  };
};

export const uploadImage = (
  file: any,
  phone: string,
  isImage?: boolean,
  file_from?: string,
  profile_id?: string,
  submit_id?: string,
  not_submited_user_id?: number,
  take_by?: 'direct' | 'upload'
): Promise<UploadResponse> => {
  const formData = new FormData();
  const blob = typeof file === 'string' ? b64toBlob(file) : file;
  formData.append('uploads', blob);

  const config = {
    headers: {
      'content-type': 'multipart/form-data',
    },
  };
  const searParams: any = {
    type: isImage ? 'image' : 'unknown',
    phone,
    file_from,
    profile_id,
    pap_submitted_application_id: submit_id,
    pap_user_account_id: not_submited_user_id,
    take_by,
  };
  const parseFilter: any = Object.fromEntries(
    Object.entries(searParams).filter(([, v]) => !!v)
  );
  if (
    parseFilter.pap_submitted_application_id === 'undefined' ||
    !parseFilter.pap_submitted_application_id
  )
    delete parseFilter.pap_submitted_application_id;
  if (
    parseFilter.pap_user_account_id === 'undefined' ||
    !parseFilter.pap_user_account_id
  ) {
    delete parseFilter.pap_user_account_id;
  }
  if (parseFilter.profile_id === 'undefined' || !parseFilter.profile_id) {
    delete parseFilter.profile_id;
  }

  if (parseFilter.take_by === 'undefined' || !parseFilter.take_by) {
    delete parseFilter.take_by;
  }

  const query = new URLSearchParams(parseFilter).toString();

  return request.post<UploadResponse>(
    `${API.UPLOAD}?${query}`,
    formData,
    config
  );
};

export const uploadOCR = (file: any): Promise<OCRResponse> => {
  const formData = new FormData();
  const blob = typeof file === 'string' ? b64toBlob(file) : file;

  formData.append('image', blob);

  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };

  return request.post<OCRResponse>(API.UPLOAD_OCR, formData, config);
};

export function checkImage(url: string) {
  const ext = getLastElement(url?.split('.'))?.toLocaleLowerCase() || '';

  if (ext.length >= 8) return true;

  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
}

export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });

export const defineFileFromType = (type: string) => {
  switch (type) {
    case 'JOB_AND_INCOME':
      return 'income_document';
    case 'LIVING_ADDRESS':
      return 'residence';
    case 'ELECTRIC_BILL':
      return 'electric_bill';
    case 'OTHER_IMAGE':
      return 'other_documents';
    case 'UPLOAD_PRESCRIPTION':
      return 'medical_indication';
    case 'FRONT_FACE':
      return 'id_card_front';
    case 'BACK_FACE':
      return 'id_card_back';
    case 'PORT_TRAIT':
      return 'portrait';
    default:
      return 'unknown';
  }
};
