import { Form, Spin, Upload } from 'antd';
import { EXPIRED_TOKEN, IMAGE_STATUS, OTHER } from 'common/constants';
import { ImageSignedKey, PAPError } from 'core/pures';
import dayjs from 'dayjs';
import { EkycType } from 'modules/ApplicationSubmit/enum';
import { useCallback, useState } from 'react';
import styled from 'styled-components';
import imageCompression from 'browser-image-compression';
import {
  checkValidDateFormat,
  getInfoFormAddress,
  getStringFromAddress,
} from 'utils/helpers';
import { uploadImage, uploadOCR, defineFileFromType } from 'utils/upload';
import { useTranslation } from 'react-i18next';
import { sendErrorLog } from 'utils/errors';
import { useAppDispatch, useAppSelector } from 'appRedux';
import { shallowEqual } from 'react-redux';
import {
  asyncLogUserUpdateAction,
  updateRemovedImage,
} from 'modules/ApplicationSubmit/slice';
import { useNavigate } from 'react-router-dom';
// import { ImageResponse } from 'modules/ApplicationSubmit/type';
// import { checkImage } from '../../../../utils/upload';

const { REACT_APP_REDUCE_LIVENESS_SIZE } = process.env;

const UploadInput = ({
  onChange,
  value,
  fallback,
  type,
  update,
  setCity,
  setDistrict,
  addresses = [],
  profileId,
  t,
  from,
  submit_id = 'unknown',
}: {
  onChange?: any;
  value?: any[];
  fallback: string;
  type: EkycType;
  update: (data: any) => void;
  setCity: (data: string) => void;
  setDistrict: (data: string) => void;
  addresses?: string[];
  profileId?: number;
  t: (label: string) => string;
  from: string;
  submit_id?: string;
}): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [phone, pap_user_account_id, { cities: provinces }] = useAppSelector(
    (state) => [state.auth.phone, state.auth.pap_user_account_id, state.config],
    shallowEqual
  );

  const papSubmittedApplicationId = useAppSelector((state) => {
    if (
      state.submit.submitApplications &&
      Array.isArray(state.submit.submitApplications) &&
      state.submit.submitApplications.length > 0
    )
      return state.submit.submitApplications[0].pap_submitted_application_id;
    return 0;
  }, shallowEqual);

  const handleLogUserAction = useCallback(
    (image: string, action: 'remove' | 'upload') => {
      dispatch(
        asyncLogUserUpdateAction({
          file_from: t('UPLOAD_ID_CARD'),
          url: image,
          action,
          pap_profile_id: profileId || null,
          pap_submitted_application_id: papSubmittedApplicationId,
          pap_user_account_id,
        })
      );
    },
    [dispatch, papSubmittedApplicationId, profileId, t]
  );

  const uploadAndOcr = useCallback(
    (img: any) => {
      setError(null);
      Promise.allSettled([
        uploadImage(
          img,
          phone,
          img.type.includes('image'),
          defineFileFromType(from),
          profileId + '',
          submit_id,
          pap_user_account_id
        ),
        uploadOCR(img),
      ])
        .then(([dataUpload, dataOcr]) => {
          if (dataUpload.status === 'fulfilled') {
            const uploadedImage = dataUpload.value.data;
            const url = dataUpload.value.data?.url;

            if (!url) throw 'Can not find url file.';
            handleLogUserAction(url, 'upload');
            const newValue = [
              ...(value?.map((item) => {
                return {
                  id: item.id,
                  status: 'REMOVED',
                  url: item.url,
                };
              }) || []),
            ];
            newValue.push({
              id: uploadedImage.id,
              status: uploadedImage.status || 'ACTIVE',
              url: uploadedImage.url,
            });
            onChange(newValue);
            const profile = {
              address_info: {
                resident: null,
              },
            } as any;

            if (dataOcr.status === 'fulfilled') {
              const data = dataOcr.value.data;
              if (data && Object.keys(data).length > 0) {
                profile.ekyc_info = {
                  id_card_kind: data.documentType,
                  extra_full_name: data.name,
                  extra_dob: data.dob
                    ? dayjs(data.dob, 'DD/MM/YYYY').format('YYYY-MM-DD')
                    : '',
                  extra_idcard_number: data.id,
                  extra_gender: data.gender,
                  extra_pr_address: data.address,
                };
                if (data.address) {
                  const addressFromEkyc = getInfoFormAddress(
                    data.address,
                    provinces.data
                  );
                  if (addressFromEkyc) {
                    profile.address_info.resident = addressFromEkyc;
                    setCity(addressFromEkyc.city);
                    setDistrict(addressFromEkyc.district);
                  }
                  const address = getStringFromAddress(addressFromEkyc);
                  if (addressFromEkyc && address) {
                    if (!addresses.includes(address)) {
                      profile.resident = OTHER;
                    } else {
                      profile.resident = address;
                    }
                  }
                }

                if (data.name) profile.full_name = data.name;
                if (data.id) profile.id_card_number = data.id;
                if (data.dob && checkValidDateFormat(data.dob))
                  profile.dob = dayjs(data.dob, 'DD/MM/YYYY');
                if (data.gender) profile.gender = data.gender;
              }
            }
            if (!profile.address_info.resident) delete profile.address_info;
            update(profile);
            setLoading(false);
          } else {
            setLoading(false);
            setError(t('ERROR_WHEN_UPLOAD_FILE'));
            return Promise.reject(dataUpload.reason);
          }
        })
        .catch((error) => {
          sendErrorLog('UPLOAD FRONT', error);
          setLoading(false);
          setError(t('ERROR_WHEN_UPLOAD_FILE'));
          if (error.error.code === EXPIRED_TOKEN) {
            navigate(`/login?isUpdate=true&phone=${phone}`);
            localStorage.removeItem('auth');
            localStorage.removeItem('notSubmitApplicationToken');
          }
        });
    },
    [
      addresses,
      handleLogUserAction,
      onChange,
      phone,
      setCity,
      setDistrict,
      t,
      update,
    ]
  );

  const handleUpload = useCallback(
    async (file: any) => {
      try {
        setLoading(true);
        setError(null);
        const compressImg = await imageCompression(file, {
          maxSizeMB: parseFloat(REACT_APP_REDUCE_LIVENESS_SIZE as string),
          // maxWidthOrHeight: 1024,
          useWebWorker: true,
        });

        if (value) {
          const activeValue = value?.find(
            (item: any) => item.status === IMAGE_STATUS.ACTIVE
          );
          await handleLogUserAction(activeValue?.url, 'remove');
          dispatch(updateRemovedImage(activeValue?.id));
        }

        if (type === EkycType.IdCardFront) {
          await uploadAndOcr(compressImg);
        } else {
          setError(null);
          const data = await uploadImage(
            compressImg,
            phone,
            true,
            defineFileFromType(from),
            profileId + '',
            submit_id,
            pap_user_account_id
          );

          const newValue = [
            ...(value?.map((item) => {
              return {
                id: item.id,
                status: 'REMOVED',
                url: item.url,
              };
            }) || []),
          ];
          newValue.push({
            id: data.data.id,
            status: data.data.status || 'ACTIVE',
            url: data.data.url,
          });
          onChange(newValue);
          await handleLogUserAction(data.data?.url, 'upload');
          setLoading(false);
        }
      } catch (error: any) {
        if (error.error.code === EXPIRED_TOKEN) {
          navigate(`/login?isUpdate=true&phone=${phone}`);
          localStorage.removeItem('auth');
          localStorage.removeItem('notSubmitApplicationToken');
        }
        sendErrorLog('UPLOAD', error);
        setLoading(false);
        setError(t('ERROR_WHEN_UPLOAD_FILE'));
      }
    },
    [handleLogUserAction, onChange, phone, t, type, uploadAndOcr, value]
  );
  return (
    <Spin spinning={loading}>
      <Upload
        onChange={(e) => handleUpload(e.file)}
        beforeUpload={() => false}
        maxCount={1}
        showUploadList={false}
        accept='image/*'
      >
        <IdCardImg
          width={160}
          height={96}
          preview={false}
          src={
            value?.find((item: any) => item.status === IMAGE_STATUS.ACTIVE)
              ?.url || fallback
          }
          signKey={value ? !!value[0]?.url : false}
        />
      </Upload>
      <div>
        <PAPError error={error} />
      </div>
    </Spin>
  );
};

