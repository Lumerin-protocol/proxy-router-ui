/* eslint-disable react-hooks/exhaustive-deps */
import type React from "react";
import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { AvailableContracts } from "../../components/Cards/AvailableContracts";
import { DefaultLayout } from "../../components/Layouts/DefaultLayout";
import { BuyerOrdersWidget } from "../../components/Widgets/BuyerOrdersWidget";
import { MarketplaceStatistics } from "../../components/Widgets/MarketplaceStatistics";
import { MessageWidget } from "../../components/Widgets/MessageWidget";
import { MobileWalletInfo } from "../../components/Widgets/MobileWalletInfo";
import { WalletBalanceWidget } from "../../components/Widgets/WalletBalanceWidget";
import type { EthereumGateway } from "../../gateway/ethereum";
import { useBuyerContracts } from "../../hooks/data/useContracts";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { ContractState } from "../../types/types";
import { sortContracts } from "../../utils/utils";
import { MobileWidgetsWrapper, WidgetsWrapper } from "./styled";

interface Props {
  web3Gateway: EthereumGateway;
}

export const Marketplace: React.FC<Props> = ({ web3Gateway }) => {
  const { address: userAccount } = useAccount();
  const contractsQuery = useBuyerContracts({ address: userAccount });
  const [sortType, setSortType] = useState("");

  const isMobile = useMediaQuery("(max-width: 768px)");

  const availableContracts = useMemo(() => {
    if (!contractsQuery.data) return [];
    const usersAvailableContracts = contractsQuery.data.filter((contract) => {
      return contract.state === ContractState.Available && contract.seller !== userAccount;
    });
    return sortContracts(sortType, usersAvailableContracts);
  }, [contractsQuery.data, userAccount, sortType]);

  if (isMobile) {
    return (
      <DefaultLayout>
        <MobileWidgetsWrapper>
          <div className="widget-row">
            <MobileWalletInfo walletAddress={userAccount || ""} isMobile={isMobile} />
            <WalletBalanceWidget />
          </div>
        </MobileWidgetsWrapper>
        <MessageWidget isMobile={isMobile} />
        <AvailableContracts
          web3Gateway={web3Gateway}
          contracts={availableContracts}
          loading={contractsQuery.isLoading}
          setSortType={setSortType}
          sortType={sortType}
        />
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <WidgetsWrapper>
        <MessageWidget isMobile={isMobile} />
        <WalletBalanceWidget />
        <BuyerOrdersWidget isLoading={contractsQuery.isLoading} contracts={contractsQuery.data || []} />
        <MarketplaceStatistics isLoading={contractsQuery.isLoading} contracts={contractsQuery.data || []} />
      </WidgetsWrapper>
      <AvailableContracts
        contracts={availableContracts}
        loading={contractsQuery.isLoading}
        setSortType={setSortType}
        sortType={sortType}
        web3Gateway={web3Gateway}
      />
    </DefaultLayout>
  );
};
