import { HOTLINE, SUPPORT_EMAIL } from 'common/constants';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

function SupportComponent(): JSX.Element {
  const { t } = useTranslation();

  return (
    <Support>
      <SupportText>
        {t('HOTLINE_SUPPORT')}:{' '}
        <LinkSupport href={`tel:${HOTLINE}`}>{HOTLINE}</LinkSupport>
      </SupportText>
      <SupportText>
        {t('OR')}
        <LinkSupport href={`mailto:${SUPPORT_EMAIL}`}>
          {SUPPORT_EMAIL}
        </LinkSupport>
      </SupportText>
    </Support>
  );
}

export default SupportComponent;

const Support = styled.div``;

const SupportText = styled.span`
  display: block;
  margin-block: 0.2rem;
  color: ${props => props.theme.grey7};
  font-size: 0.875rem;
`;

const LinkSupport = styled.a`
  color: ${props => props.theme.colorPrimary};
  text-decoration: none;
`;
