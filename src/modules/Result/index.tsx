import { Navigate, Route, RouteProps, Routes } from 'react-router-dom';
import PATH, { RESULT_PATH, SUBMIT_PATH } from 'common/path';
import { AgreeResult, Profiles, RejectResult, Result } from './containers';
import { useAppSelector } from 'appRedux';
import { shallowEqual } from 'react-redux';
import { OWNER_RELATIVE, STATUS_PROFILE } from 'common/constants';

const INNER_ROUTES = [
  {
    id: 'index',
    path: RESULT_PATH.RESULT,
    Component: Result,
  },
  {
    id: 'agree',
    path: RESULT_PATH.AGREE,
    Component: AgreeResult,
  },
  {
    id: 'reject',
    path: RESULT_PATH.REJECT,
    Component: RejectResult,
  },
  {
    id: 'profiles',
    path: RESULT_PATH.PROFILES,
    Component: Profiles,
  },
] as RouteProps[];

function ResultPage(): JSX.Element {
  const { data: profiles } = useAppSelector(
    state => state.submit,
    shallowEqual
  );

  const isHaveOwner = profiles.some(
    item => item.patient_relationship === OWNER_RELATIVE
  );
  const [applications] = useAppSelector(
    state => [state.submit.submitApplications || []],
    shallowEqual
  );

  if (profiles.length > 0 && !isHaveOwner) {
    return (
      <Navigate
        to={`${PATH.APPLICATION_SUBMIT}${SUBMIT_PATH.FORM}/${
          profiles.length + 1
        }`}
      />
    );
  }

  if (
    applications[0]?.status === STATUS_PROFILE.CREATING &&
    profiles.length > 0
  ) {
    return (
      <Navigate to={`${PATH.APPLICATION_SUBMIT}${SUBMIT_PATH.PROFILES}`} />
    );
  }

  return (
    <Routes>
      {INNER_ROUTES.map(route => (
        <Route {...route} key={route.id} />
      ))}
    </Routes>
  );
}

export default ResultPage;
