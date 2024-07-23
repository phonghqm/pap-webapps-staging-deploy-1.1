import { CLASSIFY_RESULT } from 'common/content';
import PATH from 'common/path';
import Layout from 'core/layout';
import { PAPBackButton, PAPBottomButton, PAPHtmlContent } from 'core/pures';
import { withAuth } from 'hoc';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

function AgreeConfirm() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Layout back={() => navigate(PATH.RESULT)}>
      <PAPBackButton onClick={() => navigate(PATH.RESULT)} />
      <Container>
        <Title>{t('CLASSIFY_RESULT_VEPAP')}</Title>
        <Content>
          <PAPHtmlContent content={CLASSIFY_RESULT} />
        </Content>
      </Container>
      <PAPBottomButton
        onClick={() => navigate(PATH.RESULT)}
        type='primary'
        text={t('UNDERSTANDED')}
      />
    </Layout>
  );
}

const AgreeConfirmPage = withAuth(AgreeConfirm);

export default AgreeConfirmPage;

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

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 600;
  margin-block: 1rem;
  line-height: normal;
  color: ${props => props.theme.colorPrimary};

  @media screen and (max-width: 540px) {
    font-size: 1.25rem;
  }
`;

const Content = styled.div``;
