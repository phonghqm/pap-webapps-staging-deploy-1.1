import { useAppDispatch, useAppSelector } from 'appRedux';
import PATH from 'common/path';
import { Otp } from 'core/business';
import Layout from 'core/layout';
import { PAPBottomButton, PAPHtmlContent } from 'core/pures';
import { useTrackViewPage, useVisibility } from 'hooks';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { asyncRejectResult } from 'modules/ApplicationSubmit/slice';
import { withAuth } from 'hoc';
import { CANCEL_RESULT } from 'common/content';
import { Checkbox } from 'antd';
import { useTranslation } from 'react-i18next';
import { EVENT_NAME } from 'utils/googleAnalytics';
import { shallowEqual } from 'react-redux';
import { asyncGenerateOtp } from 'modules/Auth/slice';

function RejectConfirm() {
  useTrackViewPage(EVENT_NAME.PAGE_CANCEL_RESULT);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [ref, readTerm] = useVisibility();

  const [agreed, setAgreed] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [sentOtp, setSentOtp] = useState(false);

  const [authPhone, authOtp] = useAppSelector(
    state => [state.auth.phone, state.auth.otp],
    shallowEqual
  );
  const isDoneSumission = useAppSelector(state => {
    const status = state.submit.done?.status || null;
    if (!status) return false;
    return ['REJECTED', 'CONFIRMED'].includes(status);
  }, shallowEqual);

  const dispatch = useAppDispatch();

  const generateOtp = useCallback(() => {
    if (sentOtp) {
      setShowOtp(true);
      return;
    }
    dispatch(asyncGenerateOtp({ phone: authPhone }))
      .unwrap()
      .then(() => {
        setShowOtp(true);
        setSentOtp(true);
      });
  }, [authPhone, dispatch, sentOtp]);

  const onRejected = useCallback(
    (otp_code: string, callback: () => void) => {
      dispatch(asyncRejectResult({ otp_code, phone: authPhone }))
        .unwrap()
        .then(() => {
          callback();
          navigate(PATH.RESULT);
        });
    },
    [authPhone, dispatch, navigate]
  );

  const onResendOTP = useCallback(
    (callback?: () => void) => {
      dispatch(asyncGenerateOtp({ phone: authPhone || '' }))
        .unwrap()
        .then(callback);
    },
    [dispatch, authPhone]
  );

  return (
    <Layout back={() => navigate(PATH.RESULT)}>
      <Container>
        <Title>{t('REJECT_PROFILE_AND_DO_NOT_CONTINUE')}</Title>
        <Content>
          <PAPHtmlContent content={CANCEL_RESULT} />
          <div ref={ref} />
        </Content>
      </Container>
      {isDoneSumission ? (
        <PAPBottomButton
          onClick={() => navigate(PATH.RESULT)}
          type='primary'
          text={t('UNDERSTANDED')}
        />
      ) : (
        <PAPBottomButton
          onClick={generateOtp}
          type='primary'
          text={t('CONFIRM_CANCEL_PROFILE')}
          pre={
            <div>
              {!readTerm && <Guide>{t('SCROLL_TO_READ_AND_AGREE')}</Guide>}
              <CheckboxAgree>
                <Checkbox
                  disabled={!readTerm}
                  onChange={e => setAgreed(e.target.checked)}
                  className='checkbox-scroll-agree'
                />
                <CheckboxAgreeText color={readTerm ? 'black' : '#7E838F'}>
                  {t('I_CONFIRM_CANCEL_AND')}
                  <GreenText>{t('NO_CONTINUE_JOIN_PROGRAM')}</GreenText>
                </CheckboxAgreeText>
              </CheckboxAgree>
            </div>
          }
          disabled={!agreed}
          loading={authOtp.loading}
          error={authOtp.error}
          buttonProps={{
            gaTrack: {
              event: EVENT_NAME.BTN_CANCEL_RESULT_CONFIRM,
            },
          }}
        />
      )}

      <Otp
        isOpen={showOtp}
        onNext={onRejected}
        onClose={() => setShowOtp(false)}
        loading={authOtp.loading}
        error={authOtp.error}
        onResend={onResendOTP}
      />
    </Layout>
  );
}

const RejectConfirmPage = withAuth(RejectConfirm);

export default RejectConfirmPage;

const Container = styled.div`
  text-align: justify;
  padding-inline: 8rem;
  padding-bottom: 8rem;

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

const Guide = styled.span`
  display: block;
  font-size: 0.6785rem;
  color: ${props => props.theme.grey5};
  font-weight: 400;

  @media screen and (max-width: 540px) {
    text-align: center;
  }
`;

interface ICheckboxAgreeText {
  color: string;
}

const CheckboxAgreeText = styled.span<ICheckboxAgreeText>`
  font-size: 0.875rem;
  font-weight: 400;
  line-height: normal;
  color: ${props => props.color};
`;

const CheckboxAgree = styled.div`
  display: flex;
  gap: 0.2rem;
  margin-block: 0.5rem;
  align-items: center;

  @media screen and (min-width: 540px) {
    justify-content: right;
    gap: 0.4rem;
  }
`;

const GreenText = styled.span`
  color: ${props => props.theme.cyan};
`;
