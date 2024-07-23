import { HOTLINE, SUPPORT_EMAIL } from 'common/constants';
import { EmailIcon, PhoneIcon } from 'core/icons';
import Layout from 'core/layout';
import { useTrackViewPage } from 'hooks';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { EVENT_NAME } from 'utils/googleAnalytics';

function Contact(): JSX.Element {
  useTrackViewPage(EVENT_NAME.PAGE_CONTACT);

  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Layout linkLogo='/' back={() => navigate(-1)}>
      <div />
      <Container>
        <Title>{t('CONTACT_INFO')}</Title>
        <Description>{t('CONTACT_DESCRIPTION')}</Description>
        <Block>
          <PhoneIcon />
          <BlockContent>
            <BlockText>{t('HOTLINE')}</BlockText>
            <LinkSupport href={`tel:${HOTLINE}`}>{HOTLINE}</LinkSupport>
          </BlockContent>
        </Block>
        <Block>
          <EmailIcon />
          <BlockContent>
            <BlockText>{t('EMAIL')}</BlockText>
            <LinkSupport href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </LinkSupport>
          </BlockContent>
        </Block>
      </Container>
    </Layout>
  );
}

export default Contact;

const Container = styled.div`
  width: 400px;
  margin: auto;
  color: white;
  border-radius: 1.25rem;
  padding: 0.75rem;
  background-color: ${props => props.theme.cyan6};
  text-align: center;
  margin-top: 4rem;

  @media screen and (max-width: 768px) {
    width: calc(100% - 2rem);
    margin-inline: 1rem;
  }
`;

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  margin-block: 0.5rem;
`;

const Description = styled.p`
  font-size: 0.6875rem;
  font-weight: 400;
  margin-top: 0rem;
`;

const Block = styled.div`
  text-align: center;
  margin-block: 2rem;
`;
const BlockContent = styled.span`
  display: block;
  font-size: 0.75rem;
  font-weight: 400;
`;

const LinkSupport = styled.a`
  color: white;
  font-size: 16px;
  font-weight: 600;
`;

const BlockText = styled.p`
  margin-block: 5px 0px;
`;
