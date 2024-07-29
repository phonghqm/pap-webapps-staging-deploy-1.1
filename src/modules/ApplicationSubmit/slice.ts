import {
  ActionReducerMapBuilder,
  PayloadAction,
  createSlice,
} from "@reduxjs/toolkit";
import { AddProfile, DoneData, ImageResponse, ProfileForm } from "./type";
import { OWNER_RELATIVE, STATUS_PROFILE } from "common/constants";
import { decodeText, getProfilesDataFromResponse } from "utils/helpers";
import {
  wrapCreateAsyncThunk,
  wrapCreateAsyncThunkNoPayload,
} from "utils/thunks";
import { AGREE_PAYMENT } from "common/data";
import { SubmitApplicationProfile } from "modules/Auth/type";
import confirmApis from "modules/Result/api";
import apis from "./api";
import authApi from "modules/Auth/api";
import { updateToken } from "modules/Auth/slice";
import {
  IS_SUBMIT_APPLICATION,
  getToken,
  localStorageService,
  setToken,
} from "utils/localStorage";

interface SubmitApplicationState {
  data: ProfileForm[];
  coordination: [number, number] | null;
  done?: DoneData;
  showPopupResult?: "submit" | "update";
  profilePage: boolean;
  submitApplications: SubmitApplicationProfile[];
  reSubmit: boolean;
  canReSubmit: boolean;
  pcCode?: string;
  hospital?: string;
  confirmResult: {
    loading: boolean;
    error: ErrorRedux;
  };
  getApplicationData: {
    loading: boolean;
    error: ErrorRedux;
  };
  submitOrUpdate: {
    loading: boolean;
    error: ErrorRedux;
  };
  removedImageIds: string[];
}

const submitApplicationInitialState: SubmitApplicationState = {
  data: [],
  coordination: null,
  profilePage: false,
  submitApplications: [],
  reSubmit: false,
  canReSubmit: false,
  confirmResult: {
    loading: false,
    error: null,
  },
  getApplicationData: { loading: false, error: null },
  submitOrUpdate: { loading: false, error: null },
  removedImageIds: [],
};

function resetProfilesReducer(state: SubmitApplicationState) {
  state.data = [];
  state.profilePage = false;
}

function clearProfileReducer(state: SubmitApplicationState) {
  state.data = [];
  state.coordination = [0, 0];
  state.profilePage = false;
  state.done = undefined;
  state.reSubmit = false;
  state.canReSubmit = false;
  state.hospital = undefined;
}

function updatePcCodeReducer(
  state: SubmitApplicationState,
  action: PayloadAction<string>
) {
  state.pcCode = action.payload;
}

function updateHospitalReducer(
  state: SubmitApplicationState,
  action: PayloadAction<string>
) {
  state.hospital = action.payload;
}

function updateReSubmitReducer(
  state: SubmitApplicationState,
  action: PayloadAction<boolean>
) {
  state.reSubmit = action.payload;
}

function updateShowPopUpResultReducer(
  state: SubmitApplicationState,
  action: PayloadAction<"submit" | "update" | undefined>
) {
  state.reSubmit = false;
  state.showPopupResult = action.payload;
}

function addProfileReducer(
  state: SubmitApplicationState,
  action: PayloadAction<AddProfile>
) {
  const initProfile = {
    index: action.payload.index,
    patient_relationship: action.payload.patient_relationship,
    accept_payment_status:
      action.payload.is_present ||
      action.payload.patient_relationship === OWNER_RELATIVE
        ? AGREE_PAYMENT
        : undefined,
    is_new: true,
    is_saved: false,
    phone: action.payload.phone,
    hospital: action.payload.hospital,
    dob: null,
    is_present: action.payload.is_present,
    papers: [],
    id_card_front: "",
    id_card_back: "",
    ekyc_info: {
      portrait: "",
      id_card_kind: "",
      extra_full_name: "",
      extra_dob: "",
      extra_idcard_number: "",
      extra_gender: "",
      extra_pr_address: "",
      extra_nationality: "",
      extra_expired_date: "",
    },
    address_info: {
      resident: {
        papers: [],
      },
    },
    pc_code: action.payload.pc_code,
  } as any;

  state.data.push(initProfile);
}

