import { Avatar, AvatarProps } from 'antd';
import { useMemo } from 'react';
import { signedKeyUrl } from 'utils/helpers';

interface AvatarSignedKeyProps extends AvatarProps {
  src?: string | null;
}

const AvatarSignedKey = ({
  src,
  ...props
}: AvatarSignedKeyProps): JSX.Element => {
  const signedUrl = useMemo(() => {
    if (!src) return undefined;
    return signedKeyUrl(src);
  }, [src]);

  return <Avatar src={signedUrl} {...props} />;
};

export default AvatarSignedKey;
