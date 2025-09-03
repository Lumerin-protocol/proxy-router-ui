import styled from "@mui/material/styles/styled";
import Tooltip from "@mui/material/Tooltip";
import type { ComponentProps } from "react";

export const FormButtonsWrapper = styled("div")`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
`;

export const Button = styled("button")`
  border-radius: 8px;
  padding: 0.5rem 1rem;
  outline: none;
  display: flex;
  flex-direction: row;
  flex-wrap: no-wrap;
  justify-content: center;
  align-items: center;
  font-weight: 500;
  &:not(:last-child) {
    margin-right: 1rem;
  }
`;

export const DisabledButton = styled(Button)`
  color: black;
  background: grey;
  box-shadow: none;
  cursor: not-allowed;
`;

export const SecondaryButton = styled(Button)`
  color: #fff;
  background: none;
  border: 2px solid #fff;
`;

export const CancelButton = styled(Button)`
  color: red;
  border: 2px solid red;
`;

type PrimaryButtonProps = ComponentProps<typeof PrimaryButtonComponent> & {
  disabledText?: string;
  tooltipText?: string;
};

export const PrimaryButton = ({ disabledText, disabled, tooltipText, ...props }: PrimaryButtonProps) => {
  const button = <PrimaryButtonComponent disabled={disabled} {...props} />;

  if (disabled && disabledText) {
    return <Tooltip title={disabledText}>{button}</Tooltip>;
  }

  if (tooltipText) {
    return <Tooltip title={tooltipText}>{button}</Tooltip>;
  }

  return button;
};

const PrimaryButtonComponent = styled(Button, {
  shouldForwardProp: (prop) => typeof prop === "string" && !prop.startsWith("$"),
})<{ $hoverText?: string }>`
  color: #fff;
  background-color: #4c5a5f;
  position: relative;
  cursor: pointer;

  &:disabled {
    background-color: rgb(84, 90, 92);
    color: rgb(163, 163, 163);
    cursor: not-allowed;
  }

  ${({ $hoverText }) =>
    $hoverText &&
    `
      &:hover:after {
        content: "${$hoverText}";
      }
    `}

  &:after {
    position: absolute;
    bottom: calc(100% + 0.5em);
    width: max-content;
    padding: 0.5em;
    border-radius: 0.5em;
    background-color: rgba(0, 0, 0, 0.9);
    color: #ccc;
    font-size: 0.8rem;
    visibility: hidden;
    transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
    opacity: 0;
  }
  &:hover:after {
    visibility: visible;
    opacity: 1;
  }
`;
