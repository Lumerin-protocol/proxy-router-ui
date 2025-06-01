import { Bars3BottomLeftIcon } from "@heroicons/react/24/outline";
import styled from "@mui/material/styles/styled";
import useMediaQuery from "@mui/material/useMediaQuery";
import ButtonGroup from "@mui/material/ButtonGroup";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import { AccountButton, ChainButton, ConnectorButton } from "./Widgets/ConnectWidget";
import { AddressLength } from "../types/types";

type Props = {
  setSidebarOpen: (isOpen: boolean) => void;
  pageTitle: string;
};

export const Header = (props: Props) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <StyledToolbar>
      <button
        type="button"
        className="border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
        onClick={() => props.setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3BottomLeftIcon className="h-8 w-8" aria-hidden="true" />
      </button>
      <PageTitle>{props.pageTitle}</PageTitle>
      <ButtonGroup>
        <AccountButton addressLength={isMobile ? AddressLength.SHORT : AddressLength.MEDIUM} />
        {!isMobile && (
          <>
            <ChainButton />
            <ConnectorButton />
          </>
        )}
      </ButtonGroup>
    </StyledToolbar>
  );
};

const StyledToolbar = styled(Toolbar)`
  display: flex;
  justify-content: space-between;
  padding: 0 !important;
`;

const PageTitle = styled(Typography)`
  color: #fff;
  font-weight: 600;
  font-family: Raleway, sans-serif;
  font-size: 2rem;

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;
