import { CloseOutlined } from '@ant-design/icons';
import { Drawer, Grid, Modal, Spin } from 'antd';
import { PAPError, PAPInput } from 'core/pures';
import { useTimer } from 'hooks';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import styled from 'styled-components';
import { convertSecondToTimer } from 'utils/helpers';
import { useTranslation } from 'react-i18next';
import { EVENT_NAME, logGAEvent } from 'utils/googleAnalytics';

type OpenModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

type OtpProps = {
  isOpen: boolean;
  onClose: () => void;
  onNext: (code: string, callback: () => void) => void;
  onResend: (callback?: () => void) => void;
  loading: boolean;
  error: any;
};

function Otp({
  isOpen,
  onClose,
  onNext,
  onResend,
  loading,
  error,
}: OtpProps): React.JSX.Element {
  const ref = useRef<any>(null);

  return (
    <OpenModal isOpen={isOpen} onOpenChange={() => ref?.current?.focus()}>
      <OtpInput
        ref={ref}
        error={error}
        loading={loading}
        onClose={onClose}
        onNext={onNext}
        onResend={onResend}
      />
    </OpenModal>
  );
}

function OpenModal({ isOpen, onOpenChange, children }: OpenModalProps) {
  const screens = Grid.useBreakpoint();
  const isLargeScreen = useMemo(
    () =>
      Object.entries(screens)
        .filter(screen => !!screen[1])
        .map(item => item[0])
        .includes('md'),
    [screens]
  );

  if (!isLargeScreen) {
    return (
      <Drawer
        zIndex={3}
        open={isOpen}
        placement='bottom'
        styles={{
          header: {
            display: 'none',
          },
        }}
        style={{
          borderRadius: '16px 16px 0 0',
        }}
        height={300}
        afterOpenChange={onOpenChange}
      >
        {children}
      </Drawer>
    );
  }

  return (
    <Modal
      afterOpenChange={onOpenChange}
      open={isOpen}
      title={false}
      closeIcon={null}
      footer={null}
      width={350}
    >
      {children}
    </Modal>
  );
}

type OtpInputProps = {
  loading: boolean;
  error: any;
  onClose: () => void;
  onNext: (code: string, callback: () => void) => void;
  onResend: (callback?: () => void) => void;
};

const OtpInput = forwardRef(
  (
    { loading, error, onClose, onNext, onResend }: OtpInputProps,
    ref: React.ForwardedRef<any>
  ): React.JSX.Element => {
    const { t } = useTranslation();

    const [timer, start, clear, reset] = useTimer(120);

    const onOtpChange = useCallback(
      (value: string) => {
        if (value.length !== 6) return;
        onNext(value, () => {
          logGAEvent(EVENT_NAME.OTP_SUCCCESS_CONFIRM);
          clear();
        });
      },
      [onNext, clear]
    );

    const handleResend = useCallback(() => {
      logGAEvent(EVENT_NAME.BTN_RESEND_OTP);
      onResend(() => {
        reset();
        start();
      });
    }, [onResend, reset, start]);

    useEffect(() => {
      start();

      return () => clear();
    }, [start, clear]);

    return (
      <Spin spinning={loading}>
        <Container>
          <CloseButton>
            <CloseOutlined onClick={onClose} />
          </CloseButton>
          <Title>{t('INPUT_CONFIRM_CODE')}</Title>
          <Description>{t('INPUT_OTP_DESCRIPTION')}</Description>
          <OTPInput
            maxLength={6}
            type='number'
            inputMode='numeric'
            placeholder={t('INPUT_CODE')}
            onChange={e => onOtpChange(e.target.value)}
            status={error ? 'error' : ''}
            autoComplete='one-time-code'
            pattern='\d{6}'
            ref={ref}
            autoFocus
          />
          <PAPError error={error} />
          <Helper>
            <NoResponseOtp>{t('NO_RESPONSE_OTP')}</NoResponseOtp>{' '}
            {timer <= 0 ? (
              <Resend onClick={handleResend}>{t('RESEND')}</Resend>
            ) : (
              <ResendAfter>
                {t('RESEND_AFTER')} {convertSecondToTimer(timer)}
              </ResendAfter>
            )}
          </Helper>
        </Container>
      </Spin>
    );
  }
);

const Container = styled.div`
  text-align: center;
`;

const Title = styled.h3`
  font-size: 1.25rem;
  margin: 0;
`;

const CloseButton = styled.div`
  text-align: right;
`;

const Description = styled.p`
  color: ${props => props.theme.grey8};
`;

const OTPInput = styled(PAPInput)`
  text-align: center;
`;

const Helper = styled.p`
  font-size: 0.75rem;
`;

const NoResponseOtp = styled.span`
  color: ${props => props.theme.grey8};
  font-weight: 500;
`;

const Resend = styled.span`
  font-weight: 500;
  color: ${props => props.theme.colorPrimary};
  cursor: pointer;
`;

const ResendAfter = styled.span`
  font-weight: 500;
  color: ${props => props.theme.grey5};
`;

export default Otp;
