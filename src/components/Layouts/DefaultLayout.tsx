import styled from "@emotion/styled";
import { Box } from "@mui/material";
/* eslint-disable react-hooks/exhaustive-deps */
import React, { type FC, type PropsWithChildren } from "react";
import { useModal } from "../../hooks/useModal";
import { Header } from "../Header";
import { ResponsiveNavigation } from "../Navigation/Navigation";

export const DefaultLayout: FC<PropsWithChildren> = ({ children }) => {
  const sidebar = useModal();

  return (
    <BodyWrapper>
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { sm: 0 } }}>
        <ResponsiveNavigation sidebarOpen={sidebar.isOpen} setSidebarOpen={sidebar.setOpen} drawerWidth={drawerWidth} />
      </Box>
      <Box
        sx={{
          marginLeft: "auto",
          flexGrow: 1,
          p: 3,
          width: { xs: `100%`, sm: `100%`, md: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
        }}
      >
        <Header setSidebarOpen={sidebar.setOpen} />
        <Box component="main">{children}</Box>
      </Box>
    </BodyWrapper>
  );
};

const BodyWrapper = styled.div`
	display: flex;
	min-height: 100vh;
	background: #1e1e1e;
`;

const drawerWidth = 240;
