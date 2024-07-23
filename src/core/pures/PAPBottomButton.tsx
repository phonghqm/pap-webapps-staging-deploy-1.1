import styled from 'styled-components';
import { ReactNode } from 'react';
import PAPButton, { PAPButtonProps } from './PAPButton';
import { ButtonHTMLType, ButtonType } from 'antd/es/button';
import PAPError from './PAPError';

type PAPBottomButtonProps = React.HTMLAttributes<HTMLDivElement> & {
  buttonProps?: PAPButtonProps;
  text: string;
  onClick?: () => any;
  type?: ButtonType;
  disabled?: boolean;
  loading?: boolean;
  htmlType?: ButtonHTMLType;
  error?: any;
  pre?: ReactNode;
};

const PAPBottomButton = ({
  buttonProps,
  text,
  onClick,
  type,
  disabled,
  loading,
  htmlType,
  error,
  pre,
  ...props
}: PAPBottomButtonProps): JSX.Element => {
  return (
    <ButtonContainer {...props} top={pre ? '0.25rem' : undefined}>
      {pre}
      <FullWidthButton
        autoFocus
        disabled={disabled}
        type={type}
        onClick={onClick}
        loading={loading}
        htmlType={htmlType}
        {...buttonProps}
      >
        {text}
      </FullWidthButton>
      <div>
        <PAPError error={error} />
      </div>
    </ButtonContainer>
  );
};

export default PAPBottomButton;

interface IButtonContainer {
  top?: string;
}

export const ButtonContainer = styled.div<IButtonContainer>`
  background-color: white;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  box-shadow: 0px -16px 24px -8px rgba(169, 174, 184, 0.24);
  padding: 1rem;
  z-index: 2;
  padding-inline: calc(8rem + 10px);
  text-align: right;
  ${props => (props.top ? `padding-top: ${props.top}` : '')};

  @media screen and (max-width: 1208px) {
    padding-inline: calc(2rem + 14px);
  }

  @media screen and (max-width: 1028px) {
    padding-inline: 2rem;
  }

  @media screen and (max-width: 768px) {
    padding-inline: 1rem;
    text-align: center;
  }
`;

const FullWidthButton = styled(PAPButton)`
  width: 200px;
  min-width: fit-content;
  outline: none !important;

  @media screen and (max-width: 768px) {
    width: 100%;
  }
`;
