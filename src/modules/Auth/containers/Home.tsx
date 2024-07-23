import { COMMON_IMAGE } from 'common/constants';
import PATH from 'common/path';
import Layout from 'core/layout';
import { PAPButton, PapVersion } from 'core/pures';
import { useTrackViewPage } from 'hooks';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { EVENT_NAME } from 'utils/googleAnalytics';

function Home(): JSX.Element {
  useTrackViewPage(EVENT_NAME.PAGE_HOME);

  const { t } = useTranslation();

  const navigate = useNavigate();

  return (
    <Layout showLogo={false}>
      <Container>
        <LogoImage src='/Logox2.webp' />
        <Middle>
          <IntroImage src={COMMON_IMAGE.INTRO_IMAGE} />
          <IntroTitle>{t('HOME_TITLE')}</IntroTitle>
          <IntroText>
            {t('HOME_INTRO_1')}
            <br />
            {t('HOME_INTRO_2')}
          </IntroText>
        </Middle>

        <ButtonGroup>
          <SignUpButton onClick={() => navigate(PATH.SIGNUP)} type='primary'>
            {t('SIGN_UP_TO_JOIN')}
          </SignUpButton>
          <LogInButton
            onClick={() => navigate(PATH.LOGIN)}
            type='primary'
            ghost
          >
            {t('LOG_IN')}
          </LogInButton>
        </ButtonGroup>
      </Container>
      <PapVersion />
    </Layout>
  );
}

export default Home;

const Container = styled.div`
  text-align: center;
  padding-top: 2rem;
  padding-inline: 1rem;
  width: 32rem;
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  @media screen and (max-width: 768px) {
    width: unset;
    padding-top: 1rem;
    /* height: calc(100vh - 5rem); */
  }

  @media screen and (max-width: 540px) {
    padding-top: 0.5rem;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    height: 65dvh;
  }

  @media screen and (max-height: 780px) {
    padding-top: 1rem;
  }
`;

const IntroImage = styled.img`
  width: 300px;
  height: 285px;
  margin: auto;

  @media screen and (max-width: 400px) {
    max-width: 100%;
    height: auto;
  }

  @media screen and (max-height: 780px) {
    width: 250px;
    height: 238px;
  }

  @media screen and (max-width: 540px) {
    margin: 0rem auto;
  }
`;

const LogoImage = styled.img`
  max-width: 100%;
  width: 300px;
  height: 39px;
  margin: 1rem auto;
  @media screen and (max-width: 540px) {
    width: 260px;
    height: 33px;
  }

  @media screen and (max-height: 780px) {
    margin: 0 auto;
    width: 250px;
    height: 32px;
  }
`;

// const IntroTitle = styled.h1`
//   color: ${props => props.theme.colorPrimary} !important;
//   font-size: 1.875rem;
//   line-height: normal;

//   @media screen and (max-width: 540px) {
//     font-size: 1.5rem;
//   }
// `;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-inline: 4rem;
  margin-top: 3rem;

  @media screen and (max-width: 540px) {
    margin-inline: 0;
  }

  @media screen and (max-height: 780px) {
    margin-top: 2rem;
  }
  @media screen and (max-height: 570px) {
    margin-top: 1rem;
  }
`;

const SignUpButton = styled(PAPButton)`
  width: 100%;
  margin-block: 0.5rem;
  border: 2px solid ${props => props.theme.colorPrimary};
`;

const LogInButton = styled(PAPButton)`
  width: 100%;
  margin-block: 0.5rem;
  border: 2px solid ${props => props.theme.colorPrimary};
  box-sizing: border-box;
`;

const IntroTitle = styled.h3`
  font-size: 1rem;
  color: black;
  font-weight: 700;
  margin-block: 0.5rem;
`;

const IntroText = styled.p`
  font-size: 0.875rem;
  font-weight: 400;
  margin-block: 0;
`;

const Middle = styled.div`
  margin-block: 1rem;

  @media screen and (max-height: 780px) {
    margin: 0;
  }
`;
