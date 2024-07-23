import API from 'common/API';
import request from 'utils/request';
import {
  CommonConfigResponse,
  HospitalsResponse,
  SchoolsResponse,
  CitiesResponse,
  DistrictsResponse,
  WardsResponse,
  AddAdress,
} from "./type";
import { add } from "lodash";

const apis = {
  getHospitals: () => request.get<HospitalsResponse>(API.GET_HOSPITALS),

  getSchools: () => request.get<SchoolsResponse>(API.GET_SCHOOLS),

  getSchoolsWithParams: (params: any) =>
    request<SchoolsResponse>({
      url: API.GET_SCHOOLS,
      method: 'get',
      params,
    }),

  getConfig: (config: string) =>
    request.get<CommonConfigResponse>(API.GET_COMMON_OPTIONS_CONFIG(config)),

  getAllCities: () => request.get<CitiesResponse>(API.ALL_CITY),
  getDistrictsByCityId: (cityId: number) =>
    request.get<DistrictsResponse>(API.ALL_DISTRICT(cityId)),
  getWardsByDistrictId: (districtId: number) =>
    request.get<WardsResponse>(API.ALL_WARD(districtId)),
  addAddress: (data: AddAdress) => request.post(API.ADD_ADDRESS, data),
};

export default apis;
