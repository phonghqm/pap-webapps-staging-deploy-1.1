import {
  ActionReducerMapBuilder,
  PayloadAction,
  createSlice,
} from "@reduxjs/toolkit";
import {
  IS_SUBMIT_APPLICATION,
  NON_SUBMIT_PROFILE_DATA,
  NOT_SUBMIT_APPLICATION_TOKEN,
  localStorageService,
  removeToken,
  setPhoneTrack,
  setToken,
} from "utils/localStorage";
import apis from "./api";
import {
  wrapCreateAsyncThunk,
  wrapCreateAsyncThunkNoPayload,
} from "utils/thunks";
import {
  asyncGetProfiles,
  clearProfile,
  updateHospital,
  updatePcCode,
  updateSubmitApplicationProfile,
} from "modules/ApplicationSubmit/slice";

interface AuthState {
  pap_user_account_id?: number;
  phone: string;
  token?: string;
  new: boolean;
  callToken?: string;
  // using for login, get profile
  profileAction: {
    loading: boolean;
    error: ErrorRedux;
  };
  // using for otp actions
  otp: {
    loading: boolean;
    phone: string | null;
    code: string | null;
    error: ErrorRedux;
    // after confirming
    is_confimed: boolean;
    hospitals: string | null;
  };
  presentUserChecking: {
    loading: boolean;
    phone: string | null;
    is_yes: boolean;
    error: ErrorRedux;
  };
  // using for sign up actions
  signUp: {
    loading: boolean;
    error: ErrorRedux;
    phone: string | null;
    pc_code: string | null;
  };
  isSubmitApplication?: boolean;
  notSubmitProfileToken?: string;
  isNeedCache?: boolean;
}

const authInitialState: AuthState = {
  phone: "",
  new: true,
  profileAction: {
    loading: false,
    error: null,
  },
  otp: {
    loading: false,
    phone: null,
    code: null,
    error: null,
    is_confimed: false,
    hospitals: null,
  },
  presentUserChecking: {
    loading: false,
    phone: null,
    is_yes: false,
    error: null,
  },
  signUp: {
    loading: false,
    error: null,
    phone: null,
    pc_code: null,
  },
};

/****************** Async Thunk Actions ******************/
export const asyncGenerateOtp = wrapCreateAsyncThunk(
  "auth/generateOtp",
  apis.generateOtp
);

export const asyncConfirmOtp = wrapCreateAsyncThunk(
  "auth/confirmOtp",
  apis.confirmOtpSignUp,
  (res, dispatch) => {
    dispatch(updatePhone(res.data.user_account));
    dispatch(clearProfile());
    dispatch(clearToken());
    dispatch(updateHospital(res.data.hospital));
    localStorageService.set(NON_SUBMIT_PROFILE_DATA, res.data.user_account);
    localStorageService.set(IS_SUBMIT_APPLICATION, false);
    if (NOT_SUBMIT_APPLICATION_TOKEN) {
      localStorageService.set(
        NOT_SUBMIT_APPLICATION_TOKEN,
        res.data.user_account_token
      );
    }
  }
);

export const asyncLogin = wrapCreateAsyncThunk(
  "auth/login",
  apis.login,
  (res, dispatch, getState) => {
    const isNeedCache = getState().auth.isNeedCache;

    //check null
    if (!Object.is(res.data.token, null)) {
      setToken(res.data.token);
    }
    dispatch(
      updateSubmitApplicationProfile({
        profiles: res.data.profiles,
        canReSubmit: res.data.re_submit,
        pc_code: res.data.pc_code,
      })
    );
    dispatch(updateHospital(res.data.hospital));
    localStorageService.set(
      IS_SUBMIT_APPLICATION,
      res.data.is_submitted_application
    );
    !res.data.is_submitted_application &&
      localStorageService.set(NON_SUBMIT_PROFILE_DATA, res.data.user_account);

    //check null
    if (!Object.is(res.data.user_account_token, null)) {
      localStorageService.set(
        NOT_SUBMIT_APPLICATION_TOKEN,
        res.data.user_account_token
      );
    }

    !isNeedCache && dispatch(asyncGetProfiles());
  }
);