function updateProfileReducer(
  state: SubmitApplicationState,
  action: PayloadAction<{ profile: Partial<ProfileForm>; index: number }>
) {
  const current = state.data[action.payload.index - 1];
  if (!current) {
    state.data.push({
      ...action.payload.profile,
      pc_code: state.pcCode,
      index: action.payload.index,
    } as ProfileForm);
  } else {
    state.data[action.payload.index - 1] = {
      ...current,
      ...action.payload.profile,
      address_info: {
        ...current.address_info,
        resident: {
          ...current.address_info?.resident,
          ...action.payload.profile?.address_info?.resident,
        },
        ...action.payload.profile?.address_info,
      },
      ekyc_info: {
        ...current.ekyc_info,
        ...action.payload.profile?.ekyc_info,
      },
    };
  }
}

function removeProfileReducer(
  state: SubmitApplicationState,
  action: PayloadAction<number>
) {
  const data = state.data[action.payload - 1];
  if (!data) return;
  if (data.is_new) {
    state.data.splice(action.payload - 1, 1);
  } else {
    state.data[action.payload - 1].is_deleted = true;
  }
}

function updateCoordinationReducer(
  state: SubmitApplicationState,
  action: PayloadAction<[number, number]>
) {
  state.coordination = action.payload;
}

function updateLivenessReducer(
  state: SubmitApplicationState,
  action: PayloadAction<ImageResponse>
) {
  state.data[0].ekyc_info.portrait = action.payload;
}

function updateDoneDataReducer(
  state: SubmitApplicationState,
  action: PayloadAction<DoneData>
) {
  state.done = { ...state.done, ...action.payload };
}

function updateSubmitApplicationProfileReducer(
  state: SubmitApplicationState,
  action: PayloadAction<{
    profiles: SubmitApplicationProfile[];
    canReSubmit: boolean;
    pc_code?: string;
  }>
) {
  const profiles = action.payload.profiles;
  const activeProfile =
    profiles.find((item) => item.active_status === "ACTIVE") || profiles[0];
  state.done = activeProfile;
  state.pcCode = activeProfile?.pc_code || action.payload.pc_code;
  state.submitApplications = activeProfile ? [activeProfile] : [];
  state.canReSubmit = action.payload.canReSubmit;
}

function loadProfilesFromCacheReducer(
  state: SubmitApplicationState,
  action: PayloadAction<(string | null)[]>
) {
  const data = action.payload
    .filter((d) => d !== null)
    .map((hexProfile) => {
      const profile = JSON.parse(decodeText(hexProfile as string));
      return {
        ...profile,
      } as ProfileForm;
    })
    .sort(
      (a, b) =>
        (b.patient_relationship === OWNER_RELATIVE ? 1 : 0) -
        (a.patient_relationship === OWNER_RELATIVE ? 1 : 0)
    )
    .sort((a, b) => (b.is_present ? 1 : 0) - (a.is_present ? 1 : 0));

  const pc_code = data.reduce((prev, curr) => prev || curr.pc_code, "");

  state.data = data;
  state.pcCode = pc_code;
}

function updateProfilePageReducer(
  state: SubmitApplicationState,
  action: PayloadAction<boolean>
) {
  state.profilePage = action.payload;
}

function updateRemovedImageReducer(
  state: SubmitApplicationState,
  action: PayloadAction<string>
) {
  state.removedImageIds.push(action.payload);
}

function clearRemovedImageReducer(state: SubmitApplicationState) {
  state.removedImageIds = [];
}

function updateSubmitOrUpdateErrorReducer(
  state: SubmitApplicationState,
  action: PayloadAction<ErrorRedux>
) {
  state.submitOrUpdate.error = action.payload;
}
/**************** Async Thunk Actions ************************/
export const asyncApproveResult = wrapCreateAsyncThunk(
  "submit/approveResult",
  confirmApis.confirmResult
);

export const asyncRejectResult = wrapCreateAsyncThunk(
  "submit/rejectResult",
  confirmApis.rejectResult,
  (res, dispatch) => {
    dispatch(
      updateSubmitApplicationProfile({
        profiles: res.data.profiles,
        canReSubmit: res.data.re_submit,
      })
    );
  }
);

