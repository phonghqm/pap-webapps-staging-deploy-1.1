import { useAppSelector } from 'appRedux';
// import { INTRO_PROGRAM } from 'common/content';
import PATH from 'common/path';
import Layout from 'core/layout';
import { PAPBottomButton } from 'core/pures';
import { useTranslation } from 'react-i18next';
import { shallowEqual } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

function Intro(): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const phone = useAppSelector(state => state.auth.phone, shallowEqual);

  return (
    <Layout linkLogo='/' back={() => navigate(-1)} menu>
      <Container>
        {/* <Title>{t('INTRO_TITLE')}</Title> */}
        {/* <SubTitle>{t('INTRO_SUB_TITLE')}</SubTitle> */}
        {/* <PAPHtmlContent content={INTRO_PROGRAM} /> */}
      </Container>
      {!phone && (
        <PAPBottomButton
          type='primary'
          onClick={() => navigate(PATH.HOME)}
          text={t('SIGN_UP_OR_SIGN_IN')}
        />
      )}
    </Layout>
  );
}

export default Intro;

const Container = styled.div`
  text-align: justify;
  padding-inline: 8rem;
  padding-bottom: 6rem;

  @media screen and (max-width: 928px) {
    padding-inline: 3rem;
  }

  @media screen and (max-width: 768px) {
    padding-inline: 1.2rem;
  }
`;

// const Title = styled.h1`
//   font-size: 1.75rem;
//   text-align: center;
//   line-height: normal;
//   color: ${props => props.theme.colorPrimary};

//   @media screen and (max-width: 540px) {
//     font-size: 1.25rem;
//   }
// `;

// const SubTitle = styled.h2`
//   font-size: 1.5rem;
//   text-align: center;
//   line-height: normal;
//   color: ${props => props.theme.colorPrimary};

//   @media screen and (max-width: 540px) {
//     font-size: 1.1rem;
//   }
// `;
