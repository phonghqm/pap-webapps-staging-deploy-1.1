import { Form } from 'antd';
import { IMAGE_STATUS } from 'common/constants';

import PAPUploadFilesV2 from 'core/pures/PAPUploadFilesV2';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const UploadPrescriptionV2 = ({
  profileId,
  submit_id = 'unknown',
}: {
  profileId: number | undefined;
  submit_id?: string;
}): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Container>
      <Title>{t('UPLOAD_PRESCRIPTION')}</Title>
      <Form.Item
        name='medical_indication_document_imgs'
        rules={[
          () => ({
            validator(_, value) {
              if (value && Array.isArray(value) && value.length > 0) {
                const activeImages = value.filter(
                  item => item.status === IMAGE_STATUS.ACTIVE
                );
                if (activeImages.length > 0) return Promise.resolve();
                return Promise.reject(t('PLEASE_UPDATE_IMAGE'));
              }
              return Promise.reject(t('PLEASE_UPDATE_IMAGE'));
            },
          }),
        ]}
      >
        <PAPUploadFilesV2
          from={'UPLOAD_PRESCRIPTION'}
          profile_id={profileId}
          submit_id={submit_id}
        />
      </Form.Item>
    </Container>
  );
};

export default UploadPrescriptionV2;

const Container = styled.div`
  margin-bottom: 20px;
`;

const Title = styled.h3`
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 0.5rem;

  &:before {
    display: inline-block;
    margin-inline-end: 4px;
    color: #e52e63;
    font-size: 14px;
    font-family: SimSun, sans-serif;
    line-height: 1;
    content: '*';
  }
`;
