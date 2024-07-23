import { Col, Modal, Row } from 'antd';
import { useAppDispatch, useAppSelector } from 'appRedux';
import Layout from 'core/layout';
import {
  PAPBackButton,
  PAPBottomButton,
  PAPButton,
  PAPError,
} from 'core/pures';
import styled from 'styled-components';
import { ProfileItem } from '../components';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PATH, { SUBMIT_PATH } from 'common/path';
import {
  asyncSubmitApplication,
  asyncUpdateApplication,
  clearRemovedImage,
  updateProfilePage,
} from '../slice';
import { withPhone } from 'hoc';
import { convertProfileFormToProfile, getCoordination } from 'utils/helpers';
import {
  OperatingSystem,
  Profile,
  SubmitResponse,
  UpdateSubmitResponse,
} from '../type';
import {
  PHONE,
  removeCache,
  setCurrentPage,
  setProfilesPage,
} from 'utils/localStorage';
import { EXPIRED_TOKEN, PROFILES_PAGE } from 'common/constants';
import { useTranslation } from 'react-i18next';
import { EVENT_NAME, logGAEvent } from 'utils/googleAnalytics';
import { useCoordination, useTrackViewPage } from 'hooks';
import { ERROR_LOG_TYPE, sendErrorLog } from 'utils/errors';
import { shallowEqual } from 'react-redux';
import platform from 'platform';
import { saveCache } from 'utils/cache';
import { updateIsNeedCache } from 'modules/Auth/slice';

export const UNKNOWN = 'unknown';

export type SubmitActionFunc = (
  p: Profile[]
) => Promise<SubmitResponse | UpdateSubmitResponse>;

export async function retrieveCoordination(
  coords: number[] | null,
  profiles: Profile[],
  t: any
): Promise<Profile[]> {
  try {
    if (coords && coords.length == 2 && coords[0] > 0 && coords[1] > 0) {
      return profiles;
    }
    const coordData = await getCoordination(t('SOME_THING_WENT_WRONG'));

    if (coordData?.length < 2) {
      // disallow to get location, log into the system.
      const presentProfile = profiles.find(item => item.is_present);
      const errorText = (t('ERROR_WHEN_DISALLOWING_LOCATION') as string)
        .replace('{uname}', presentProfile?.full_name || 'N/A')
        .replace('{uphone}', presentProfile?.phone || 'N/A');
      throw new Error(errorText);
    }
    return profiles.map(item =>
      item.is_present ? { ...item, coordination: coordData.join(',') } : item
    );
  } catch (e) {
    sendErrorLog(ERROR_LOG_TYPE.DISALLOW_LOCATION, e);
    return profiles;
  }
}

