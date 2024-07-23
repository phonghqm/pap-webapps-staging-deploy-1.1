import { Input, InputProps, InputRef } from 'antd';
import { forwardRef } from 'react';
import styled from 'styled-components';

export type PAPInputProps = {
  isTel?: boolean;
} & InputProps &
  React.RefAttributes<InputRef>;

const PAPInput = forwardRef(
  (
    { isTel = false, ...props }: PAPInputProps,
    ref: React.ForwardedRef<any>
  ): JSX.Element => {
    const telProps = isTel
      ? ({
          inputMode: 'numeric',
        } as any)
      : {};

    return <StyledInput {...telProps} {...props} ref={ref} />;
  }
);

export default PAPInput;

const StyledInput = styled(Input)`
  padding: 11px;
  border-radius: 0.75rem;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none !important;
    margin: 0 !important;
  }

  &[type='number'] {
    -moz-appearance: textfield !important;
  }
`;
