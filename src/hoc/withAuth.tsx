import { useAppSelector } from 'appRedux';
import PATH from 'common/path';
import { shallowEqual } from 'react-redux';
import { Navigate } from 'react-router-dom';

const withAuth = (Component: () => JSX.Element) => {
  function InnerComponent() {
    const authToken = useAppSelector(state => state.auth.token, shallowEqual);

    if (!authToken) {
      return <Navigate to={PATH.HOME} />;
    }

    return <Component />;
  }

  return InnerComponent;
};

export default withAuth;
