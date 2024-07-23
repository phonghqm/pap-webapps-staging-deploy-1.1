import { Action, ThunkAction, configureStore } from '@reduxjs/toolkit';
import submit from 'modules/ApplicationSubmit/slice';
import auth from 'modules/Auth/slice';
import config from 'modules/Config/slice';
import logger from 'redux-logger';

export const store = configureStore({
  reducer: {
    auth,
    submit,
    config,
  },
  middleware: (getDefaultMiddleware: () => any) => {
    const mid = getDefaultMiddleware();
    if (process.env.NODE_ENV === 'production') {
      return mid;
    }
    return mid.concat(logger);
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
