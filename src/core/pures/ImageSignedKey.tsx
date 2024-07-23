import { Image, ImageProps } from 'antd';
import { useMemo } from 'react';
import styled from 'styled-components';
import { signedKeyUrl } from 'utils/helpers';

interface ImageSignedKeyProps extends ImageProps {
  signKey?: boolean;
  previewSrc?: string;
}

const ImageSignedKey = ({
  src,
  signKey = true,
  previewSrc,
  ...props
}: ImageSignedKeyProps): JSX.Element => {
  const signedUrl = useMemo(() => {
    if (!signKey) return src;
    return signedKeyUrl(src);
  }, [src, signKey]);

  const signedPreviewUrl = useMemo(() => {
    if (!signKey) return previewSrc;
    return signedKeyUrl(previewSrc);
  }, [previewSrc, signKey]);

  return (
    <ImageItem
      src={signedUrl}
      preview={{
        src: signedPreviewUrl,
      }}
      {...props}
    />
  );
};

export default ImageSignedKey;

const ImageItem = styled(Image)`
  object-fit: cover;
  border-radius: 8px;
`;