export const asyncCheckPresentUser = wrapCreateAsyncThunk(
  "auth/checkPresentUser",
  apis.checkPresentUserByPhone,
  (_, dispatch, getState) =>
    dispatch(
      asyncGenerateOtp({
        phone: getState().auth.presentUserChecking.phone,
      })
    )
);

export const asyncGetProfile = wrapCreateAsyncThunkNoPayload(
  "auth/getProfile",
  apis.getProfile
);

export const asyncCheckExistingPresentUserPhoneAndPCCode = wrapCreateAsyncThunk(
  "auth/asyncCheckExistingPresentUserPhoneAndPCCode",
  apis.checkExistingPresentUserPhoneAndPCCode,
  (_, dispatch, getState) => {
    dispatch(
      updatePhone({
        phone: getState().auth.signUp.phone,
      })
    );
    dispatch(updatePcCode(getState().auth.signUp.pc_code));
  }
);

export const asyncLogOut = wrapCreateAsyncThunkNoPayload(
  "auth/logOut",
  apis.logOut
);
/**************** End Async Thunk Actions ****************/

function updatePhoneReducer(
  state: AuthState,
  action: PayloadAction<{ phone: string; id?: number }>
) {
  action.payload.phone && (state.phone = action.payload.phone);
  action.payload.id && (state.pap_user_account_id = action.payload.id);
  setPhoneTrack(action.payload.phone);
}

function clearTokenReducer(state: AuthState) {
  state.token = undefined;
  state.new = true;
  state.callToken = undefined;
}

function updateTokenReducer(
  state: AuthState,
  action: PayloadAction<{
    token: string;
    phone: string;
    stringee_token: string;
    isNew?: boolean;
  }>
) {
  setToken(action.payload.token);
  setPhoneTrack(action.payload.phone);
  state.token = action.payload.token;
  state.phone = action.payload.phone;
  state.callToken = action.payload.stringee_token;
  state.new = action.payload.isNew || false;
}

function updateNewReducer(state: AuthState, action: PayloadAction<boolean>) {
  state.new = action.payload;
}

function logoutReducer(state: AuthState) {
  removeToken();
  state.token = undefined;
  state.callToken = undefined;
  state.new = true;
  state.phone = "";
}

function updateGenOTPErrReducer(
  state: AuthState,
  action: PayloadAction<ErrorRedux>
) {
  state.otp.error = action.payload;
}

function updateIsNeedCacheReducer(
  state: AuthState,
  action: PayloadAction<boolean>
) {
  state.isNeedCache = action.payload;
}

