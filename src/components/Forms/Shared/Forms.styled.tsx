import styled from "@emotion/styled";

export const InputWrapper = styled.div`
  width: 100%;
  max-width: 300px;
  margin-top: 1.3rem;

  @media (max-width: 600px) {
    margin-top: 0;
  }
  label {
    font-size: 1rem;
  }
  .MuiTextField-root {
    width: 100%;
  }
`;
