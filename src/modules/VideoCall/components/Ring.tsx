import { Modal } from 'antd';
import { PAPButton } from 'core/pures';
import { useTranslation } from 'react-i18next';
import styled, { keyframes } from 'styled-components';
import { EVENT_NAME } from 'utils/googleAnalytics';

const Ringing = ({
  answer,
  reject,
  open,
}: {
  answer: () => void;
  reject: () => void;
  open: boolean;
}): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Modal title={null} onCancel={reject} footer={null} open={open} width={400}>
      <Title>
        <IncomingIcon />
        {t('CALL_FROM_EZG_VEPAP')}
      </Title>
      <Description>{t('CALL_FROM_EZG_CONFIRM')}</Description>
      <ButtonGroup>
        <CallButton
          type='primary'
          onClick={answer}
          gaTrack={{
            event: EVENT_NAME.BTN_VIDEO_CALL_ACCEPT,
          }}
        >
          {t('JOIN_CALL')}
        </CallButton>
        <CallButton
          type='primary'
          danger
          onClick={reject}
          gaTrack={{
            event: EVENT_NAME.BTN_VIDEO_CALL_REJECT,
          }}
        >
          {t('REJECT_CALL')}
        </CallButton>
      </ButtonGroup>
    </Modal>
  );
};

export default Ringing;

const spinnergrow = keyframes`
  0% {
    transform: scale(0);
  }

  50% {
    opacity: 1;
  }
`;

const IncomingIcon = styled.span`
  color: ${props => props.theme.colorPrimary};
  display: inline-block;
  width: 2rem;
  height: 2rem;
  vertical-align: text-bottom;
  background-color: currentColor;
  border-radius: 50%;
  opacity: 0;
  -webkit-animation: ${spinnergrow} 0.75s linear infinite;
  animation: ${spinnergrow} 0.75s linear infinite;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-style: normal;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const Description = styled.p`
  color: ${props => props.theme.grey7};
  text-align: center;
  font-size: 0.875rem;
  font-weight: 400;
  margin-bottom: 30px;
`;

const ButtonGroup = styled.div``;

const CallButton = styled(PAPButton)`
  display: block;
  width: 100%;

  margin-block: 10px;
`;
