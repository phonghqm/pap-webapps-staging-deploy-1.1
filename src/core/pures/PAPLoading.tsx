import { Spin } from 'antd';
import styled from 'styled-components';

const PAPLoading = ({
  size = 'large',
  top = 100,
}: {
  size?: 'large' | 'small' | 'default';
  top?: number;
}): JSX.Element => {
  return (
    <Container style={{ marginTop: top }}>
      <Spin size={size} />
    </Container>
  );
};

export default PAPLoading;

const Container = styled.div`
  display: flex;
  justify-content: center;
`;
