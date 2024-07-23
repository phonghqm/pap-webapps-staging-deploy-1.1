import { AddAdress } from "./type.d";
import {
  ActionReducerMapBuilder,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import {
  wrapCreateAsyncThunk,
  wrapCreateAsyncThunkNoPayload,
} from 'utils/thunks';
import { ConfigState, NameConfig, OptionsType } from './type';
import apis from './api';

const configInitialState: ConfigState = {
  hospitals: {
    loading: false,
    is_loaded: false,
    data: [],
    error: null,
  },
  schools: {
    loading: false,
    is_loaded: false,
    data: [],
    list: [],
    error: null,
  },
  job: {
    loading: false,
    is_loaded: false,
    data: [],
    error: null,
  },
  job_title: {
    loading: false,
    is_loaded: false,
    data: [],
    error: null,
  },
  house_type: {
    loading: false,
    is_loaded: false,
    data: [],
    error: null,
  },
  loan: {
    loading: false,
    is_loaded: false,
    data: [],
    error: null,
  },
  phone_brand: {
    loading: false,
    is_loaded: false,
    data: [],
    error: null,
  },
  cities: {
    loading: false,
    is_loaded: false,
    data: [],
    error: null,
  },
  districts: {
    loading: false,
    data: [],
    error: null,
  },
  wards: {
    loading: false,
    data: [],
    error: null,
  },
  new_address: {
    is_have_new: false,
    province: null,
    city: null,
    ward: null,
  },
};

function normalizeHouseType(data: OptionsType[]): OptionsType[] {
  const existed_answer: string[] = [];
  const normalized: OptionsType[] = [];
  data.forEach((item) => {
    if (!existed_answer.includes(item.answer_alias)) {
      existed_answer.push(item.answer_alias);
      normalized.push({
        qs_cond_key: item.qs_cond_key.replace(/(RENT_)|(OWN_)/, ''),
        answer_alias: item.answer_alias,
      });
    }
  });
  return normalized;
}

export function getListSchool(school_name: string): Promise<any> {

  return apis.getSchoolsWithParams(
    school_name ? { filters: JSON.stringify({ name: school_name }) } : ''
  );
}

export const asyncLoadHospital = wrapCreateAsyncThunkNoPayload(
  'config/hospitals',
  apis.getHospitals
);

export const asyncLoadSchool = wrapCreateAsyncThunkNoPayload(
  'config/schools',
  apis.getSchools
);

export const asyncLoadCommonConfig = wrapCreateAsyncThunk(
  'config/common',
  apis.getConfig
);

export const asyncAddAddress = wrapCreateAsyncThunk(
  "config/AddAdress",
  apis.addAddress
);

export const asyncLoadCites = wrapCreateAsyncThunkNoPayload(
  'config/cities',
  apis.getAllCities
);

export const asyncLoadDistrictsByCityId = wrapCreateAsyncThunk(
  'config/districts',
  apis.getDistrictsByCityId
);

export const asyncLoadWardsByDistrictId = wrapCreateAsyncThunk(
  'config/wards',
  apis.getWardsByDistrictId
);
function updateNewAddressReducer(
  state: ConfigState,
  action: PayloadAction<any>
) {
  const { is_have_new, province, city, ward } = action.payload;
  state.new_address.is_have_new = is_have_new;
  if (province) state.new_address.province = province;
  if (city) state.new_address.city = city;
  if (ward) state.new_address.ward = ward;
}

const config = createSlice({
  name: 'config',
  initialState: configInitialState,
  reducers: {
    updateNewAddressReducer,
  },
  extraReducers: (builders: ActionReducerMapBuilder<ConfigState>) =>
    builders
      .addCase(asyncLoadHospital.pending, (state) => {
        state.hospitals.loading = true;
      })
      .addCase(asyncLoadHospital.fulfilled, (state, action) => {
        state.hospitals.loading = false;
        state.hospitals.is_loaded = true;
        state.hospitals.data = action.payload.data;
      })
      .addCase(asyncLoadHospital.rejected, (state, action) => {
        state.hospitals.loading = false;
        state.hospitals.error = (action.payload || null) as ErrorRedux;
      })
      .addCase(asyncLoadSchool.pending, (state) => {
        state.schools.loading = true;
      })
      .addCase(asyncLoadSchool.fulfilled, (state, action) => {
        state.schools.loading = false;
        state.schools.is_loaded = true;
        state.schools.data = action.payload.data;
        state.schools.list = action.payload.data
          .map((item) => item.name)
          .filter((item, i, ar) => ar.indexOf(item) === i);
      })
      .addCase(asyncLoadSchool.rejected, (state, action) => {
        state.schools.loading = false;
        state.schools.error = (action.payload || null) as ErrorRedux;
      })
      .addCase(asyncLoadCommonConfig.pending, (state, action) => {
        state[action.meta.arg as NameConfig].loading = true;
      })
      .addCase(asyncLoadCommonConfig.fulfilled, (state, action) => {
        state[action.meta.arg as NameConfig].loading = false;
        state[action.meta.arg as NameConfig].is_loaded = true;
        if (action.meta.arg === 'house_type') {
          state.house_type.data = normalizeHouseType(action.payload.data);
        } else state[action.meta.arg as NameConfig].data = action.payload.data;
      })
      .addCase(asyncLoadCommonConfig.rejected, (state, action) => {
        state[action.meta.arg as NameConfig].loading = false;
        state[action.meta.arg as NameConfig].error = (action.payload ||
          null) as ErrorRedux;
      })
      .addCase(asyncLoadCites.pending, (state) => {
        state.cities.loading = true;
        state.cities.error = null;
      })
      .addCase(asyncLoadCites.fulfilled, (state, action) => {
        state.cities.is_loaded = true;
        state.cities.loading = false;
        state.cities.data = action.payload.data
          .sort((a, b) => a.name.localeCompare(b.name))
          .sort((a, b) => a.priority - b.priority);
      })
      .addCase(asyncLoadCites.rejected, (state, action) => {
        state.cities.loading = false;
        state.cities.error = (action.payload || null) as ErrorRedux;
      })
      .addCase(asyncLoadDistrictsByCityId.pending, (state) => {
        state.districts.loading = true;
        state.districts.error = null;
      })
      .addCase(asyncLoadDistrictsByCityId.fulfilled, (state, action) => {
        state.districts.loading = false;
        state.districts.data = action.payload.data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
      })
      .addCase(asyncLoadDistrictsByCityId.rejected, (state, action) => {
        state.districts.loading = false;
        state.districts.error = (action.payload || null) as ErrorRedux;
      })
      .addCase(asyncLoadWardsByDistrictId.pending, (state) => {
        state.wards.loading = true;
        state.wards.error = null;
      })
      .addCase(asyncLoadWardsByDistrictId.fulfilled, (state, action) => {
        state.wards.loading = false;
        state.wards.data = action.payload.data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
      })
      .addCase(asyncLoadWardsByDistrictId.rejected, (state, action) => {
        state.wards.loading = false;
        state.wards.error = (action.payload || null) as ErrorRedux;
      }),
});

export const { updateNewAddressReducer: updateNewAddress } = config.actions;

export default config.reducer;
