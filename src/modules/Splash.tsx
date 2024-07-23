import React, { useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'appRedux';
import { PROFILES_PAGE } from 'common/constants';
import PATH, { SUBMIT_PATH } from 'common/path';
import { PAPLoading } from 'core/pures';
import {
  IS_SUBMIT_APPLICATION,
  NON_SUBMIT_PROFILE_DATA,
  getCache,
  getPhone,
  getToken,
  localStorageService,
} from 'utils/localStorage';
import {
  asyncGetApplicationData,
  loadProfilesFromCache,
  updateProfilePage,
} from './ApplicationSubmit/slice';
import { updatePhone } from './Auth/slice';
import { Home } from './Auth';
import { shallowEqual } from 'react-redux';

function Splash(): React.JSX.Element {
  const authToken = useAppSelector(state => state.auth.token, shallowEqual);

  const rsGetAppData = useAppSelector(
    state => state.submit.getApplicationData,
    shallowEqual
  );

  const dispatch = useAppDispatch();

  const token = useMemo(() => getToken(), []);
  const phone = getPhone();
  const isSubmitApplication = localStorageService.get(IS_SUBMIT_APPLICATION);
  const nonSubmitData = localStorageService.get(NON_SUBMIT_PROFILE_DATA);

  useEffect(() => {
    dispatch(asyncGetApplicationData());
  }, [dispatch]);

  if (isSubmitApplication === false && !token && !phone) {
    dispatch(updatePhone(nonSubmitData));
    return <Navigate to={PATH.APPLICATION_SUBMIT} />;
  }

  if (phone) {
    return <Cache />;
  }

  if (!token || rsGetAppData.error) {
    return <Home />;
  }

  if (!rsGetAppData.loading && authToken) {
    return <Navigate to={PATH.RESULT} />;
  }

  return <PAPLoading />;
}

function Cache(): React.JSX.Element {
  const data = getCache();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!data?.phone) return;
    dispatch(updatePhone({ phone: data?.phone }));
    dispatch(loadProfilesFromCache(data?.data));
    dispatch(updateProfilePage(data?.profiles));
  }, [data?.data, data?.phone, dispatch, data?.profiles]);

  if (!data) return <Home />;

  if (data.current_page === PROFILES_PAGE) {
    return (
      <Navigate to={`${PATH.APPLICATION_SUBMIT}${SUBMIT_PATH.PROFILES}`} />
    );
  }

  return (
    <Navigate
      to={`${PATH.APPLICATION_SUBMIT}${SUBMIT_PATH.FORM}/${data.current_page}`}
    />
  );
}

export default Splash;
