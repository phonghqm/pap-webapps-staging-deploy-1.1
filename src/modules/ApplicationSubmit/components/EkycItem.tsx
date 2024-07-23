import styled from 'styled-components';
import { CircleNumber, Done } from 'core/icons';
import { EkycType } from '../enum';
import { createSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ImageSignedKey } from 'core/pures';

type EkycItemProps = {
  index: number;
  type: EkycType;
  title: string;
  description?: string;
  fallbackImg: string;
  src?: string;
  step: string;
};

function EkycItem({
  index,
  title,
  type,
  description,
  fallbackImg,
  src,
  step,
}: EkycItemProps): JSX.Element {
  const { t } = useTranslation();

  const { pathname } = useLocation();
  const navigate = useNavigate();

  const reTake = () => {
    navigate({
      pathname,
      search: createSearchParams({
        step,
        uploadedImage: src || '',
      }).toString(),
    });
  };

  return (
    <Container>
      {src ? <Done /> : <CircleNumber number={index} />}
      <Content>
        <Title>{title}</Title>
        <Description>{description}</Description>
        <ImageContainer>
          {type === EkycType.Portrait ? (
            <ImagePortrait
              width={153}
              height={153}
              preview={!!src}
              src={src || fallbackImg}
              signKey={!!src}
            />
          ) : (
            <ImageIdCard
              width={124}
              height={74}
              preview={!!src}
              src={src || fallbackImg}
              signKey={!!src}
            />
          )}
          {src && (
            <RetakeButtonContainer>
              <RetakeButton onClick={reTake}>{t('RETAKE')} &gt;</RetakeButton>
            </RetakeButtonContainer>
          )}
        </ImageContainer>
      </Content>
    </Container>
  );
}

export default EkycItem;

const Container = styled.div`
  display: flex;
`;

const Content = styled.div`
  margin-block: 0;
  margin-left: 1rem;
`;

const Title = styled.h3`
  margin-block: 0.1rem;
  font-size: 0.875rem;
  font-weight: 500;
`;

const Description = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme.grey7};
`;

const ImagePortrait = styled(ImageSignedKey)`
  border-radius: 10px;
  object-fit: cover;
`;

const ImageIdCard = styled(ImageSignedKey)`
  border-radius: 10px;
  object-fit: cover;
`;

const ImageContainer = styled.div`
  margin-block: 1rem;
  display: flex;
  justify-content: space-between;
  width: 280px;
`;

const RetakeButtonContainer = styled.div`
  display: flex;
  flex-direction: column-reverse;
`;

const RetakeButton = styled.span`
  color: ${props => props.theme.colorPrimary};
  font-weight: 600;
  font-size: 0.75rem;
  cursor: pointer;
`;
