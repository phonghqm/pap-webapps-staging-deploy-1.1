import { HOTLINE } from 'common/constants';
import { Phone } from 'core/icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { EVENT_NAME, logGAEvent } from 'utils/googleAnalytics';

const HotlineComponent = (): JSX.Element => {
  const { t } = useTranslation();

  const track = () => {
    logGAEvent(EVENT_NAME.BTN_HOTLINE_SUPPORT);
  };

  return (
    <Container onClick={track}>
      <PhoneIcon>
        <Phone />
      </PhoneIcon>
      <Text>
        <SupportHotline>{t('HOTLINE_SUPPORT')}</SupportHotline>
        <Hotline>{HOTLINE}</Hotline>
      </Text>
    </Container>
  );
};

export default HotlineComponent;

const Container = styled.div`
  position: relative;
  box-shadow: ${props => props.theme.boxShadow};
`;

const PhoneIcon = styled.div`
  position: absolute;
  left: -20px;
`;

const Text = styled.div`
  background-color: ${props => props.theme.cyan1};
  padding-inline: 36px 15px;
  padding-block: 2px;
  box-shadow: ${props => props.theme.boxShadow};
`;

const SupportHotline = styled.span`
  display: block;
  color: black;
  font-weight: 500;
`;

const Hotline = styled.span`
  color: ${props => props.theme.cyan};
  font-weight: 500;
`;
