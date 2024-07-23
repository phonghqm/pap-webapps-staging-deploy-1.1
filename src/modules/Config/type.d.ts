import { District } from "./type.d";
export type Hospital = {
  name: string;
};

export type SchoolLevel =
  | "PURELY_ES"
  | "JHS_SHS"
  | "ES_JHS_K_TO_10"
  | "ALL_K_TO_12"
  | "PURELY_JHS"
  | "PURELY_SHS"

type SchoolLevelOptions = {
  label: string;
  value: SchoolLevel;
};

export type School = {
  name: string;
  level: SchoolLevel;
};

export type OptionsType = {
  answer_alias: string;
  qs_cond_key: string;
};

type CommonConfig = {
  loading: boolean;
  is_loaded: boolean;
  data: OptionsType[];
  error: ErrorRedux;
};

export type NameConfig =
  | "job"
  | "job_title"
  | "house_type"
  | "phone_brand"
  | "loan";
export type NewAddress = {
  is_have_new: boolean;
  province: null | string;
  city: null | string;
  ward: null | string;
};
export interface ConfigState {
  hospitals: {
    loading: boolean;
    is_loaded: boolean;
    data: Hospital[];
    error: ErrorRedux;
  };
  schools: {
    loading: boolean;
    is_loaded: boolean;
    data: School[];
    list: string[];
    error: ErrorRedux;
  };
  job: CommonConfig;
  job_title: CommonConfig;
  house_type: CommonConfig;
  phone_brand: CommonConfig;
  loan: CommonConfig;
  cities: {
    loading: boolean;
    is_loaded: boolean;
    data: City[];
    error: ErrorRedux;
  };
  districts: {
    loading: boolean;
    data: District[];
    error: ErrorRedux;
  };
  wards: {
    loading: boolean;
    data: Ward[];
    error: ErrorRedux;
  };
  new_address: NewAddress;
}

export type HospitalsResponse = BaseResponse & {
  data: Hospital[];
};

export type SchoolsResponse = BaseResponse & {
  data: School[];
};

export type CommonConfigResponse = BaseResponse & {
  data: OptionsType[];
};

export type City = {
  id: number;
  name: string;
  region_id: number;
  priority: number;
};

export type District = {
  id: number;
  name: string;
  province_id: number;
};

export type Ward = {
  id: number;
  name: string;
  district_id: number;
};

type CitiesResponse = BaseResponse & {
  data: City[];
};

type DistrictsResponse = BaseResponse & {
  data: District[];
};

type WardsResponse = BaseResponse & {
  data: Ward[];
};

export type AddAdress = {
  province?: string;
  city?: string;
  ward?: string;
};
