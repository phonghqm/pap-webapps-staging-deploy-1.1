import { Spin, Upload } from 'antd';
import { UploadIcon } from 'core/icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

export default function UploadIdCard({
  handleUpload,
  loading = false,
}: {
  handleUpload: (e: any) => void;
  loading?: boolean;
}): JSX.Element {
  const { t } = useTranslation();

  return (
    <Spin spinning={loading}>
      <Upload
        onChange={e => handleUpload(e.file)}
        beforeUpload={() => false}
        maxCount={1}
        showUploadList={false}
        accept='image/*'
      >
        <Container>
          <UploadIcon />
          <Text>{t('UPLOAD')}</Text>
        </Container>
      </Upload>
    </Spin>
  );
}

const Container = styled.div`
  text-align: center;
  color: white;
  z-index: 2;
  cursor: pointer;
`;

const Text = styled.span`
  display: block;
`;
