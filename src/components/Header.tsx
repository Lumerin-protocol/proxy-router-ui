import styled from "@emotion/styled";
import { Bars3BottomLeftIcon } from "@heroicons/react/24/outline";
import { Toolbar, Typography, useMediaQuery } from "@mui/material";
import { useLocation } from "react-router";
import { LumerinIcon } from "../images";
import { PathName } from "../types/types";
import { ConnectWidget } from "./Widgets/ConnectWidget";

export const Header = (prop: { setSidebarOpen: (isOpen: boolean) => void }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <StyledToolbar>
      <button
        type="button"
        className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
        onClick={() => prop.setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3BottomLeftIcon className="h-8 w-8" aria-hidden="true" />
      </button>
      <PageTitle>{pageTitle}</PageTitle>
      {isMobile ? <LumerinIcon /> : <ConnectWidget />}
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
`;

const getPageTitle = (pathName: string) => {
  if (pathName === PathName.Marketplace) return "Marketplace";
  if (pathName === PathName.BuyerHub) return "Buyer Hub";
  if (pathName === PathName.SellerHub) return "Seller Hub";
  if (pathName === PathName.Landing) return "";
  return "";
};
