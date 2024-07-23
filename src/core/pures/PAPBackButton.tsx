import { ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { logGAEvent } from 'utils/googleAnalytics';

type PAPBackButtonProps = {
  onClick: () => void;
  gaTrack?: {
    event: string;
    properties?: { [key: string]: any };
  };
};

const PAPBackButton = ({
  onClick,
  gaTrack,
}: PAPBackButtonProps): JSX.Element => {
  const { t } = useTranslation();

  const handleClick = () => {
    if (gaTrack) {
      logGAEvent(gaTrack.event, {
        type: 'Click button',
        ...gaTrack.properties,
      });
    }
    onClick && onClick();
  };

  return (
    <Container>
      <ButtonContainer onClick={handleClick}>
        <ArrowLeftOutlined /> <BackText>{t('BACK')}</BackText>
      </ButtonContainer>
    </Container>
  );
};

export default PAPBackButton;

const Container = styled.div`
  margin-left: 8rem;
  margin-top: 2rem;
  width: fit-content;

  @media screen and (max-width: 1208px) {
    margin-left: 4rem;
  }

  @media screen and (max-width: 1110px) {
    display: none;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  color: ${props => props.theme.colorPrimary};
  cursor: pointer;
  font-weight: 600;
`;

const BackText = styled.span`
  padding-left: 0.5rem;
`;
