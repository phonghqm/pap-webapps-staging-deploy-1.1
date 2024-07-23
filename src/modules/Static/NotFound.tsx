import { Result } from 'antd';
import { useTranslation } from 'react-i18next';

function NotFound(): JSX.Element {
  const { t } = useTranslation();
  return <Result status={404} title='404' subTitle={t('PAGE_NOT_FOUND')} />;
}

export default NotFound;