const auth = createSlice({
  name: "auth",
  initialState: authInitialState,
  reducers: {
    updatePhoneReducer,
    updateTokenReducer,
    logoutReducer,
    clearTokenReducer,
    updateNewReducer,
    updateIsNeedCacheReducer,
    updateGenOTPErrReducer,
  },
  extraReducers: (buiders: ActionReducerMapBuilder<AuthState>) =>
    buiders
      // generate otp code
      .addCase(asyncGenerateOtp.pending, (state, action) => {
        state.otp.phone = action.meta.arg.phone;
        state.otp.loading = true;
      })
      .addCase(asyncGenerateOtp.fulfilled, (state, action) => {
        state.otp.loading = false;
        state.otp.code = action.payload.data;
        state.otp.error = null;
      })
      .addCase(asyncGenerateOtp.rejected, (state, action) => {
        state.otp.loading = false;
        state.otp.code = null;
        state.otp.error = (action.payload || null) as ErrorRedux;
      })
      // confirm otp code
      .addCase(asyncConfirmOtp.pending, (state) => {
        state.otp.loading = true;
      })
      .addCase(asyncConfirmOtp.fulfilled, (state) => {
        state.otp.loading = false;
        state.otp.is_confimed = true;
      })
      .addCase(asyncConfirmOtp.rejected, (state, action) => {
        state.otp.loading = false;
        state.otp.error = (action.payload || null) as ErrorRedux;
      })
      // login
      .addCase(asyncLogin.pending, (state, action) => {
        const loginPhone = action.meta.arg.phone;
        setPhoneTrack(loginPhone);
        state.phone = loginPhone;
        state.profileAction.loading = true;
      })
      .addCase(asyncLogin.fulfilled, (state, action) => {
        state.token = action.payload.data.token;
        state.callToken = action.payload.data.stringee_token;
        state.new = localStorageService.get(IS_SUBMIT_APPLICATION)
          ? !localStorageService.get(IS_SUBMIT_APPLICATION)
          : !localStorageService.get(IS_SUBMIT_APPLICATION);
        state.profileAction.loading = false;
        state.profileAction.error = null;
      })
      .addCase(asyncLogin.rejected, (state, action) => {
        state.profileAction.loading = false;
        state.profileAction.error = (action.payload || null) as ErrorRedux;
        state.new = true;
      })
      // checking the present user or not
      .addCase(asyncCheckPresentUser.pending, (state, action) => {
        state.presentUserChecking.phone = action.meta.arg.phone;
        state.presentUserChecking.loading = true;
      })
      .addCase(asyncCheckPresentUser.fulfilled, (state) => {
        state.presentUserChecking.loading = false;
        state.presentUserChecking.is_yes = true;
        state.presentUserChecking.error = null;
      })
      .addCase(asyncCheckPresentUser.rejected, (state, action) => {
        state.presentUserChecking.loading = false;
        state.presentUserChecking.is_yes = false;
        state.presentUserChecking.error = (action.payload ||
          null) as ErrorRedux;
      })
      // get profile
      .addCase(asyncGetProfile.pending, (state) => {
        state.profileAction.loading = true;
      })
      .addCase(asyncGetProfile.fulfilled, (state, action) => {
        state.profileAction.loading = false;
        state.profileAction.error = null;
        state.phone = state.presentUserChecking.phone || "";
        state.token = action.payload.data.token;
        state.callToken = action.payload.data.stringee_token;
        state.new = false;
      })
      .addCase(asyncGetProfile.rejected, (state, action) => {
        state.profileAction.loading = false;
        state.profileAction.error = (action.payload || null) as ErrorRedux;
      })
      // sign up
      .addCase(
        asyncCheckExistingPresentUserPhoneAndPCCode.pending,
        (state, action) => {
          state.signUp.loading = true;
          state.signUp.phone = action.meta.arg.phone;
          state.signUp.pc_code = action.meta.arg.pc_code;
        }
      )
      .addCase(
        asyncCheckExistingPresentUserPhoneAndPCCode.fulfilled,
        (state, action) => {
          state.signUp.loading = false;
          state.signUp.error = null;
          state.pap_user_account_id = (
            action.payload.data as { id: number }
          ).id;
          localStorageService.set(NON_SUBMIT_PROFILE_DATA, {
            phone: (action.payload.data as { phone: number }).phone,
            id: (action.payload.data as { id: number }).id,
          });
        }
      )
      .addCase(
        asyncCheckExistingPresentUserPhoneAndPCCode.rejected,
        (state, action) => {
          state.signUp.loading = false;
          state.signUp.error = (action.payload || null) as ErrorRedux;
        }
      ),
});

export const {
  updatePhoneReducer: updatePhone,
  updateTokenReducer: updateToken,
  logoutReducer: logout,
  clearTokenReducer: clearToken,
  updateNewReducer: updateNew,
  updateIsNeedCacheReducer: updateIsNeedCache,
  updateGenOTPErrReducer: updateGenOTPErr,
} = auth.actions;

export default auth.reducer;
