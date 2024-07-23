import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { getErrorMessage } from 'utils/errors';

const PAPError = ({ error }: { error?: any }): JSX.Element | null => {
  const { t } = useTranslation();

  if (!error) return null;
  return (
    <Error>{t(`${getErrorMessage(t('SOME_THING_WENT_WRONG'), error)}`)}</Error>
  );
};

export default PAPError;

const Error = styled.span`
  color: ${props => props.theme.red};
  font-size: 0.75rem;
  @media screen and (max-width: 768px) {
    font-size: 0.625rem;
  }
`;
