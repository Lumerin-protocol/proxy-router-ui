import useMediaQuery from "@mui/material/useMediaQuery";
import ButtonGroup from "@mui/material/ButtonGroup";
import { AccountButton, ChainButton, ConnectorButton } from "./Widgets/ConnectWidget";
import { AddressLength } from "../types/types";
import { css } from "@mui/material/styles";

export const HeaderConnect = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <ButtonGroup
      css={css`
        gap: 1rem;
      `}
    >
      <AccountButton addressLength={isMobile ? AddressLength.SHORT : AddressLength.MEDIUM} />
      {!isMobile && (
        <>
          <ChainButton />
          <ConnectorButton />
        </>
      )}
    </ButtonGroup>
  );
};
