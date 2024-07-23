import { Col, Row } from 'antd';
import { useAppSelector } from 'appRedux';
import Layout from 'core/layout';
import styled from 'styled-components';
import ProfileItem from '../components/ProfileItem';
import { PAPBackButton, PAPBottomButton } from 'core/pures';
import { useNavigate } from 'react-router-dom';
import PATH from 'common/path';
import { withAuth } from 'hoc';
import { useTranslation } from 'react-i18next';
import { useTrackViewPage } from 'hooks';
import { EVENT_NAME } from 'utils/googleAnalytics';
import { shallowEqual } from 'react-redux';

function Profiles(): JSX.Element {
  useTrackViewPage(EVENT_NAME.PAGE_LIST_PROFILES);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const data = useAppSelector(state => state.submit.data, shallowEqual);

  return (
    <Layout back={() => navigate(PATH.RESULT)}>
      <PAPBackButton onClick={() => navigate(PATH.RESULT)} />
      <Container>
        <Title>{t('PROFILE_OVERVIEW')}</Title>
        <Row gutter={16}>
          {data.map(profile => (
            <Col lg={12} xs={24} key={profile.index}>
              <ProfileItem profile={profile} />
            </Col>
          ))}
        </Row>
      </Container>
      <PAPBottomButton
        type='primary'
        text={t('BACK')}
        onClick={() => navigate(PATH.RESULT)}
      />
    </Layout>
  );
}

const ProfilePage = withAuth(Profiles);

export default ProfilePage;

const Container = styled.div`
  background-color: white;
  box-shadow: ${props => props.theme.boxShadow};
  width: 900px;
  margin: auto;
  padding: 2rem;
  margin-bottom: 5rem;

  @media screen and (max-width: 768px) {
    width: 100%;
    padding-inline: 1rem;
    padding-top: 1rem;
    padding-bottom: 5rem;
  }
`;

const Title = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
`;
