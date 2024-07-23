import styled from 'styled-components';
import { Webcam } from 'react-face-detection-hook';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Flash, Portrait, TakePhoto, Zoom } from 'core/icons';
import { defineFileFromType, uploadImage, uploadOCR } from 'utils/upload';
import { useAppDispatch, useAppSelector } from 'appRedux';
import { updateProfile } from 'modules/ApplicationSubmit/slice';
import { ProfileForm } from 'modules/ApplicationSubmit/type';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { PAPBackButton, PAPButton, PAPError } from 'core/pures';
import Layout from 'core/layout';
import { b64toBlob, checkIsMobile, getDataFromOcr } from 'utils/helpers';
import imageCompression from 'browser-image-compression';
import UploadIdCard from './UploadIdCard';
import { useCameraPermission, useTrackViewPage } from 'hooks';
import { createSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EVENT_NAME, logGAEvent } from 'utils/googleAnalytics';
import { shallowEqual } from 'react-redux';
import { ERROR_LOG_TYPE, sendErrorLog } from 'utils/errors';

type IdCardProps = {
  type: 'front' | 'back';
};

const { REACT_APP_REDUCE_LIVENESS_SIZE } = process.env;

export default function IdCard({ type }: IdCardProps) {
  useTrackViewPage(
    type === 'front'
      ? EVENT_NAME.PAGE_ID_CARD_FRONT
      : EVENT_NAME.PAGE_ID_CARD_BACK
  );
  const { t } = useTranslation();

  const isMobile = checkIsMobile();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { cities: provinces } = useAppSelector(
    (state) => state.config,
    shallowEqual
  );
  const idCardBack = useAppSelector(state => {
    if (state.submit.data?.length > 0 && state.submit.data[0]?.id_card_back) {
      return state.submit.data[0].id_card_back;
    }
    return null;
  }, shallowEqual);
  const [phone, pap_user_account_id] = useAppSelector(
    state => [state.auth.phone, state.auth.pap_user_account_id],
    shallowEqual
  );
  const webcamRef = useRef<any>(null);
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [img, setImg] = useState('');
  const [error, setError] = useState<any>(null);
  const [file, setFile] = useState<File | Blob | null>(null);
  const hasPermission = useCameraPermission('environment');

  const INSTRUCTION_ITEMS = useMemo(
    () => [
      {
        icon: Zoom,
        text: t('MOVE_INTO_FRAME'),
      },
      {
        icon: Portrait,
        text: t('ENSURE_IMG_CLEAR'),
      },
      {
        icon: Flash,
        text: t('NO_FLASH'),
      },
    ],
    [t]
  );

  const back = useCallback(() => {
    navigate({
      pathname,
      search: createSearchParams({}).toString(),
    });
  }, [navigate, pathname]);

  const next = useCallback(() => {
    // next to the back of id-card screen
    if (type === 'front' && !idCardBack) {
      navigate({
        pathname,
        search: createSearchParams({
          step: 'back',
        }).toString(),
      });
      return;
    }
    // has full photos of idcars, back to the eKYC screen
    back();
  }, [navigate, pathname, idCardBack, type, back]);

  const uploadAndOcr = useCallback(
    (img: File | Blob) => {
      setLoading(true);

      imageCompression(img as File, {
        maxSizeMB: parseFloat(REACT_APP_REDUCE_LIVENESS_SIZE as string),
        // maxWidthOrHeight: 1024,
        useWebWorker: true,
      }).then(compressImg => {
        return Promise.allSettled([
          uploadImage(
            compressImg,
            phone,
            compressImg.type.includes('image'),
            defineFileFromType('FRONT_FACE'),
            undefined,
            undefined,
            pap_user_account_id
          ),
          uploadOCR(compressImg),
        ])
          .then(([dataUpload, dataOcr]) => {
            // uploading image has error
            if (dataUpload.status === 'rejected') {
              // todo: log error into the system
              sendErrorLog(ERROR_LOG_TYPE.UPLOAD_FILE, dataUpload.reason);
              return Promise.reject(dataUpload.reason);
            }
            const url = dataUpload.value.data?.url || null;
            // cannot return image link
            if (!url) {
              // todo: log error into the system
              // throw new error with empty link
              sendErrorLog(ERROR_LOG_TYPE.UPLOAD_FILE, 'No url in response');
              return;
            }
            const idCardData = dataUpload.value.data;

            const profile =
              dataOcr.status === 'fulfilled'
                ? getDataFromOcr(dataOcr.value, provinces.data)
                : {};
            profile[`id_card_${type}`] = idCardData;

            dispatch(
              updateProfile({
                profile,
                index: 1,
              })
            );
            setImg('');
            setShowConfirm(false);
            setLoading(false);
            next();
          })
          .catch(err => {
            setLoading(false);
            setError(err.error.show);
            if (err.error.code.includes('TOKEN')) {
              navigate(`/login?isUpdate=true&phone=${phone}`);
              localStorage.removeItem('auth');
              localStorage.removeItem('notSubmitApplicationToken');
            }
          });
      });
    },
    [dispatch, next, phone, t, type]
  );

  const upload = useCallback(
    (img: File | Blob) => {
      setLoading(true);
      uploadImage(
        img,
        phone,
        img.type.includes('image'),
        defineFileFromType('BACK_FACE'),
        undefined,
        undefined,
        pap_user_account_id
      )
        .then(data => {
          // No image link
          if (!data?.data?.url) {
            // todo: log error into the system
            // throw new error with empty link
            sendErrorLog(ERROR_LOG_TYPE.UPLOAD_FILE, 'No url in response');
            return;
          }
          const profile = {
            [`id_card_${type}`]: data.data,
          } as Partial<ProfileForm>;
          dispatch(
            updateProfile({
              profile,
              index: 1,
            })
          );
          setLoading(false);
          next();
        })
        .catch(err => {
          setLoading(false);
          setError(err);
          if (err.error.code.includes('TOKEN')) {
            navigate(`/login?isUpdate=true&phone=${phone}`);
            localStorage.removeItem('auth');
            localStorage.removeItem('notSubmitApplicationToken');
          }
        });
    },
    [dispatch, next, phone, type]
  );

  const handleUpload = useCallback(() => {
    if (!file) {
      // todo: log error into the system
      // throw new error with no file uploaded
      sendErrorLog(
        ERROR_LOG_TYPE.HANDLE_UPLOAD,
        'Can not get file object to send request'
      );
      return;
    }
    const logEvent =
      type === 'front'
        ? EVENT_NAME.BTN_ID_CARD_FRONT_NEXT
        : EVENT_NAME.BTN_ID_CARD_BACK_NEXT;
    const uploadAction = type === 'front' ? uploadAndOcr : upload;
    logGAEvent(logEvent);
    uploadAction(file);
  }, [file, type, upload, uploadAndOcr]);

  const uploadIdCardImage = useCallback(
    (file: any) => {
      const logEvent =
        type === 'front'
          ? EVENT_NAME.BTN_ID_CARD_FRONT_UPLOAD
          : EVENT_NAME.BTN_ID_CARD_BACK_UPLOAD;
      logGAEvent(logEvent);
      setImg(URL.createObjectURL(file));
      setFile(file);
      setShowConfirm(true);
    },
    [type]
  );

  const take = useCallback(() => {
    const logEvent =
      type === 'front'
        ? EVENT_NAME.BTN_ID_CARD_FRONT_CAPTURE
        : EVENT_NAME.BTN_ID_CARD_BACK_CAPTURE;
    logGAEvent(logEvent);
    const i = webcamRef?.current?.getScreenshot();
    setImg(i);
    setFile(b64toBlob(i));
    setShowConfirm(true);
  }, [type, webcamRef]);

  const handleRetake = useCallback(() => {
    const logEvent =
      type === 'front'
        ? EVENT_NAME.BTN_ID_CARD_FRONT_RETURN_CAPTURE
        : EVENT_NAME.BTN_ID_CARD_BACK_RETURN_CAPTURE;
    logGAEvent(logEvent);
    setError(null);
    setFile(null);
    setShowConfirm(false);
    setImg('');
  }, [type]);

  useEffect(() => {
    setError(null);
    setImg('');
    setShowConfirm(false);
    setFile(null);
  }, []);

  return (
    <Layout>
      <PAPBackButton
        onClick={back}
        gaTrack={{
          event:
            type === 'front'
              ? EVENT_NAME.BTN_ID_CARD_FRONT_BACK
              : EVENT_NAME.BTN_ID_CARD_BACK_BACK,
        }}
      />

      <Container>
        <ButtonContainer>
          <ArrowLeftOutlined size={40} onClick={back} />
        </ButtonContainer>
        {showConfirm ? (
          <ImageIdCard src={img} />
        ) : (
          <StyledWebcam
            ref={webcamRef}
            forceScreenshotSourceSize
            style={{ borderRadius: 12, maxWidth: '100%' }}
            mirrored={false}
            videoConstraints={{
              facingMode: {
                ideal: 'environment',
              },
              aspectRatio: isMobile ? 2 / 3 : 3 / 2,
            }}
            controls={false}
          />
        )}
        {!hasPermission && <NoPermission>{t('NOT_FOUND_CAMERA')}</NoPermission>}
        <PAPError error={error} />
        <Instruction style={{ marginBottom: '0.1rem' }}>
          {t('TAKE_ID_CARD_PHOTO')}
        </Instruction>
        <Instruction style={{ marginTop: '0.1rem' }}>
          {type === 'front' ? t('FRONT_FACE') : t('BACK_FACE')}
        </Instruction>
        {!showConfirm && (
          <InstructionDescription>
            {INSTRUCTION_ITEMS.map((item, k) => (
              <InstructionItem Icon={item.icon} text={item.text} key={k} />
            ))}
          </InstructionDescription>
        )}

        {showConfirm ? (
          <FlexButton>
            <PAPButton type='text' color='colorPrimary' onClick={handleRetake}>
              {t('RETAKE')}
            </PAPButton>
            <PAPButton type='primary' onClick={handleUpload} loading={loading}>
              {t('CONFIRM')}
            </PAPButton>
          </FlexButton>
        ) : (
          <Flex>
            <div style={{ width: 45 }} />
            <TakePhotoContainer>
              <Button onClick={take}>
                <TakePhoto />
              </Button>
            </TakePhotoContainer>
            <UploadIdCard handleUpload={uploadIdCardImage} />
          </Flex>
        )}
      </Container>
    </Layout>
  );
}

