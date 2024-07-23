import { FilePdfOutlined } from '@ant-design/icons';
import { Image, Spin, Upload } from 'antd';
import { Camera, CloseButton } from 'core/icons';
import { useCallback, useRef, useState } from 'react';
import styled from 'styled-components';
import { checkImage, uploadImage, defineFileFromType } from 'utils/upload';
import imageCompression from 'browser-image-compression';
import { useTranslation } from 'react-i18next';
import { ERROR_LOG_TYPE, sendErrorLog } from 'utils/errors';
import { ImageSignedKey } from 'core/pures';
import { useAppDispatch, useAppSelector } from 'appRedux';
import { shallowEqual } from 'react-redux';
import {
  asyncLogUserUpdateAction,
  updateRemovedImage,
} from 'modules/ApplicationSubmit/slice';
import { IMAGE_STATUS } from '../../common/constants';
import { ImageResponse } from 'modules/ApplicationSubmit/type';
import { useNavigate } from 'react-router-dom';

type ErrorUpload = {
  type: 'error' | 'warning';
  message: string;
};

const { REACT_APP_LIMIT_SIZE, REACT_APP_REDUCE_FILE_UPLOAD_SIZE } = process.env;
const DEFAULT_LIMIT_SIZE = '4194304'; // 4Mb

