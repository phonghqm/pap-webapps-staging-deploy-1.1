import { Ekyc, Form, ListProfiles, SelectApplication } from './containers';
import { Route, RouteProps, Routes } from 'react-router-dom';
import { SUBMIT_PATH } from 'common/path';

const INNER_ROUTES = [
  {
    id: 'choose-application',
    path: SUBMIT_PATH.CHOOSE_APPLICATION,
    Component: SelectApplication,
  },
  {
    id: 'ekyc',
    path: SUBMIT_PATH.EKYC,
    Component: Ekyc,
  },
  {
    id: 'form',
    path: `${SUBMIT_PATH.FORM}/:index`,
    Component: Form,
  },
  {
    id: 'profiles',
    path: SUBMIT_PATH.PROFILES,
    Component: ListProfiles,
  },
] as RouteProps[];

function ApplicationSubmit(): JSX.Element {
  return (
    <Routes>
      {INNER_ROUTES.map(route =>
        <Route {...route} key={route.id} />
      )}
    </Routes>
  );
}

export default ApplicationSubmit;
