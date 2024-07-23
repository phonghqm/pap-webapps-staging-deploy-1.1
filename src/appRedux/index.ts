import { store, AppDispatch, AppThunk, RootState } from './store';
import { useAppDispatch, useAppSelector } from './hooks';

export { useAppDispatch, useAppSelector };
export type { AppDispatch, AppThunk, RootState };
export default store;
