import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const VERSION = process.env.REACT_APP_VERSION;

export default function PapVersion() {
  const { t } = useTranslation();

  return (
    <Version>
      {t('VERSION')}: {VERSION}
    </Version>
  );
}

const Version = styled.div`
  position: absolute;
  bottom: 20px;
  left: 30px;
  z-index: 5;
  color: ${props => props.theme.grey5};
  @media only screen and (max-width: 768px) {
    font-size: 12px;
    bottom: 10px;
    left: 15px;
  }
`;
