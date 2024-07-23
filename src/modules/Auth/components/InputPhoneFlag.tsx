import PAPInput, { PAPInputProps } from 'core/pures/PAPInput/PAPInput';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { getLang } from 'utils/localStorage';
import { get } from 'lodash';
import languages from 'common/languages';

const InputPhoneFlag = (props: PAPInputProps): JSX.Element => {
  const { t } = useTranslation();

  const [selectedLang, setSelectedLang] = useState(getLang());

  useEffect(() => {
    setSelectedLang(getLang());
  }, [t]);

  return (
    <PAPInput
      prefix={
        <PrefixContainer>
          {get(languages, `${selectedLang}.flag`)}
          <PrefixPhone>
            {get(languages, `${selectedLang}.phoneCode`)}
          </PrefixPhone>
        </PrefixContainer>
      }
      {...props}
    />
  );
};

export default InputPhoneFlag;

const PrefixContainer = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PrefixPhone = styled.span`
  font-size: 14px;
`;