const ListProfiles = withPhone((): JSX.Element => {
  useTrackViewPage(EVENT_NAME.PAGE_LIST_PROFILES);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  const [authNew, authToken, authPhone] = useAppSelector(
    state => [state.auth.new, state.auth.token, state.auth.phone],
    shallowEqual
  );
  const [coordination, errorGPS] = useCoordination();

  const [data, reSubmit, pcCode, error, removed_image_ids] = useAppSelector(
    state => [
      state.submit.data,
      state.submit.reSubmit,
      state.submit.pcCode,
      state.submit.submitOrUpdate.error,
      state.submit.removedImageIds,
    ],
    shallowEqual
  );

  const [confirm, setConfirm] = useState(false);
  const [requireMore, setRequireMore] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  const isSubmit = useMemo(() => authNew || reSubmit, [authNew, reSubmit]);

  const addRelativeProfile = () => {
    const index = data.length + 1;
    navigate(`..${SUBMIT_PATH.FORM}/${index}?new=true`);
  };

  const isCaching = searchParams.get('isCaching') === 'true';
  const detectOperatingSystem = ((): OperatingSystem => {
    return {
      device_info: {
        name: platform.product || UNKNOWN,
        os: platform.os?.toString() || UNKNOWN,
        product: platform.product,
      },
      browser_info: {
        name: platform.name || UNKNOWN,
        version: platform.version || UNKNOWN,
      },
    };
  })();

  const submitAndUpdate = useCallback(() => {
    const profiles = convertProfileFormToProfile(
      data,
      errorGPS ? null : coordination.join(','),
      isSubmit,
      pcCode
    );

    const dispatchAction: SubmitActionFunc = (profiles: Profile[]) => {
      logGAEvent(
        isSubmit
          ? EVENT_NAME.BTN_SUBMIT_APPLICATION_CONFIRM
          : EVENT_NAME.BTN_UPDATE_APPLICATION_CONFIRM
      );
      return isSubmit
        ? dispatch(
            asyncSubmitApplication({
              profiles,
              os_info: detectOperatingSystem,
              removed_image_ids,
              react_app_version: process.env.REACT_APP_VERSION,
            })
          ).unwrap()
        : dispatch(
            asyncUpdateApplication({
              profiles,
              os_info: detectOperatingSystem,
              removed_image_ids,
              react_app_version: process.env.REACT_APP_VERSION,
            })
          ).unwrap();
    };
    setButtonLoading(true);
    retrieveCoordination(coordination, profiles, t)
      .then(dispatchAction)
      .then(() => {
        // clear cache and screen
        removeCache();
        setConfirm(false);
        setRequireMore(false);
        dispatch(clearRemovedImage());
        navigate(`${PATH.RESULT}`);

        localStorage.removeItem('notSubmitApplicationToken');
      })
      .catch(e => {
        sendErrorLog(
          isSubmit ? ERROR_LOG_TYPE.SUBMIT_FLOW : ERROR_LOG_TYPE.UPDATE_FLOW,
          e
        );
        if (e.error.code === EXPIRED_TOKEN) {
          data.forEach((item, index) => {
            saveCache(item, `${index + 1}`);
          });
          localStorage.setItem(PHONE, authPhone);
          setProfilesPage();
          setCurrentPage(PROFILES_PAGE);
          dispatch(updateIsNeedCache(true));
          navigate(`/login?isUpdate=true&phone=${authPhone}`);
        }
      })
      .finally(() => {
        setButtonLoading(false);
      })
      .finally(() => {
        setButtonLoading(false);
      });
  }, [data, coordination, isSubmit, pcCode, t, dispatch, navigate]);

  const onConfirm = useCallback(() => {
    if (data.filter(item => !item.is_deleted).length < 2) {
      setRequireMore(true);
      return;
    }
    setConfirm(true);
  }, [data, setRequireMore, setConfirm]);

  useEffect(() => {
    dispatch(updateProfilePage(true));
    // disable auto save for update flow
    if (authToken) return;
    setProfilesPage();
    setCurrentPage(PROFILES_PAGE);
  }, [dispatch, authToken]);

  const [confirmText, submitText, review, titleSubmit] = useMemo(
    () => [
      t(isSubmit ? 'CONFIRM' : 'UPDATE'),
      t(isSubmit ? 'SUBMIT_CONFIRM' : 'UPDATE_DONE'),
      t(isSubmit ? 'BACK_AND_REVIEW' : 'CONTINUE_SEE_PROFILE'),
      t(isSubmit ? 'SUBMIT_CONFIRM' : 'UPDATE_CONFIRM'),
    ],
    [t, isSubmit]
  );

  const back = useCallback(() => {
    if (authToken) return navigate(PATH.RESULT);
  }, [authToken, navigate]);

  useEffect(() => {
    !isCaching && dispatch(updateIsNeedCache(false));
  }, [isCaching]);

  return (
    <Layout back={back}>
      {back && <PAPBackButton onClick={back} />}
      <Container>
        <Title>{t('PROFILE_OVERVIEW')}</Title>
        <Row gutter={[16, 0]}>
          {data
            .filter(item => !item.is_deleted && item.is_saved)
            .map(profile => (
              <Col lg={12} xs={24} key={profile.index}>
                <ProfileItem profile={profile} />
              </Col>
            ))}
        </Row>
        <ButtonContainer>
          <AddButton
            color='colorPrimary'
            onClick={addRelativeProfile}
            icon={<PlusOutlined />}
            gaTrack={{
              event: EVENT_NAME.BTN_CREATE_RELATIVE,
            }}
          >
            {t('ADD_NEW')}
          </AddButton>
        </ButtonContainer>
      </Container>
      <PAPBottomButton
        onClick={onConfirm}
        type='primary'
        text={confirmText}
        buttonProps={{
          gaTrack: {
            event: isSubmit
              ? EVENT_NAME.BTN_SUBMIT_APPLICATION
              : EVENT_NAME.BTN_UPDATE_APPLICATION,
          },
        }}
      />
      <Modal
        open={confirm}
        title={null}
        footer={null}
        onCancel={() => setConfirm(false)}
        closeIcon={null}
      >
        <CloseContainer>
          <CloseOutlined onClick={() => setConfirm(false)} />
        </CloseContainer>
        <ModalContainer>
          <TitleConfirm>{titleSubmit}</TitleConfirm>
          {!isSubmit && (
            <DescriptionConfirm>
              {t('UPDATE_CONFIRM_DESCRIPTION')}
            </DescriptionConfirm>
          )}
          <PAPButtonModal
            type='primary'
            onClick={submitAndUpdate}
            loading={buttonLoading}
          >
            {submitText}
          </PAPButtonModal>
          <PAPError error={error} />
          <PAPButtonModal
            color='colorPrimary'
            type='text'
            onClick={() => setConfirm(false)}
          >
            {review}
          </PAPButtonModal>
        </ModalContainer>
      </Modal>
      <Modal
        open={requireMore}
        title={null}
        footer={null}
        onCancel={() => setRequireMore(false)}
        closeIcon={null}
        width={400}
      >
        <CloseContainer>
          <CloseOutlined onClick={() => setRequireMore(false)} />
        </CloseContainer>
        <ModalContainer>
          <TitleConfirm>{t('REQUIRE_MORE_PROFILES')}</TitleConfirm>
          <DescriptionConfirm>
            {t('REQUIRE_MORE_PROFILES_DESCRIPTION')}
            <br />
            {t('UW_SYSTEM')}
          </DescriptionConfirm>
          <PAPButtonModal type='primary' onClick={addRelativeProfile}>
            {t('ADD_MORE_RELATIVE')}
          </PAPButtonModal>
          <PAPButtonModal
            color='colorPrimary'
            type='text'
            onClick={submitAndUpdate}
            loading={buttonLoading}
          >
            {t('CONFIRM_SEND')}
          </PAPButtonModal>
        </ModalContainer>
      </Modal>
    </Layout>
  );
});

export default ListProfiles;

const Container = styled.div`
  background-color: white;
  box-shadow: ${props => props.theme.boxShadow};
  width: 900px;
  margin: auto;
  padding: 2rem;

  @media screen and (max-width: 768px) {
    width: 100%;
    padding-inline: 1rem;
    padding-top: 1rem;
    padding-bottom: 5rem;
  }
`;

const Title = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
  margin-bottom: 2rem;
`;

const AddButton = styled(PAPButton)`
  background-color: ${props => props.theme.cyan1};
  width: 400px;

  @media screen and (max-width: 540px) {
    width: 100%;
    margin-inline: 0.5rem;
  }
`;

const CloseContainer = styled.div`
  display: flex;
  justify-content: right;
`;

const TitleConfirm = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
`;

const ModalContainer = styled.div`
  text-align: center;
`;

const PAPButtonModal = styled(PAPButton)`
  width: 100%;
  margin-block: 8px;
`;

const DescriptionConfirm = styled.p``;
