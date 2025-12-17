import React from "react";
import { faDiscord } from "@fortawesome/free-brands-svg-icons/faDiscord";
import { faMedium } from "@fortawesome/free-brands-svg-icons/faMedium";
import { faTelegram } from "@fortawesome/free-brands-svg-icons/faTelegram";
import { faTiktok } from "@fortawesome/free-brands-svg-icons/faTiktok";
import { faXTwitter } from "@fortawesome/free-brands-svg-icons/faXTwitter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FlagCircleIcon from "@mui/icons-material/FlagCircle";
import HelpIcon from "@mui/icons-material/Help";
import ShieldIcon from "@mui/icons-material/Shield";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Drawer from "@mui/material/Drawer";
import SellerIconActive from "../../images/icons/seller-blue.png";
import SellerIconInactive from "../../images/icons/seller-grey.png";
import { Link, useLocation, useNavigate } from "react-router";
import BuyerIconActive from "../../images/icons/buyer-blue.png";
import BuyerIconInactive from "../../images/icons/buyer-grey.png";
import LogoIcon from "../../images/icons/nav-logo-white.png";
import MarketplaceIconActive from "../../images/icons/store-blue.png";
import MarketplaceIconInactive from "../../images/icons/store-grey.png";
import { PathName } from "../../types/types";
import { DrawerContent, Socials } from "./Navigation.styled";

// Navigation setup
interface Navigation {
  name: string;
  to: string;
  activeIcon: string;
  inactiveIcon: string;
  current: boolean;
  customIcon?: (props: { item: Navigation }) => React.ReactElement;
}

export const ResponsiveNavigation = (prop: {
  sidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  drawerWidth: number;
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navigation: Navigation[] = [
    {
      name: "Marketplace",
      to: PathName.Marketplace,
      activeIcon: MarketplaceIconActive,
      inactiveIcon: MarketplaceIconInactive,
      current: location.pathname === PathName.Marketplace,
    },
    {
      name: "Buyer Hub",
      to: PathName.BuyerHub,
      activeIcon: BuyerIconActive,
      inactiveIcon: BuyerIconInactive,
      current: location.pathname === PathName.BuyerHub,
    },
    {
      name: "Seller Hub",
      to: PathName.SellerHub,
      activeIcon: SellerIconActive,
      inactiveIcon: SellerIconInactive,
      current: location.pathname === PathName.SellerHub,
    },
    {
      name: "Validator Hub",
      to: PathName.ValidatorHub,
      activeIcon: SellerIconActive,
      inactiveIcon: SellerIconInactive,
      current: location.pathname === PathName.ValidatorHub,
    },
    {
      name: "Futures",
      to: PathName.Futures,
      activeIcon: "TrendingUp",
      inactiveIcon: "TrendingUp",
      current: location.pathname === PathName.Futures,
      customIcon: (props: { item: Navigation }) => <TrendingUpIcon style={{ color: "#c2c9d6", fontSize: "24px" }} />,
    },
  ];

  const drawer = (
    <DrawerContent>
      <div className="top">
        <Link to={PathName.Landing}>
          <img src={LogoIcon} alt="" className="menu-icon" style={{ width: "100%" }} />
        </Link>
        <nav>
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.to}
              // className={item.current ? 'text-lumerin-dark-blue' : 'text-lumerin-inactive-text'}
              onClick={() => {
                prop.setSidebarOpen(false);
                navigate(item.to);
              }}
            >
              {/* <img src={item.current ? item.activeIcon : item.inactiveIcon} alt='' /> */}
              {item.customIcon ? item.customIcon({ item }) : <img src={item.inactiveIcon} alt="" />}
              <span className="item-name" style={{ fontWeight: item.current ? 700 : 400 }}>
                {item.name}
              </span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="bottom">
        <nav className="resources">
          <h3>Resources</h3>
          <a href={`${process.env.REACT_APP_GITBOOK_URL}`} target="_blank" rel="noreferrer">
            <HelpIcon style={{ fill: "#509EBA" }} />
            <span className="item-name">Help</span>
          </a>
          <a href="https://github.com/Lumerin-protocol/proxy-router-ui/issues" target="_blank" rel="noreferrer">
            <FlagCircleIcon style={{ fill: "#509EBA" }} />
            <span className="item-name">Report issue</span>
          </a>
          <a href="https://lumerin.io/privacy-policy" target="_blank" rel="noreferrer">
            <ShieldIcon style={{ fill: "#509EBA" }} />
            <span className="item-name">Privacy Policy</span>
          </a>
        </nav>
        <div className="version">Version: {process.env.REACT_APP_VERSION}</div>
        <Socials>
          {[
            { link: "https://discord.gg/lumerin", icon: faDiscord },
            { link: "https://titanmining.medium.com", icon: faMedium },
            { link: "https://t.me/LumerinOfficial", icon: faTelegram },
            { link: "http://twitter.com/hellolumerin", icon: faXTwitter },
            { link: "https://www.tiktok.com/@hellolumerin_", icon: faTiktok },
          ].map((item) => (
            <a href={item.link} target="_blank" rel="noreferrer" key={item.link}>
              <FontAwesomeIcon icon={item.icon} color="#fff" />
            </a>
          ))}
        </Socials>
      </div>
    </DrawerContent>
  );
  return (
    <>
      <Drawer
        variant="temporary"
        anchor="left"
        open={prop.sidebarOpen}
        onClose={() => prop.setSidebarOpen(false)}
        transitionDuration={{ appear: 500, enter: 500, exit: 500 }}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: prop.drawerWidth },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: prop.drawerWidth,
            border: "none",
            backgroundColor: "rgba(79, 126, 145, 0.04)",
            background: "radial-gradient(circle, rgba(0, 0, 0, 0) 36%, rgba(255, 255, 255, .05) 100%)",
            // borderRight: 'linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(171,171,171,1) 100%)',
            borderRight: "rgba(171,171,171,1) 1px solid",
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </>
  );
};
