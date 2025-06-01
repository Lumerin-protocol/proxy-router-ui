import styled from "@mui/material/styles/styled";
import ToggleButton from "@mui/material/ToggleButton";
import type { ReactNode } from "react";

export const ToggleButtonIcon = (props: {
  value: NonNullable<unknown>;
  icon: ReactNode;
  text: string;
}) => {
  return (
    <ToggleButtonStyled value={props.value} size="medium">
      {props.icon}
      <span>{props.text}</span>
    </ToggleButtonStyled>
  );
};

const ToggleButtonStyled = styled(ToggleButton)`
  display: flex;
  gap: 1em;
  align-items: center;
  justify-content: center;

  svg {
    fill: #fff;
  }
`;

export const SellerFilters = styled("div")`
  display: flex;
  width: 100%;
`;

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
