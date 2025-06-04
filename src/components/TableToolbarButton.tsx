import { PrimaryButton } from "./Forms/FormButtons/Buttons.styled";
import styled from "@mui/material/styles/styled";

export const TableToolbarButton = styled(PrimaryButton)`
  @media (max-width: 410px) {
    font-size: 0.85rem;
    padding: 0.3rem 0.4rem 0.3rem 0.2rem;
    gap: 0.1rem;
    height: 56px;

    &:not(:last-child) {
      margin-right: 0.7rem;
    }
  }
`;
