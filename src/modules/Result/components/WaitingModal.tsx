import { CloseOutlined } from '@ant-design/icons';
import { COMMON_IMAGE } from 'common/constants';
import { PAPButton } from 'core/pures';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

export default function WaitingModal({
  onClose,
  type,
}: {
  onClose: () => void;
  type?: 'submit' | 'update';
}) {
  const { t } = useTranslation();

  const [title, img] = useMemo(
    () => [
      t(type === 'submit' ? 'WAIT_A_MINUTE' : 'UPDATE_SUCCESS'),
      type === 'submit' ? COMMON_IMAGE.WAITING : COMMON_IMAGE.UPDATE_SUCCESS,
    ],
    [type, t]
  );

  return (
    <Container>
      <FlexRight>
        <CloseOutlined onClick={onClose} style={{ cursor: 'pointer' }} />
      </FlexRight>
      <Title>{title}</Title>
      <WaitingImg src={img} />
      <Description>{t('WAITING_DESCRIPTION')}</Description>
      <Description>{t('MONDAY_TO_FRIDAY')}</Description>

      <StyledPAPButton type='primary' onClick={onClose}>
        {t('AGREE')}
      </StyledPAPButton>
    </Container>
  );
}
// export const Annouce = styled.p`
//   margin: 0.25rem;
//   font-size: 0.75rem;
//   font-weight: 400;
//   color: #ff0000;
// `;

export const Container = styled.div`
  text-align: center;
`;

export const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
`;

const WaitingImg = styled.img``;

export const Description = styled.p`
  margin: 0.25rem;
  font-size: 0.75rem;
  font-weight: 400;
  color: ${props => props.theme.grey7};
`;
// export const Annouce = styled.p`
//   margin: 0.25rem;
//   font-size: 0.75rem;
//   font-weight: 400;
//   color: #ff0000;
// `;

const StyledPAPButton = styled(PAPButton)`
  width: 100%;
  margin-block: 1rem;
`;

const FlexRight = styled.div`
  display: flex;
  justify-content: right;
`;