export const asyncGetApplicationData = wrapCreateAsyncThunkNoPayload(
  "submit/getApplicationData",
  authApi.getProfile,
  (res, dispatch) => {
    const profileStatus = res.data.profiles[0].status;
    const isNew = profileStatus === STATUS_PROFILE.CREATING;
    dispatch(
      updateToken({
        token: getToken() || "",
        phone: res.data.profiles[0].phone,
        stringee_token: res.data.stringee_token,
        isNew,
      })
    );
    dispatch(asyncGetProfiles());
  }
);

export const asyncGetProfiles = wrapCreateAsyncThunkNoPayload(
  "submit/getProfiles",
  apis.getProfiles
);

export const asyncSubmitApplication = wrapCreateAsyncThunk(
  "submit/submitApplication",
  apis.submit,
  (res, dispatch) => {
    dispatch(
      updateToken({
        token: res.data?.token || "",
        phone: res.data.phone,
        stringee_token: res.data?.stringee_token || "",
      })
    );
    dispatch(updateShowPopUpResult("submit"));
    dispatch(asyncGetProfiles());
  }
);

export const asyncUpdateApplication = wrapCreateAsyncThunk(
  "submit/updateApplication",
  apis.updateSubmit,
  (_, dispatch) => {
    dispatch(updateShowPopUpResult("update"));
    dispatch(asyncGetApplicationData());
  }
);

export const asyncSaveApplication = wrapCreateAsyncThunk(
  "submit/saveApplication",
  apis.saveApplication,
  (_, dispatch) => {
    dispatch(asyncGetApplicationData());
  }
);
export const asyncSaveCreatingProfile = wrapCreateAsyncThunk(
  "submit/saveCreatingProfile",
  apis.saveCreatingProfile,
  (res, dispatch) => {
    setToken(res.data.token);
    dispatch(
      updateToken({
        token: res.data?.token || "",
        phone: res.data.phone,
        stringee_token: res.data?.stringee_token || "",
        isNew: true,
      })
    );
    dispatch(asyncGetApplicationData());
  }
);

export const asyncLogUserUpdateAction = wrapCreateAsyncThunk(
  "submit/logUserUpdateAction",
  apis.logUserUpdateFileAction
);

export const trackLog = wrapCreateAsyncThunk("submit/trackLog", apis.debug);

