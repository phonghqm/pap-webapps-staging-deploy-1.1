import { useAppDispatch, useAppSelector } from 'appRedux';
import RegisterForm from './RegisterForm';
import PatientForm from './PatientForm';
import RelativeForm from './RelativeForm';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from 'core/layout';
import { PAPBackButton } from 'core/pures';
import { withPhone } from 'hoc';
import { OWNER_RELATIVE } from 'common/constants';
import { ProfileForm } from 'modules/ApplicationSubmit/type';
import PATH, { SUBMIT_PATH } from 'common/path';
import { EVENT_NAME } from 'utils/googleAnalytics';
import { shallowEqual } from 'react-redux';
import { addProfile } from 'modules/ApplicationSubmit/slice';
import { saveCache } from 'utils/cache';

function getBackEventName(profile?: ProfileForm) {
  if (profile?.is_present) return EVENT_NAME.BTN_FORM_REGISTRANT_BACK;
  if (profile?.patient_relationship === OWNER_RELATIVE)
    return EVENT_NAME.BTN_FORM_PATIENT_BACK;
  return EVENT_NAME.BTN_FORM_RELATIVE_BACK;
}

function FormContainer() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { data: profiles, profilePage } = useAppSelector(
    state => state.submit,
    shallowEqual
  );
  const [hospital, pcCode] = useAppSelector(
    state => [state.submit.hospital, state.submit.pcCode],
    shallowEqual
  );
  const { index } = useParams();
  const { token } = useAppSelector(state => state.auth, shallowEqual);

  const isHaveOwner = profiles.some(
    item => item.patient_relationship === OWNER_RELATIVE
  );
  if (!isHaveOwner) {
    const patient = {
      index: profiles.length + 1,
      is_present: false,
      patient_relationship: OWNER_RELATIVE,
      hospital: hospital,
      pc_code: pcCode as string,
    };
    dispatch(addProfile(patient));
    saveCache(patient, `${profiles.length + 1}`);
  }

  const profile = profiles.find(item => item.index.toString() === index);

  const back = () => {
    if (!profile && token)
      return navigate(`${PATH.APPLICATION_SUBMIT}${SUBMIT_PATH.PROFILES}`);
    if (!profile) return navigate(-1);
    if (profilePage)
      return navigate(`${PATH.APPLICATION_SUBMIT}${SUBMIT_PATH.PROFILES}`);
    if (profile.is_present)
      return navigate(`${PATH.APPLICATION_SUBMIT}${SUBMIT_PATH.EKYC}`);
    if (profile?.patient_relationship === OWNER_RELATIVE) {
      return navigate(`${PATH.APPLICATION_SUBMIT}${SUBMIT_PATH.FORM}/1`);
    }
    return navigate(`${PATH.APPLICATION_SUBMIT}${SUBMIT_PATH.PROFILES}`);
  };

  return (
    <Layout back={back}>
      <PAPBackButton
        onClick={back}
        gaTrack={{
          event: getBackEventName(profile),
        }}
      />
      <Form profile={profile} />
    </Layout>
  );
}

function Form({ profile }: { profile?: ProfileForm }) {
  if (profile?.is_present) {
    return <RegisterForm profile={profile} />;
  }

  if (profile?.patient_relationship === OWNER_RELATIVE) {
    return <PatientForm profile={profile} />;
  }

  return <RelativeForm profile={profile} />;
}

const FormWithPhone = withPhone(FormContainer);

export default FormWithPhone;