const PAPUploadFilesV2 = ({
  value,
  onChange,
  from = 'unknown',
  profile_id,
  submit_id = 'unknown',
}: {
  value?: ImageResponse[] | [];
  onChange?: any;
  from: string;
  profile_id: number | undefined;
  submit_id?: string;
}): JSX.Element => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [files, setFiles] = useState<ImageResponse[]>(value || []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorUpload | null>(null);
  const ref = useRef<any>();
  const dispatch = useAppDispatch();

  const [phone, pap_user_account_id] = useAppSelector(
    state => [state.auth.phone, state.auth.pap_user_account_id],
    shallowEqual
  );

  const papSubmittedApplicationId = useAppSelector(state => {
    if (
      state.submit.submitApplications &&
      Array.isArray(state.submit.submitApplications) &&
      state.submit.submitApplications.length > 0
    )
      return state.submit.submitApplications[0].pap_submitted_application_id;
    return 0;
  }, shallowEqual);

  const showMessage = (type: 'warning' | 'error', message: string) => {
    setError({
      type,
      message,
    });
    if (ref.current) clearTimeout(ref.current);

    ref.current = setTimeout(() => {
      setError(null);
    }, 8000);
  };

  const handleLogUserAction = useCallback(
    (image: string, from: string, action: 'remove' | 'upload', id?: number) => {
      dispatch(
        asyncLogUserUpdateAction({
          file_from: t(from),
          url: image,
          action,
          pap_profile_id: profile_id || null,
          pap_submitted_application_id: papSubmittedApplicationId,
          pap_user_account_id,
          pap_image_id: id,
        })
      );
    },
    [dispatch, papSubmittedApplicationId, profile_id]
  );

  const handleUpload = async (e: any) => {
    try {
      if (!e) {
        showMessage('error', t('NOT_FOUND_VALID_FILE'));
        return;
      }
      let file = e.file;
      if (!file) {
        showMessage('error', t('NOT_FOUND_VALID_FILE'));
        return;
      }
      setLoading(true);
      const originalExt = file.type;
      const isImage = originalExt?.includes('image');

      if (file.size > parseInt(REACT_APP_LIMIT_SIZE || DEFAULT_LIMIT_SIZE)) {
        if (!isImage) {
          showMessage('error', t('FILE_IS_EXCEEDED_LIMIT_SIZE'));
          setLoading(false);
          return;
        }
        file = await imageCompression(file as File, {
          maxSizeMB: parseFloat(REACT_APP_REDUCE_FILE_UPLOAD_SIZE as string),
          // maxWidthOrHeight: 1024,
          useWebWorker: true,
        });
      }

      const data = await uploadImage(
        file,
        phone,
        isImage,
        defineFileFromType(from),
        undefined,
        submit_id,
        pap_user_account_id
      );
      setFiles((state: any) => {
        const changeData = [...state, data?.data];
        onChange(changeData);
        return changeData;
      });

      await handleLogUserAction(data.data?.url, t(from), 'upload');
      setLoading(false);
    } catch (err: any) {
      if (err.error.code.includes('TOKEN')) {
        navigate(`/login?isUpdate=true&phone=${phone}`);
        localStorage.removeItem('auth');
        localStorage.removeItem('notSubmitApplicationToken');
      }

      sendErrorLog(ERROR_LOG_TYPE.HANDLE_UPLOAD, err);
      setLoading(false);
      showMessage('error', t('ERROR_WHEN_UPLOAD_FILE'));
    }
  };

  const removeImage = useCallback(
    async (file: ImageResponse, from: string) => {
      const fileClone = [...files];

      const filterNewFile = fileClone.map(item => {
        if (item.id === file.id) {
          return { ...item, status: 'REMOVED' };
        }
        return item;
      });

      onChange(filterNewFile);
      setFiles(filterNewFile);
      dispatch(updateRemovedImage(file.id?.toString()));
      await handleLogUserAction(file.url, t(from), 'remove', file.id);
    },
    [files, handleLogUserAction, onChange]
  );

  return (
    <div>
      <MessageUpload error={error} />
      <Container>
        <Spin spinning={loading}>
          <Upload
            listType='picture-card'
            onChange={handleUpload}
            beforeUpload={(_, fileList) => {
              if (fileList.length > 5) {
                showMessage('warning', t('ONLY_UPLOAD_MAXIMUM_5_FILE_AT_ONCE'));
              }
              return false;
            }}
            maxCount={5}
            fileList={[]}
            multiple
            showUploadList={false}
            accept='image/*,application/pdf'
            className='upload-document-multiple'
          >
            <div>
              <Camera />
              <Text>{t('UPLOAD')}</Text>
            </div>
          </Upload>
        </Spin>
        <Image.PreviewGroup>
          {files?.map(
            (file: any) =>
              file.status === IMAGE_STATUS.ACTIVE && (
                <ImageContainer key={file.id}>
                  <CloseButtonContainer
                    onClick={() => removeImage(file, t(from))}
                  >
                    <CloseButton />
                  </CloseButtonContainer>

                  {checkImage(file.url) ? (
                    <ImageSignedKey
                      style={{ objectFit: 'cover', borderRadius: 8 }}
                      src={file.thumbnail_url ?? file.url}
                      previewSrc={file.url}
                      width={100}
                      height={100}
                    />
                  ) : (
                    <PdfFile href={file.url} target='_blank'>
                      <FilePdfOutlined />
                      <Text>{t('FILE')}</Text>
                    </PdfFile>
                  )}
                </ImageContainer>
              )
          )}
        </Image.PreviewGroup>
      </Container>
    </div>
  );
};

export default PAPUploadFilesV2;

const MessageUpload = ({ error }: { error: ErrorUpload | null }) => {
  if (!error) return null;

  return <Message type={error.type}>{error.message}</Message>;
};

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;

// const ImageItem = styled(ImageSignedKey)`
//   object-fit: cover;
//   border-radius: 8px;
// `;

const ImageContainer = styled.div`
  position: relative;
`;

const CloseButtonContainer = styled.span`
  position: absolute;
  top: -10px;
  right: -10px;
  cursor: pointer;
  z-index: 2;
`;

const PdfFile = styled.a`
  width: 100px;
  height: 100px;
  display: block;
  border: 1px solid ${props => props.theme.grey5};
  border-radius: 8px;
  text-align: center;
  padding-top: 25px;
`;

const Text = styled.span`
  display: block;
  color: ${props => props.theme.colorPrimary};
`;

interface IMessage {
  type: 'warning' | 'error';
}

const Message = styled.span<IMessage>`
  display: block;
  margin-bottom: 10px;
  color: ${props =>
    props.type === 'error' ? props.theme.red : props.theme.colorWarning};

  font-size: 0.75rem;
`;
