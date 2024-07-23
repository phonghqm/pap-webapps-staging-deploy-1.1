import { Form } from 'antd';
import { PAPUploadFiles } from 'core/pures';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const UploadPrescription = ({
  profileId,
}: {
  profileId: number;
}): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Container>
      <Title>{t('UPLOAD_PRESCRIPTION')}</Title>
      <Form.Item
        name='prescription'
        rules={[
          () => ({
            validator(_, value) {
              if (value?.length > 0) {
                return Promise.resolve();
              }
              return Promise.reject(t('PLEASE_UPDATE_IMAGE'));
            },
          }),
        ]}
      >
        <PAPUploadFiles from={'UPLOAD_PRESCRIPTION'} profile_id={profileId} />
      </Form.Item>
    </Container>
  );
};

export default UploadPrescription;

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
