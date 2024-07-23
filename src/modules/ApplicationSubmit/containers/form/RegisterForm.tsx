import CommonInfoFormV2 from './CommonInfoFormV2';
import { useAppDispatch, useAppSelector } from 'appRedux';
import { useNavigate, useParams } from 'react-router-dom';
// import { updateProfile } from 'modules/ApplicationSubmit/slice';
import { SUBMIT_PATH } from 'common/path';
import { OWNER_RELATIVE } from 'common/constants';
import { ProfileForm } from 'modules/ApplicationSubmit/type';
import { useCallback, useState } from 'react';
import { Modal } from 'antd';
import styled from 'styled-components';
import { PAPButton } from 'core/pures';
import { useTranslation } from 'react-i18next';
import { EVENT_NAME, logGAEvent } from 'utils/googleAnalytics';
import { useTrackViewPage } from 'hooks';
import { shallowEqual } from 'react-redux';
import { updateProfile } from 'modules/ApplicationSubmit/slice';

const RegisterForm = ({ profile }: { profile?: ProfileForm }): JSX.Element => {
  useTrackViewPage(EVENT_NAME.PAGE_FORM_REGISTRANT);
  const { t } = useTranslation();
  const { index } = useParams();
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const profilePage = useAppSelector(
    state => state.submit.profilePage,
    shallowEqual
  );
  const [showPopUp, setShowPopUp] = useState(false);

  const submit = useCallback(
    (values: any) => {
      logGAEvent(EVENT_NAME.BTN_FORM_REGISTRANT_NEXT);
      dispatch(
        updateProfile({
          profile: { ...values, is_saved: true },
          index: parseInt(index || '0', 10),
        })
      );

      if (!profilePage && profile?.patient_relationship !== OWNER_RELATIVE) {
        setShowPopUp(true);
      } else {
        navigate(`..${SUBMIT_PATH.PROFILES}`);
      }
    },
    [dispatch, index, navigate, profile?.patient_relationship, profilePage]
  );

  return (
    <>
      <CommonInfoFormV2
        is_patient={profile?.patient_relationship === OWNER_RELATIVE}
        is_present
        title={t('REGISTER_INFO')}
        onSubmit={submit}
        data={profile}
      />
      <Modal
        open={showPopUp}
        footer={null}
        onCancel={() => setShowPopUp(false)}
        width={400}
      >
        <Title>{t('CONTINUE_FILL_PATIENT_INFO')}</Title>
        <CustomButton
          type='primary'
          onClick={() => navigate(`..${SUBMIT_PATH.FORM}/2`)}
        >
          {t('CONTINUE')}
        </CustomButton>
      </Modal>
    </>
  );
};

export default RegisterForm;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  text-align: center;
`;

const CustomButton = styled(PAPButton)`
  width: 100%;
`;
