import { useAppSelector } from 'appRedux';
import PATH from 'common/path';
import { shallowEqual } from 'react-redux';
import { Navigate } from 'react-router-dom';

const withPhone = (Component: () => JSX.Element) => {
  function InnerComponent() {
    const authPhone = useAppSelector(state => state.auth.phone, shallowEqual);

    if (!authPhone) {
      return <Navigate to={PATH.HOME} />;
    }

    return <Component />;
  }

  return InnerComponent;
};

export default withPhone;
