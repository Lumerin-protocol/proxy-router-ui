import styled from "@mui/material/styles/styled";

export const InputWrapper = styled("div")`
  width: 100%;
  max-width: 400px;
  margin-top: 1.3rem;

  label {
    font-size: 1rem;
  }
  .MuiTextField-root {
    width: 100%;
  }
`;

export const ErrorWrapper = styled(InputWrapper)`
  max-width: unset;
  margin-top: 0.5rem;
`;