export const asyncRequestMyInfo = wrapCreateAsyncThunk(
  "submit/requestMyInfo",
  apis.requestMyInfo
);
export const asyncPollMyInfoData = wrapCreateAsyncThunk(
  "submit/pollMyInfoData",
  apis.pollMyInfoData
);
const submitApplication = createSlice({
  name: "submit",
  initialState: submitApplicationInitialState,
  reducers: {
    addProfileReducer,
    updateProfileReducer,
    removeProfileReducer,
    updateCoordinationReducer,
    updateLivenessReducer,
    updateDoneDataReducer,
    // loadProfilesReducer,
    resetProfilesReducer,
    clearProfileReducer,
    updateShowPopUpResultReducer,
    loadProfilesFromCacheReducer,
    updateProfilePageReducer,
    updateSubmitApplicationProfileReducer,
    updateReSubmitReducer,
    updateHospitalReducer,
    updatePcCodeReducer,
    updateRemovedImageReducer,
    clearRemovedImageReducer,
    updateSubmitOrUpdateErrorReducer,
  },
  extraReducers: (builders: ActionReducerMapBuilder<SubmitApplicationState>) =>
    builders
      .addCase(asyncApproveResult.pending, (state) => {
        state.confirmResult.loading = true;
        state.confirmResult.error = null;
      })
      .addCase(asyncApproveResult.fulfilled, (state) => {
        state.confirmResult.loading = false;
      })
      .addCase(asyncApproveResult.rejected, (state, action) => {
        state.confirmResult.loading = false;
        state.confirmResult.error = (action.payload || null) as ErrorRedux;
      })
      .addCase(asyncRejectResult.pending, (state) => {
        state.confirmResult.loading = true;
        state.confirmResult.error = null;
      })
      .addCase(asyncRejectResult.fulfilled, (state) => {
        state.confirmResult.loading = false;
      })
      .addCase(asyncRejectResult.rejected, (state, action) => {
        state.confirmResult.loading = false;
        state.confirmResult.error = (action.payload || null) as ErrorRedux;
      })
      .addCase(asyncGetProfiles.fulfilled, (state, action) => {
        const { profiles, coordination } = getProfilesDataFromResponse(
          action.payload.data
        );

        state.data = profiles;
        state.coordination = coordination;
      })
      .addCase(asyncGetApplicationData.pending, (state) => {
        state.getApplicationData.loading = true;
      })
      .addCase(asyncGetApplicationData.fulfilled, (state, action) => {
        const profiles = action.payload.data.profiles;
        const activeProfile =
          profiles.find((item) => item.active_status === "ACTIVE") ||
          profiles[0];
        state.done = activeProfile;
        state.pcCode = activeProfile.pc_code;
        state.submitApplications = [activeProfile];
        state.canReSubmit = action.payload.data.re_submit;
        state.getApplicationData.loading = false;
        state.getApplicationData.error = null;
      })
      .addCase(asyncGetApplicationData.rejected, (state, action) => {
        state.getApplicationData.loading = false;
        state.getApplicationData.error = (action.payload || null) as ErrorRedux;
      })
      .addCase(asyncSubmitApplication.pending, (state) => {
        state.submitOrUpdate.loading = true;
      })
      .addCase(asyncSubmitApplication.fulfilled, (state, action) => {
        state.submitOrUpdate.loading = false;
        state.submitOrUpdate.error = null;
        state.done = action.payload.data;
        state.pcCode = action.payload.data.pc_code;
        state.submitApplications = [action.payload.data];
        state.canReSubmit = false;
        localStorageService.set(IS_SUBMIT_APPLICATION, true);
      })
      .addCase(asyncSubmitApplication.rejected, (state, action) => {
        state.submitOrUpdate.loading = false;
        state.submitOrUpdate.error = (action.payload || null) as ErrorRedux;
      })
      .addCase(asyncUpdateApplication.pending, (state) => {
        state.submitOrUpdate.loading = true;
      })
      .addCase(asyncUpdateApplication.fulfilled, (state, action) => {
        state.submitOrUpdate.loading = false;
        state.submitOrUpdate.error = null;
        const { profiles, coordination } = getProfilesDataFromResponse(
          action.payload.data
        );

        state.data = profiles;
        state.coordination = coordination;
      })
      .addCase(asyncUpdateApplication.rejected, (state, action) => {
        state.submitOrUpdate.loading = false;
        state.submitOrUpdate.error = (action.payload || null) as ErrorRedux;
      })
      .addCase(asyncSaveApplication.fulfilled, (state, action) => {
        const { profiles, coordination } = getProfilesDataFromResponse(
          action.payload.data
        );
        state.data = profiles;
        state.coordination = coordination;
      })
      .addCase(asyncSaveCreatingProfile.fulfilled, () => {
        localStorageService.set("isSubmitApplication", false);
      })
      .addCase(asyncLogUserUpdateAction.fulfilled, () => {}),
});

export const {
  addProfileReducer: addProfile,
  updateProfileReducer: updateProfile,
  removeProfileReducer: removeProfile,
  updateCoordinationReducer: updateCoordination,
  updateLivenessReducer: updateLiveness,
  updateDoneDataReducer: updateDoneData,
  // loadProfilesReducer: loadProfiles,
  resetProfilesReducer: resetProfiles,
  clearProfileReducer: clearProfile,
  updateShowPopUpResultReducer: updateShowPopUpResult,
  loadProfilesFromCacheReducer: loadProfilesFromCache,
  updateProfilePageReducer: updateProfilePage,
  updateSubmitApplicationProfileReducer: updateSubmitApplicationProfile,
  updateReSubmitReducer: updateReSubmit,
  updateHospitalReducer: updateHospital,
  updatePcCodeReducer: updatePcCode,
  updateRemovedImageReducer: updateRemovedImage,
  clearRemovedImageReducer: clearRemovedImage,
  updateSubmitOrUpdateErrorReducer: updateSubmitOrUpdateError,
} = submitApplication.actions;

export default submitApplication.reducer;
