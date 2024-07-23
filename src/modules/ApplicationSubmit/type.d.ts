import { IMAGE_STATUS } from "./../../common/constants";
import { SubmitApplicationProfile } from "modules/Auth/type";

export type ImageResponse = {
  id: number;
  url: string;
  status: IMAGE_STATUS.ACTIVE | IMAGE_STATUS.REMOVE;
  thumbnail_url?: string | null;
};

export type EkycInfo = {
  portrait: ImageResponse | string;
  id_card_kind: string;
  extra_full_name: string;
  extra_dob: string;
  extra_idcard_number: string;
  extra_gender: string;
  extra_pr_address: string;
  extra_nationality: string;
  extra_expired_date: string;
  portrait_document_imgs: ImageResponse[];
};

export type AddressInfo = {
  kind: string;
  type: string;
  address_coordination: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  is_living: boolean;
  is_owner: boolean;
  papers?: string;
  residence_document_imgs?: string | ImageResponse[] | null;
};

type Profile = {
  id?: number;
  patient_relationship: string;
  is_deleted?: boolean;
  accept_payment_status?: string | null;
  phone: string;
  email?: string;
  coordination: string | null;
  full_name: string;
  dob: string;
  id_card_number: string;
  gender: string;
  is_present: boolean;
  papers: string;
  id_card_front: string | ImageResponse;
  id_card_back: string | ImageResponse;
  ekyc_info: Partial<EkycInfo>;
  income: number;
  job: string;
  job_title?: string;
  job_company_name: string;
  job_company_address: string;
  job_description: string;
  private_school: number | null;
  electric_bill: number;
  phone_brand: string;
  address_info: Partial<AddressInfo>[];
  private_insurance: number | null;
  insurance_description: string;
  loan: string;
  car_owner: string;
  income_document_imgs: string | ImageResponse[] | null;
  electric_bill_document_imgs: string | ImageResponse[] | null;
  pc_code?: string;
  prescription?: string;
  medical_indication_document_imgs?: string | ImageResponse[] | null;
  other_document_imgs?: string | ImageResponse[] | null;
  id_card_back_document_imgs: string | ImageResponse[];
  id_card_front_document_imgs: string | ImageResponse[];
  portrait_document_imgs?: string;
};

export type ProfileForm = {
  id?: number;
  index: number;
  patient_relationship: string | null;
  accept_payment_status?: string | null;
  is_saved: boolean;
  is_deleted?: boolean;
  is_new?: boolean;
  hospital?: string | null;
  prescription?: string[];
  phone: string;
  email?: string;
  full_name: string;
  dob: string;
  id_card_number: string;
  gender: string;
  is_present: boolean;
  papers: string[];
  id_card_front: string | ImageResponse;
  id_card_back: string | ImageResponse;
  ekyc_info: Partial<EkycInfo>;
  income: number | null;
  job: string;
  job_title?: string;
  job_company_name: string;
  job_company_address: string;
  job_description: string;
  private_school: number;
  school_name: string | null;
  electric_bill: number | null;
  phone_brand: string;
  hospital_name: string | null;
  address_info: {
    resident: {
      type?: string;
      address_coordination?: string;
      street?: string;
      ward?: string;
      district?: string;
      city?: string;
      is_living?: boolean | null;
      is_owner?: boolean | null;
      residence_document_imgs?: ImageResponse[] | string | null;
    };
    termporary?: {
      type: string;
      address_coordination: string;
      street: string;
      ward: string;
      district: string;
      city: string;
      is_living?: boolean | null;
      is_owner?: boolean | null;
      residence_document_imgs?: ImageResponse[] | string | null;
    };
  };
  private_insurance: number;
  insurance_description: string;
  loan: string;
  car_owner: string;
  income_document_imgs: ImageResponse[] | null;
  electric_bill_document_imgs: ImageResponse[] | null;
  school_name: string;
  school_level: string;
  electric_users: number;
  pc_code: string;
  medical_indication_document_imgs?: ImageResponse[] | null;
  other_document_imgs?: ImageResponse[] | null;
  pap_submitted_application_id?: number;
  id_card_front_document_imgs: ImageResponse[];
  id_card_back_document_imgs: ImageResponse[];
};

export type AddProfile = {
  index: number;
  patient_relationship: string | null;
  phone?: string;
  hospital?: string;
  is_present: boolean;
  pc_code: string;
};

export type DoneData = SubmitApplicationProfile;

export type SubmitResponse = BaseResponse & {
  data: DoneData;
};

export type UpdateSubmitResponse = BaseResponse & {
  data: ProfileResponse[];
};

export type ListProfilesResponse = BaseResponse & {
  data: ProfileResponse[];
};

type LivenessResponse = {
  id: number;
  portrait: ImageResponse | string;
  id_card_front: string;
  id_card_back: string;
  id_card_kind: string;
  id_card_front_document_imgs: ImageResponse[];
  id_card_back_document_imgs: ImageResponse[];
};

type WorkingStateResponse = {
  id: number;
  income: number;
  job: string;
  job_title: string;
  job_company_name: string;
  job_company_address: string;
  job_description: string;
  papers: string;
  income_document_imgs: ImageResponse[];
};

type AddressResponse = {
  id: number;
  type: string;
  kind: string;
  address_coordination: string;
  city: string;
  district: string;
  ward: string;
  street: string;
  papers: string;
  address_hint: null;
  is_living: boolean;
  is_owner: boolean;
};

type LivingBillResponse = {
  id: number;
  electric_bill: number;
  electric_users: number;
  phone_brand: string;
  private_school: number;
  school_name: string;
  school_level: string;
  private_hospital: string;
  hospital_name: string;
  loan: string;
  has_insurance: number;
  insurance_description: string;
  car_owner: string;
  papers: string;
  electric_bill_document_imgs: ImageResponse[];
};

type ProfileResponse = {
  id: number;
  full_name: string;
  phone: string;
  dob: string;
  gender: string;
  id_card_number: string;
  agree_term: boolean;
  papers: string;
  pap_relationship: string;
  pap_submitted_application_id: number;
  is_present: boolean;
  coordination: string;
  created_at: string;
  updated_at: string;
  liveness: LivenessResponse;
  working_state: WorkingStateResponse;
  addresses: AddressResponse[];
  living_bill: LivingBillResponse;
  patient_medical?: {
    hospital: string;
    prescription: string;
    medical_indication_document_imgs: ImageResponse[];
  };
  accept_payment_status?: string | null;
};

type DeviceInfo = {
  name: string;
  product?: string;
  os?: string;
  description?: string;
};

type BrowserInfo = {
  name: string;
  version: string;
};

export type OperatingSystem = {
  device_info: DeviceInfo;
  browser_info: BrowserInfo;
};

export type UserUpdateFileActionLogRequest = {
  pap_profile_id: number | null;
  pap_submitted_application_id: number;
  url: string;
  action: "remove" | "upload";
  file_from: string;
  pap_user_account_id: number | undefined;
  pap_image_id?: number;
};

export type SubmitUpdateApplicationRequest = {
  profiles: Profile[];
  os_info: OperatingSystem;
  removed_image_ids: string[];
  react_app_version?: string;
};
