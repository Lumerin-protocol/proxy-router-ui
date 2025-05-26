import styled from "@emotion/styled";

export const FormButtonsWrapper = styled.div`
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

export const Button = styled.button`
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

export const PrimaryButton = styled(Button)`
  color: #fff;
  background-color: #4c5a5f;
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
