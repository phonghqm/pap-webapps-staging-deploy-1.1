import { useAppSelector } from 'appRedux';
// import { IMAGE_STATUS } from 'common/constants';
// import { AvatarSignedKey } from 'core/pures';
import { useTranslation } from 'react-i18next';
import { shallowEqual } from 'react-redux';
import styled from 'styled-components';
import { getLastElement } from 'utils/helpers';

const LoginStatus = (): JSX.Element => {
  const [name] = useAppSelector(state => {
    const data = state.submit.data || [];
    if (data.length <= 0) return [null, null];
    const register = data.find(item => item.is_present);
    return [
      // register?.ekyc_info?.portrait_document_imgs || null,
      register?.full_name || null,
    ];
  }, shallowEqual);

  const { t } = useTranslation();
  // const portraitImageUrl = link?.find(
  //   item => item.status === IMAGE_STATUS.ACTIVE
  // );

  return (
    <Container>
      {/* <AvatarSignedKey src={portraitImageUrl?.url} size={64} /> */}
      <Greeter>{`${t('GREETER')} ${
        getLastElement(name?.split(' ')) || t('YOU')
      }!`}</Greeter>
      <LoginStatusText>{t('YOU_ARE_LOGGING_IN')}</LoginStatusText>
    </Container>
  );
};

export default LoginStatus;

const Container = styled.div`
  text-align: center;
  background-color: ${props => props.theme.colorPrimary};
  padding-block: 0.9rem;
`;

const Greeter = styled.h3`
  color: white;
  margin-block: 0.5rem 0.25rem;
  font-size: 1rem;
  font-weight: 700;
`;

const LoginStatusText = styled.h5`
  color: white;
  font-weight: 400;
  font-size: 0.875rem;
  margin-block: 0.25rem;
`;
