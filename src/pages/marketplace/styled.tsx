import styled from "@mui/material/styles/styled";

export const WidgetsWrapper = styled("div")`
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;

  .widget {
    display: flex;
    flex-direction: column;
    flex: 1 1 0px;
  }
`;

export const MobileWidgetsWrapper = styled("div")`
  .widget-row {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    margin-bottom: 1rem;
    margin-top: 1rem;
  }
`;
