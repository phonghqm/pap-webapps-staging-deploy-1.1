import { useEffect } from 'react';
import { logGAEvent } from 'utils/googleAnalytics';

const useTrackViewPage = (page: string) => {
  useEffect(() => {
    logGAEvent(page, {
      type: 'View page',
    });
  }, [page]);

  return null;
};

export default useTrackViewPage;
