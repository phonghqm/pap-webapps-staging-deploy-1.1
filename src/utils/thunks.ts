import {
  ThunkDispatch,
  UnknownAction,
  createAsyncThunk,
} from '@reduxjs/toolkit';

export const wrapRejectValue = (rejectValue: any) => {
  return (e: BaseResponse | any) => {
    throw rejectValue(e);
  };
};

export const wrapCreateAsyncThunk = <Req, Res>(
  name: string,
  callback: (req: Req) => Promise<Res>,
  fullfilled?: (
    res: Res,
    dispatch: ThunkDispatch<unknown, unknown, UnknownAction>,
    getState: () => any
  ) => void
) => {
  return createAsyncThunk(
    name,
    async (
      payload: Req,
      { dispatch, rejectWithValue, getState }
    ): Promise<Res> =>
      callback(payload)
        .then((res: Res) => {
          if (fullfilled) fullfilled(res, dispatch, getState);
          return res;
        })
        .catch(wrapRejectValue(rejectWithValue))
  );
};

export const wrapCreateAsyncThunkNoPayload = <Res>(
  name: string,
  callback: () => Promise<Res>,
  fullfilled?: (
    res: Res,
    dispatch: ThunkDispatch<unknown, unknown, UnknownAction>,
    getState: () => any
  ) => void
) => {
  return createAsyncThunk(
    name,
    async (_, { dispatch, rejectWithValue, getState }): Promise<Res> =>
      callback()
        .then((res: Res) => {
          if (fullfilled) fullfilled(res, dispatch, getState);
          return res;
        })
        .catch(wrapRejectValue(rejectWithValue))
  );
};
