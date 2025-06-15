import ThemeProvider from "@mui/material/styles/ThemeProvider";
import { darkTheme } from "./styles/themeOptions";
import { Router } from "./Router";
import useAnalytics from "./hooks/useAnalytics";
import type { FC } from "react";

export const App: FC = () => {
  useAnalytics({ loadOn: "idle" });
  return (
    // <WagmiProvider config={config}>
    // <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={darkTheme}>
      <Router />
    </ThemeProvider>
    // </QueryClientProvider>
    // </WagmiProvider>
  );
};
