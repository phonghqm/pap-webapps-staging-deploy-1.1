import { useEffect, useState } from 'react';
import { checkPermissionCamera } from 'utils/helpers';

type CamType = 'environment' | 'user';

const useCameraPermission = (type: CamType) => {
  const [hasPermission, setHasPermission] = useState(true);

  useEffect(() => {
    checkPermissionCamera(type).then(has => {
      setHasPermission(has);
    });
  }, [type]);

  return hasPermission;
};

export default useCameraPermission;
