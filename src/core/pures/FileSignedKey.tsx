import { FilePdfOutlined } from '@ant-design/icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { signedKeyUrl } from 'utils/helpers';

interface FileSignedKeyProps {
  src: string;
}

const FileSignedKey = ({ src }: FileSignedKeyProps): JSX.Element => {
  const { t } = useTranslation();
  const signedUrl = useMemo(() => signedKeyUrl(src), [src]);

  return (
    <PdfFile href={signedUrl} target='_blank'>
      <FilePdfOutlined />
      <Text>{t('FILE')}</Text>
    </PdfFile>
  );
};

export default FileSignedKey;

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
