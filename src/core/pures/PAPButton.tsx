import { Button, ButtonProps } from "antd";
import styled from "styled-components";
import { logGAEvent } from "utils/googleAnalytics";

export type PAPButtonProps = {
  color?: string;
  gaTrack?: {
    event: string;
    properties?: { [key: string]: any };
  };
} & ButtonProps;

export default function PAPButton({
  color = "#5959F7",
  gaTrack,
  onClick,
  ...props
}: PAPButtonProps) {
  const handleClick = (e: any) => {
    if (gaTrack) {
      logGAEvent(gaTrack.event, {
        type: "Click button",
        ...gaTrack.properties,
      });
    }
    if (onClick) onClick(e);
  };

  return <StyledButton color={color} onClick={handleClick} {...props} />;
}

interface IStyledButton {
  color: string;
}

const StyledButton = styled(Button)<IStyledButton>`
  color: ${(props) => props.theme[props.color]};
  height: unset;
  padding: 0.65rem;
  font-weight: 600;
  border-radius: 0.75rem;
  border: none;
  &:hover,
  &:active {
    color: ${(props) => props.theme[props.color]} !important;
  }
`;
