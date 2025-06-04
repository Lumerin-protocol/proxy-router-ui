import styled from "@mui/material/styles/styled";

export const SellerActions = styled("div")`
  display: flex;
  justify-content: flex-end;
  width: 100%;

  .create-button {
    justify-self: flex-end;
    display: flex;
    justify-content: center;
    align-items: center;

    .add-icon {
      margin-bottom: 2px;
      font-size: 1.2rem;
      margin-right: 10px;
    }
  }
`;

export const SellerToolbar = styled("div")`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 2rem;
  margin-bottom: 1rem;
`;