const UploadIdCard = ({
  update,
  setCity,
  setDistrict,
  required,
  addresses,
  profileId,
  submit_id = 'unknown',
}: {
  update: (data: any) => void;
  setCity: (data: string) => void;
  setDistrict: (data: string) => void;
  required?: boolean;
  addresses: string[];
  profileId?: number;
  submit_id?: string;
}): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Container>
      <Title>{t('UPLOAD_ID_CARD')}</Title>
      <UploadContainer>
        <Form.Item
          name='id_card_front_document_imgs'
          rules={[{ required, message: t('PLEASE_UPLOAD_IMAGE') }]}
          label={t('FRONT_FACE')}
        >
          <UploadInput
            fallback='/FrontID.webp'
            type={EkycType.IdCardFront}
            update={update}
            setCity={setCity}
            setDistrict={setDistrict}
            addresses={addresses}
            profileId={profileId}
            t={t}
            from='FRONT_FACE'
            submit_id={submit_id}
          />
        </Form.Item>
        <Form.Item
          name='id_card_back_document_imgs'
          rules={[{ required, message: t('PLEASE_UPLOAD_IMAGE') }]}
          label={t('BACK_FACE')}
        >
          <UploadInput
            fallback='/BackID.webp'
            type={EkycType.IdCardBack}
            update={update}
            setCity={setCity}
            setDistrict={setDistrict}
            addresses={addresses}
            profileId={profileId}
            t={t}
            from='BACK_FACE'
            submit_id={submit_id}
          />
        </Form.Item>
      </UploadContainer>
    </Container>
  );
};

export default UploadIdCard;

const Container = styled.div``;

const Title = styled.h3`
  font-size: 0.75rem;
  font-weight: 500;
`;

const UploadContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const IdCardImg = styled(ImageSignedKey)`
  border-radius: 10px;
  object-fit: cover;
  cursor: pointer;
`;
