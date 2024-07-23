import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCoordination } from 'utils/helpers';

function useCoordination() {
  const { t } = useTranslation();
  const [coor, setCoor] = useState([0, 0]);
  const [error, setError] = useState('');

  useEffect(() => {
    getCoordination(t('SOME_THING_WENT_WRONG'))
      .then(res => {
        setCoor(res);
      })
      .catch(err => {
        console.log('Error when get geography location: ', err);
        setError(err);
      });
  }, [t]);

  return [coor, error] as [[number, number], string];
}

export default useCoordination;
