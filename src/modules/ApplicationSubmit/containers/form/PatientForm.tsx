import CommonInfoFormV2 from './CommonInfoFormV2';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch } from 'appRedux';
import { SUBMIT_PATH } from 'common/path';
import { updateProfile } from 'modules/ApplicationSubmit/slice';
import { ProfileForm } from 'modules/ApplicationSubmit/type';
import { useTranslation } from 'react-i18next';
import { EVENT_NAME, logGAEvent } from 'utils/googleAnalytics';
import { useTrackViewPage } from 'hooks';

export default function PatientForm({ profile }: { profile?: ProfileForm }) {
  useTrackViewPage(EVENT_NAME.PAGE_FORM_PATIENT);
  const { t } = useTranslation();
  const { index } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const submit = (values: any) => {
    logGAEvent(EVENT_NAME.BTN_FORM_PATIENT_NEXT);
    dispatch(
      updateProfile({
        profile: { ...values, is_saved: true },
        index: parseInt(index || '2', 10),
      })
    );
    navigate(`..${SUBMIT_PATH.PROFILES}`);
  };

  return (
    <CommonInfoFormV2
      is_patient
      is_present={false}
      title={t('PATIENT_INFO')}
      onSubmit={submit}
      data={profile}
    />
  );
}
