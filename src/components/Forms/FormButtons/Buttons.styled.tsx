import { css } from "@mui/material/styles";
import styled from "@mui/material/styles/styled";

export const FormButtonsWrapper = styled("div")`
  display: flex;
  flex-direction: row;
  margin-top: 1.5rem;

  button {
    flex: auto;
  }
  & button:not(:last-child) {
    margin-right: 1rem;
  }
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
  @media (max-width: 410px) {
    font-size: 0.85rem;
    padding: 1rem 1rem;
  }
`;

export const PrimaryButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "$disabledText",
})<{ $disabledText?: string }>`
  color: #fff;
  background-color: #4c5a5f;
  position: relative;
  &:disabled {
    background-color: rgb(84, 90, 92);
    color: rgb(163, 163, 163);
    cursor: not-allowed;
  }
  ${({ $disabledText }) =>
    $disabledText &&
    `
      &:disabled:after {
        content: "${$disabledText}";
      }
    `}

  &:disabled:after {
    position: absolute;
    bottom: calc(100% + 0.5em);
    left: 0;
    width: 100%;
    padding: 0.5em;
    border-radius: 0.5em;
    background-color: rgba(0, 0, 0, 0.9);
    font-size: 0.8rem;
    visibility: hidden;
    transition: opacity 0.2s ease-in-out;
    opacity: 0;
  }
  &:disabled:hover:after {
    visibility: visible;
    opacity: 1;
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
