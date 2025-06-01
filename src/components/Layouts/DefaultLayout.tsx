import styled from "@mui/material/styles/styled";
import Box from "@mui/material/Box";
import type { FC, PropsWithChildren } from "react";
import { useModal } from "../../hooks/useModal";
import { Header } from "../Header";
import { ResponsiveNavigation } from "../Navigation/Navigation";
import { useMediaQuery } from "@mui/material";

type Props = PropsWithChildren<{ pageTitle: string }>;

export const DefaultLayout: FC<Props> = ({ children, pageTitle }) => {
  const sidebar = useModal();
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <BodyWrapper>
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { sm: 0 } }}>
        <ResponsiveNavigation sidebarOpen={sidebar.isOpen} setSidebarOpen={sidebar.setOpen} drawerWidth={drawerWidth} />
      </Box>
      <Box
        sx={{
          marginLeft: "auto",
          flexGrow: 1,
          p: isMobile ? 2 : 3,
          width: { xs: "100%", sm: "100%", md: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          color: "white",
        }}
      >
        <Header setSidebarOpen={sidebar.setOpen} pageTitle={pageTitle} />
        <Box component="main">{children}</Box>
      </Box>
    </BodyWrapper>
  );
};

const BodyWrapper = styled("div")`
  display: flex;
  min-height: 100vh;
  background: #1e1e1e;
`;

const drawerWidth = 240;
