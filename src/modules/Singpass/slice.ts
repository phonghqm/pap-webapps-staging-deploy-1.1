import {
  ActionReducerMapBuilder,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { wrapCreateAsyncThunk } from "utils/thunks";
import apis from "./api";

interface SingpassState {
  authToken: string;
  redirectUrl: string;
  tokenData: string;
  singpassData: any;
}

const singpassInitialState: SingpassState = {
  authToken: "",
  redirectUrl: "",
  tokenData: "",
  singpassData: {},
};

/****************** Async Thunk Actions ******************/
export const asyncRequestMyInfo = wrapCreateAsyncThunk(
  "singpass/requestMyInfo",
  apis.requestMyInfo
);

export const asyncPollMyInfoData = wrapCreateAsyncThunk(
  "singpass/pollMyInfoData",
  apis.pollMyInfoData
);

/**************** End Async Thunk Actions ****************/

function updateAuthTokenReducer(
  state: SingpassState,
  action: PayloadAction<string>
) {
  state.authToken = action.payload;
}
function updateTokenDataReducer(
  state: SingpassState,
  action: PayloadAction<string>
) {
  state.tokenData = action.payload;
}

function updateRedirectUrlReducer(
  state: SingpassState,
  action: PayloadAction<string>
) {
  state.redirectUrl = action.payload;
}

const singpassSlice = createSlice({
  name: "singpass",
  initialState: singpassInitialState,
  reducers: {
    updateAuthTokenReducer,
    updateRedirectUrlReducer,
    updateTokenDataReducer,
  },
  extraReducers: (builders: ActionReducerMapBuilder<SingpassState>) =>
    builders
      .addCase(asyncRequestMyInfo.fulfilled, (state, action) => {})
      .addCase(asyncPollMyInfoData.fulfilled, (state, action) => {
        state.singpassData = action.payload.data;
      }),
});

export const {
  updateAuthTokenReducer: updateAuthToken,
  updateRedirectUrlReducer: updateRedirectUrl,
  updateTokenDataReducer: updateTokenData,
} = singpassSlice.actions;
export default singpassSlice.reducer;