const InstructionItem = ({
  Icon,
  text,
}: {
  Icon: React.FC;
  text: string;
}): JSX.Element => {
  return (
    <InstructionItemContainer>
      <Icon />
      <InstructionItemDescription>{text}</InstructionItemDescription>
    </InstructionItemContainer>
  );
};

const Container = styled.div`
  background-color: black;
  text-align: center;
  color: white;
  width: 500px;
  margin: auto;
  border-radius: 1rem;
  padding-block: 3rem;
  padding-inline: 2rem;
  margin-top: 2rem;
  margin-bottom: 2rem;

  @media screen and (max-height: 780px) {
    padding-block: 1.5rem;
    padding-inline: 1rem;
    margin-block: 1rem;
  }

  @media screen and (max-width: 768px) {
    border-radius: 0;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 99;
    width: 100vw;
    min-height: 100dvh;
    padding-block: 1rem;
    padding-inline: 1rem;
    margin-block: 0;
  }
`;

const Instruction = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;

  @media screen and (max-height: 780px) {
    font-size: 1rem;
  }
`;

const InstructionDescription = styled.div`
  display: flex;
  justify-content: space-between;
  margin-block: 1rem;
`;

const InstructionItemContainer = styled.div`
  text-align: center;
  width: 120px;
`;

const InstructionItemDescription = styled.span`
  display: block;
  font-size: 0.75rem;
`;

const TakePhotoContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-block: 10px;
`;

export const Button = styled.div`
  cursor: pointer;
`;

const ButtonContainer = styled.div`
  display: none;
  @media screen and (max-width: 768px) {
    display: block;
    text-align: left;
    color: white;
    margin: 1rem;
    margin-bottom: 1rem;
  }
`;

const FlexButton = styled.div`
  display: flex;
  justify-content: space-evenly;
  margin-top: 2rem;
`;

const ImageIdCard = styled.img`
  max-width: 100%;
  border-radius: 12px;
  aspect-ratio: 3 / 2;
  object-fit: cover;

  @media screen and (max-height: 780px) {
    width: 380px;
  }
`;

const Flex = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NoPermission = styled.p`
  color: white;
  margin-block: 10px;
  text-align: center;
`;

const StyledWebcam = styled(Webcam)`
  @media screen and (max-height: 780px) {
    width: 380px;
  }
`;
