import { InputNumber, InputNumberProps } from 'antd';
import styled from 'styled-components';

type PAPInputNumberProps = {
  showControls?: boolean;
} & InputNumberProps;

const PAPInputNumber = ({
  showControls = false,
  ...props
}: PAPInputNumberProps): JSX.Element => {
  return (
    <InputNumberStyled
      inputMode='numeric'
      controls={showControls}
      formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      parser={(v: any) => parseInt(v?.replace(/\$\s?|(,*)/g, ''), 10) || 0}
      {...props}
    />
  );
};

export default PAPInputNumber;

const InputNumberStyled = styled(InputNumber)`
  padding: 6px 2px;
  border-radius: 0.75rem;
  width: 100%;
`;
