import CommonInfoFormV2 from './CommonInfoFormV2';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateProfile } from 'modules/ApplicationSubmit/slice';
import { SUBMIT_PATH } from 'common/path';
import { ProfileForm } from 'modules/ApplicationSubmit/type';
import { useTranslation } from 'react-i18next';
import { EVENT_NAME, logGAEvent } from 'utils/googleAnalytics';
import { useTrackViewPage } from 'hooks';

export default function RelativeForm({ profile }: { profile?: ProfileForm }) {
  useTrackViewPage(EVENT_NAME.PAGE_FORM_RELATIVE);
  const { t } = useTranslation();
  const { index } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submit = (values: any) => {
    logGAEvent(EVENT_NAME.BTN_FORM_RELATIVE_NEXT);
    const idx = parseInt(index || '0', 10);
    dispatch(
      updateProfile({
        profile: { ...values, is_saved: true, is_new: false },
        index: idx,
      })
    );
    navigate(`..${SUBMIT_PATH.PROFILES}`);
  };

  return (
    <CommonInfoFormV2
      is_patient={false}
      is_present={false}
      title={t('RELATIVE_INFO')}
      onSubmit={submit}
      data={profile}
    />
  );
}
