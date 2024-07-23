import { Modal } from 'antd';
import { useAppDispatch, useAppSelector } from 'appRedux';
import ProfileResult from 'core/business/ProfileResult';
import Layout from 'core/layout';
import { Navigate } from 'react-router-dom';
import PATH from 'common/path';
import { withAuth } from 'hoc';
import { updateShowPopUpResult } from 'modules/ApplicationSubmit/slice';
import { LoginStatus } from 'core/business';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useTrackViewPage } from 'hooks';
import { EVENT_NAME } from 'utils/googleAnalytics';
import { shallowEqual } from 'react-redux';
import WaitingModal from '../components/WaitingModal';
import { useEffect, useState } from 'react';
import apis from 'modules/ApplicationSubmit/api';
import { STATUS_PROFILE } from 'common/constants';
import DocumentNeededComponent from './DocumentNeededComponent';

type DocumentNeededType = {
  content_needs_to_add: string;
  guideline_images: string;
};

function Result(): JSX.Element {
  useTrackViewPage(EVENT_NAME.PAGE_RESULT);
  const { t } = useTranslation();
  const [documentNeeded, setDocumentNeeded] = useState<DocumentNeededType>();

  const [applications, showResult] = useAppSelector(
    state => [
      state.submit.submitApplications || [],
      state.submit.showPopupResult,
    ],
    shallowEqual
  );
  const [isShowDocumentNeeded, setIsShowDocumentNeeded] = useState(
    applications[0]?.status === STATUS_PROFILE.PROCESSING ||
      applications[0]?.status === STATUS_PROFILE.DOCUMENT_NEEDED
  );
  const [isHasImage, setIsHasImage] = useState(true);

  const dispatch = useAppDispatch();

  const closePopupResult = () => {
    dispatch(updateShowPopUpResult(undefined));
  };
  useEffect(() => {
    apis
      .getGuildeDocumentNeeded()
      .then(res => {
        setDocumentNeeded(res.data);
        if (res.data.content_needs_to_add === '') {
          setIsShowDocumentNeeded(false);
        }
        if (res.data.guideline_images === '') {
          setIsHasImage(false);
        }
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

  if (applications.length <= 0) return <Navigate to={PATH.SIGNUP} />;

  return (
    <Layout>
      <Modal
        open={!!showResult}
        footer={null}
        onCancel={closePopupResult}
        closeIcon={null}
        width={350}
      >
        <WaitingModal onClose={closePopupResult} type={showResult} />
      </Modal>
      <StatusContainer>
        <LoginStatus />
        <Title>{t('YOUR_PROFILE')}</Title>
      </StatusContainer>
      {isShowDocumentNeeded && (
        <DocumentNeededComponent
          documentNeeded={documentNeeded}
          isHasImage={isHasImage}
        />
      )}
      {applications.map((item, key) => (
        <ProfileResult
          profile={item}
          key={item.pap_submitted_application_id || key}
        />
      ))}
    </Layout>
  );
}

const ResultPage = withAuth(Result);

export default ResultPage;

const StatusContainer = styled.div`
  text-align: center;
  width: 24rem;
  margin: auto;

  @media screen and (max-width: 768px) {
    max-width: 28rem;
    width: 100%;
  }
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  @media screen and (max-width: 768px) {
    margin-block: 1rem;
  }
`;
