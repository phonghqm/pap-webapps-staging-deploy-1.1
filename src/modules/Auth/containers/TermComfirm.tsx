import Layout from 'core/layout';
import { Otp } from 'core/business';
import { useCallback, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import PATH from 'common/path';
import { useTrackViewPage, useVisibility } from 'hooks';
import { useAppDispatch, useAppSelector } from 'appRedux';
import { PAPBackButton, PAPBottomButton, PAPHtmlContent } from 'core/pures';
import { asyncConfirmOtp, asyncGenerateOtp } from '../slice';
import { withPhone } from 'hoc';
import { TERM_CONDITION } from 'common/content';
import { Checkbox } from 'antd';
import { useTranslation } from 'react-i18next';
import { EVENT_NAME } from 'utils/googleAnalytics';
import { shallowEqual } from 'react-redux';

function TermCondition(): JSX.Element {
  useTrackViewPage(EVENT_NAME.PAGE_TERM_CONDITION);
  const { t } = useTranslation();
  const { phone, otp } = useAppSelector(state => state.auth, shallowEqual);
  const pcCode = useAppSelector(state => state.submit.pcCode, shallowEqual);
  const dispatch = useAppDispatch();

  const navigate = useNavigate();
  const [ref, readTerm] = useVisibility();
  const [openOtp, setOpenOtp] = useState(false);
  const [sentOtp, setSentOtp] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const confirmTermAndGetOTP = () => {
    if (sentOtp) {
      setOpenOtp(true);
      return;
    }
    dispatch(asyncGenerateOtp({ phone }))
      .unwrap()
      .then(() => {
        setOpenOtp(true);
        setSentOtp(true);
      });
  };

  const onConfirmOTPAndNextStep = useCallback(
    (otp_code: string, callback: () => void) => {
      dispatch(
        asyncConfirmOtp({ phone, otp_code, pc_code: pcCode, agree_term: true })
      )
        .unwrap()
        .then(() => {
          callback();
          navigate(PATH.APPLICATION_SUBMIT);
        });
    },
    [dispatch, pcCode, phone, navigate]
  );

  const onResendOTP = useCallback(
    (callback?: () => void) => {
      dispatch(asyncGenerateOtp({ phone: phone || '' }))
        .unwrap()
        .then(callback);
    },
    [dispatch, phone]
  );

  return (
    <Layout back={() => navigate(PATH.SIGNUP)}>
      <PAPBackButton
        gaTrack={{
          event: EVENT_NAME.BTN_TERM_CONDITION_BACK,
        }}
        onClick={() => navigate(PATH.SIGNUP)}
      />
      <Container>
        <Title>{t('TERM_AND_CONDITION')}</Title>
        <PAPHtmlContent content={TERM_CONDITION} />
        <div ref={ref} />
      </Container>
      <PAPBottomButton
        pre={
          <div>
            {!readTerm && <Guide>{t('SCROLL_TO_READ_AND_AGREE')}</Guide>}
            <CheckboxAgree>
              <Checkbox
                className='checkbox-scroll-agree'
                disabled={!readTerm}
                onChange={e => setAgreed(e.target.checked)}
              />
              <CheckboxAgreeText color={readTerm ? 'black' : '#7E838F'}>
                {t('I_AGREE_TERM')}
              </CheckboxAgreeText>
            </CheckboxAgree>
          </div>
        }
        type='primary'
        disabled={!agreed}
        onClick={confirmTermAndGetOTP}
        text={t('CONTINUE')}
        loading={otp.loading}
        error={otp.error}
        buttonProps={{
          gaTrack: {
            event: EVENT_NAME.BTN_TERM_CONDITION_NEXT,
          },
        }}
      />
      <Otp
        isOpen={openOtp}
        onClose={() => setOpenOtp(false)}
        onNext={onConfirmOTPAndNextStep}
        loading={otp.loading}
        error={otp.error}
        onResend={onResendOTP}
      />
    </Layout>
  );
}

const TermConditionConfirmPage = withPhone(TermCondition);

export default TermConditionConfirmPage;

const Container = styled.div`
  text-align: justify;
  padding-inline: 8rem;
  padding-bottom: 8rem;

  @media screen and (max-width: 928px) {
    padding-inline: 3rem;
  }

  @media screen and (max-width: 768px) {
    padding-inline: 1.25rem;
  }
`;

const Title = styled.h1`
  font-size: 1.75rem;
  text-align: left;
  line-height: normal;

  @media screen and (max-width: 768px) {
    font-size: 1.65rem;
  }
`;

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
