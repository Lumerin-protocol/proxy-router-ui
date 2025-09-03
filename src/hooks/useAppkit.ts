import { useCallback, useEffect } from "react";
import { useConnect, useDisconnect, useAccount, type Connector } from "wagmi";

interface WalletModalConfig {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export const useAppkit = (config?: WalletModalConfig) => {
  const { onConnect, onDisconnect, onError } = config || {};

  // Account state
  const { address, isConnected, connector } = useAccount();

  // Connection hooks
  const { connect: wagmiConnect, connectors, isPending: isConnecting, error: connectError } = useConnect();

  const { disconnect: wagmiDisconnect, isPending: isDisconnecting } = useDisconnect();

  // Modal state

  // Handle connection
  const connect = useCallback(
    (connectorId: string) => {
      const selectedConnector = connectors.find((c) => c.id === connectorId);
      if (selectedConnector) {
        wagmiConnect({ connector: selectedConnector });
      }
    },
    [connectors, wagmiConnect],
  );

  // Handle disconnection
  const disconnect = useCallback(() => {
    wagmiDisconnect();
  }, [wagmiDisconnect]);

  // Handle disconnection
  useEffect(() => {
    if (!isConnected && onDisconnect) {
      onDisconnect();
    }
  }, [isConnected, onDisconnect]);

  // Handle errors
  useEffect(() => {
    if (connectError && onError) {
      onError(connectError);
    }
  }, [connectError, onError]);

  return {
    // Connection state
    isConnected,
    address,
    connector,

    // Actions
    connect,
    disconnect,

    // Available connectors
    connectors,

    // Loading states
    isConnecting,
    isDisconnecting,

    // Error state
    error: connectError,
  };
};
