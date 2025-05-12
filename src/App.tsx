import { ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type React from "react";
import ReactGA from "react-ga4";
import { WagmiProvider } from "wagmi";
import { State } from "./State";
import { config } from "./clients/wagmi";
import { darkTheme } from "./styles/themeOptions";

const trackingId = "G-TN08K48RMS";
ReactGA.initialize(trackingId);

export const App: React.FC = () => {
  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={darkTheme}>
          <State />
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
