import { TERM_CONDITION } from 'common/content';
import Layout from 'core/layout';
import { PAPHtmlContent } from 'core/pures';
import { useTrackViewPage } from 'hooks';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { EVENT_NAME } from 'utils/googleAnalytics';

function TermCondition(): JSX.Element {
  useTrackViewPage(EVENT_NAME.PAGE_TERM_CONDITION);
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Layout linkLogo='/' back={() => navigate(-1)} menu>
      <Container>
        <Title style={{ textTransform: 'uppercase' }}>
          {t('TERM_AND_CONDITION')}
        </Title>
        <PAPHtmlContent content={TERM_CONDITION} />
      </Container>
    </Layout>
  );
}

export default TermCondition;

const Container = styled.div`
  text-align: justify;
  padding-inline: 1.2rem;
  padding-bottom: 6rem;

  @media screen and (min-width: 768px) {
    padding-inline: 8rem;
  }
`;

const Title = styled.h1`
  font-size: 1.75rem;
  text-align: left;
  line-height: normal;

  @media screen and (max-width: 540px) {
    font-size: 1.65rem;
  }
`;
