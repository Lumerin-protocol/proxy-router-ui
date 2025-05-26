import { useMemo, useState, type FC } from "react";
import { useAccount } from "wagmi";
import { Card, type CardData } from "../../components/Cards/PurchasedContracts";
import { DefaultLayout } from "../../components/Layouts/DefaultLayout";
import { SortToolbar } from "../../components/SortToolbar";
import { Spinner } from "../../components/Spinner.styled";
import { TabSwitch } from "../../components/TabSwitch.Styled";
import type { EthereumGateway } from "../../gateway/ethereum";
import { useBuyerContracts } from "../../hooks/data/useContracts";
import { ContractState, CurrentTab } from "../../types/types";
import { getProgressPercentage, sortContracts } from "../../utils/utils";
import { getPoolInfo } from "../../gateway/localStorage";
import { useModal } from "../../hooks/useModal";
import { ModalItem } from "../../components/Modal";
import { BuyerEditForm } from "../../components/Forms/BuyerEditForm";
import { CancelForm } from "../../components/Forms/CancelForm";
import { ContractCards } from "../../components/Cards/PurchasedContracts.styled";

type Props = {
  web3Gateway: EthereumGateway;
};

export const BuyerHub: FC<Props> = ({ web3Gateway }) => {
  const { address: userAccount } = useAccount();
  const contractsQuery = useBuyerContracts({ address: userAccount });

  const editModal = useModal();
  const cancelModal = useModal();
  const [contractId, setContractId] = useState<string | null>(null);

  const [activeOrdersTab, setActiveOrdersTab] = useState<string>(CurrentTab.Running);
  const [runningSortType, setRunningSortType] = useState("");
  const [completedSortType, setCompletedSortType] = useState("");
  const currentBlockTimestamp = new Date().getTime() / 1000;

  const runningContracts = useMemo(() => {
    if (!contractsQuery.data) return [];
    const buyerOrders = contractsQuery.data.filter(
      (contract) => contract.buyer === userAccount && contract.state === ContractState.Running,
    );

    return sortContracts(runningSortType, buyerOrders);
  }, [contractsQuery.data, runningSortType]);

  const completedContracts = useMemo(() => {
    if (!contractsQuery.data) return [];

    const buyerOrders = contractsQuery.data
      .flatMap((c) => c.history!)
      .filter((c) => Number(c.endTime) < currentBlockTimestamp);

    return sortContracts(completedSortType, buyerOrders);
  }, [contractsQuery.data, completedSortType]);

  const runningContractsCards: CardData[] = runningContracts.map((contract) => {
    const endTime = Number(contract.timestamp) + Number(contract.length);
    const progressPercentage = getProgressPercentage(
      contract.state,
      contract.timestamp,
      Number(contract.length),
      Number(currentBlockTimestamp),
    );

    const poolInfo = getPoolInfo({
      contractId: contract.id,
      startedAt: BigInt(contract.timestamp),
    });

    return {
      contractAddr: contract.id!,
      startTime: Number(contract.timestamp!),
      endTime: endTime,
      progressPercentage: progressPercentage,
      speedHps: String(contract.speed!),
      price: contract.price!,
      fee: contract.fee!,
      length: String(contract.length!),
      poolAddress: poolInfo?.poolAddress || "",
      poolUsername: poolInfo?.username || "",
      validatorAddress: poolInfo?.validatorAddress || "",
    };
  });

  const completedContractsCards: CardData[] = completedContracts.map((contract) => {
    const poolInfo = getPoolInfo({
      contractId: contract.id,
      startedAt: BigInt(contract.purchaseTime),
    });

    return {
      contractAddr: contract.id!,
      startTime: Number(contract.purchaseTime!),
      endTime: Number(contract.endTime!),
      progressPercentage: 100,
      speedHps: String(contract.speed!),
      price: contract.price!,
      fee: "0",
      length: String(contract.length!),
      poolAddress: poolInfo?.poolAddress || "",
      poolUsername: poolInfo?.username || "",
      validatorAddress: poolInfo?.validatorAddress || "",
    };
  });

  return (
    <DefaultLayout>
      <ModalItem open={editModal.isOpen} setOpen={editModal.setOpen} key={`edit-${contractId}`}>
        <BuyerEditForm contractId={contractId!} web3Gateway={web3Gateway} closeForm={() => editModal.close()} />
      </ModalItem>
      <ModalItem open={cancelModal.isOpen} setOpen={cancelModal.setOpen} key={`cancel-${contractId}`}>
        <CancelForm contractId={contractId!} web3Gateway={web3Gateway} closeForm={() => cancelModal.close()} />
      </ModalItem>
      <TabSwitch>
        <button
          type="button"
          id="running"
          className={activeOrdersTab === CurrentTab.Running ? "active" : ""}
          onClick={() => setActiveOrdersTab(CurrentTab.Running)}
        >
          Active <span>{contractsQuery.isLoading ? "" : runningContracts.length}</span>
        </button>
        <button
          type="button"
          id="completed"
          className={activeOrdersTab === CurrentTab.Completed ? "active" : ""}
          onClick={() => setActiveOrdersTab(CurrentTab.Completed)}
        >
          Completed <span>{contractsQuery.isLoading ? "" : completedContracts.length}</span>
        </button>
        <span className="glider" />
      </TabSwitch>
      <div className="flex flex-col items-center">
        {activeOrdersTab === CurrentTab.Running && (
          <>
            <SortToolbar pageTitle="Running Contracts" sortType={runningSortType} setSortType={setRunningSortType} />
            <ContractCards>
              {runningContractsCards.length === 0 && (
                <p className="text-2xl text-white">You have no active contracts.</p>
              )}
              {runningContractsCards.map((item) => {
                return <Card key={`${item.contractAddr}-${item.startTime}`} card={item} />;
              })}
            </ContractCards>
          </>
        )}
        {activeOrdersTab === CurrentTab.Completed && (
          <>
            <SortToolbar
              pageTitle="Finished Contracts"
              sortType={completedSortType}
              setSortType={setCompletedSortType}
            />
            <ContractCards>
              {completedContractsCards.length === 0 && (
                <p className="text-2xl text-white">You have no finished contracts.</p>
              )}
              {completedContractsCards.map((item) => {
                return <Card key={`${item.contractAddr}-${item.startTime}`} card={item} />;
              })}
            </ContractCards>
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
