import type React from "react";
import { MouseEventHandler, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { type Card, FinishedContracts, RunningContracts } from "../../components/Cards/PurchasedContracts";
import { DefaultLayout } from "../../components/Layouts/DefaultLayout";
import { SortToolbar } from "../../components/SortToolbar";
import { Spinner } from "../../components/Spinner.styled";
import { TabSwitch } from "../../components/TabSwitch.Styled";
import type { EthereumGateway } from "../../gateway/ethereum";
import { useContracts } from "../../hooks/data/useContracts";
import { useSimulatedBlockchainTime } from "../../hooks/data/useSimulatedBlockchainTime";
import { ContractState, CurrentTab } from "../../types/types";
import { getProgressPercentage, sortContracts } from "../../utils/utils";

type Props = {
  web3Gateway: EthereumGateway;
};

export const BuyerHub: React.FC<Props> = ({ web3Gateway }) => {
  const { address: userAccount } = useAccount();
  const contractsQuery = useContracts({ userAccount });

  const [activeOrdersTab, setActiveOrdersTab] = useState<string>(CurrentTab.Running);
  const [runningSortType, setRunningSortType] = useState("");
  const [completedSortType, setCompletedSortType] = useState("");

  const runningContracts = useMemo(() => {
    if (!contractsQuery.data) return [];
    const buyerOrders = contractsQuery.data.filter(
      (contract) => contract.buyer === userAccount && contract.state === ContractState.Running,
    );

    const runningContracts = buyerOrders.filter((contract) => contract.state === ContractState.Running);
    return sortContracts(runningSortType, runningContracts);
  }, [contractsQuery.data, runningSortType]);

  const completedContracts = useMemo(() => {
    if (!contractsQuery.data) return [];
    const buyerOrders = contractsQuery.data.filter((contract) => contract?.history?.length).flatMap((c) => c.history!);

    return sortContracts(completedSortType, buyerOrders);
  }, [contractsQuery.data, completedSortType]);

  const handleRunningTab = () => {
    setActiveOrdersTab(CurrentTab.Running);
  };

  const handleCompletedTab = () => {
    setActiveOrdersTab(CurrentTab.Completed);
  };

  const currentBlockTimestamp = useSimulatedBlockchainTime();

  const runningContractsCards: Card[] = runningContracts.map((contract) => {
    const endTime = Number(contract.timestamp) + Number(contract.length);
    const progressPercentage = getProgressPercentage(
      contract.state,
      contract.timestamp,
      Number(contract.length),
      Number(currentBlockTimestamp),
    );

    const poolInfoString = localStorage.getItem(contract.id!);
    const poolInfoParsed = poolInfoString ? JSON.parse(poolInfoString) : {};
    const { poolAddress = "", username = "" } = poolInfoParsed;

    return {
      contractAddr: contract.id!,
      startTime: Number(contract.timestamp!),
      endTime: endTime,
      progressPercentage: progressPercentage,
      speedHps: String(contract.speed!),
      price: contract.price!,
      fee: contract.fee!,
      length: String(contract.length!),
      poolAddress: poolAddress,
      poolUsername: username,
    };
  });

  const completedContractsCards: Card[] = completedContracts.map((contract) => {
    const poolInfoString = localStorage.getItem(contract.id!);
    const poolInfoParsed = poolInfoString ? JSON.parse(poolInfoString) : {};
    const { poolAddress = "", username = "" } = poolInfoParsed;

    return {
      contractAddr: contract.id!,
      startTime: Number(contract.purchaseTime!),
      endTime: Number(contract.endTime!),
      progressPercentage: 100,
      speedHps: String(contract.speed!),
      price: contract.price!,
      fee: "0",
      length: String(contract.length!),
      poolAddress: poolAddress,
      poolUsername: username,
    };
  });

  return (
    <DefaultLayout>
      <TabSwitch>
        <button
          id="running"
          className={activeOrdersTab === CurrentTab.Running ? "active" : ""}
          onClick={handleRunningTab}
        >
          Active <span>{contractsQuery.isLoading ? "" : runningContracts.length}</span>
        </button>
        <button
          id="completed"
          className={activeOrdersTab === CurrentTab.Completed ? "active" : ""}
          onClick={handleCompletedTab}
        >
          Completed <span>{contractsQuery.isLoading ? "" : completedContracts.length}</span>
        </button>
        <span className="glider"></span>
      </TabSwitch>
      <div className="flex flex-col items-center">
        {activeOrdersTab === CurrentTab.Running && (
          <>
            {runningContracts.length > 0 ? (
              <>
                <SortToolbar
                  pageTitle="Running Contracts"
                  sortType={runningSortType}
                  setSortType={setRunningSortType}
                />
                <RunningContracts
                  sortType={runningSortType}
                  contracts={runningContractsCards}
                  web3Gateway={web3Gateway}
                />
              </>
            ) : (
              contractsQuery.isSuccess && <p className="text-2xl text-white">You have no running contracts.</p>
            )}
          </>
        )}
        {activeOrdersTab === CurrentTab.Completed && (
          <>
            {completedContracts.length > 0 ? (
              <>
                <SortToolbar
                  pageTitle="Finished Contracts"
                  sortType={completedSortType}
                  setSortType={setCompletedSortType}
                />
                <FinishedContracts contracts={completedContractsCards} sortType={completedSortType} />
              </>
            ) : (
              contractsQuery.isSuccess && <p className="text-2xl text-white">You have no completed contracts.</p>
            )}
          </>
        )}
        {contractsQuery.isLoading && (
          <div className="spinner">
            <Spinner />
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};
