import { useCallback, useMemo, useState, type FC } from "react";
import { useAccount } from "wagmi";
import { Card, type CardData } from "../../components/Cards/PurchasedContracts";
import { SortToolbar } from "../../components/SortToolbar";
import { Spinner } from "../../components/Spinner.styled";
import { TabSwitch } from "../../components/TabSwitch";
import { useBuyerContracts } from "../../hooks/data/useContracts";
import { ContractState, CurrentTab, SortTypes } from "../../types/types";
import { sortContracts } from "../../utils/sortContracts";
import { getPoolInfo } from "../../gateway/localStorage";
import { useModal } from "../../hooks/useModal";
import { ModalItem } from "../../components/Modal";
import { BuyerEditForm } from "../../components/Forms/BuyerEditForm";
import { CancelForm } from "../../components/Forms/CancelForm";
import { ContractCards } from "../../components/Cards/PurchasedContracts.styled";
import { isAddressEqual } from "viem/utils";
import { WidgetsWrapper } from "../marketplace/styled";
import { BuyerOrdersWidget } from "../../components/Widgets/BuyerOrdersWidget";

export const BuyerHub: FC = () => {
  const { address: userAccount } = useAccount();
  const contractsQuery = useBuyerContracts({ address: userAccount });

  const editModal = useModal();
  const cancelModal = useModal();
  const [contractId, setContractId] = useState<string | null>(null);

  const [activeOrdersTab, setActiveOrdersTab] = useState<string>(CurrentTab.Running);
  const [runningSortType, setRunningSortType] = useState<SortTypes>(SortTypes.PurchaseTimeNewestToOldest);
  const [completedSortType, setCompletedSortType] = useState<SortTypes>(SortTypes.PurchaseTimeNewestToOldest);
  const currentBlockTimestamp = new Date().getTime() / 1000;

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const runningContracts = useMemo(() => {
    if (!contractsQuery.data) return [];
    if (!userAccount) return [];
    const buyerOrders = contractsQuery.data.filter(
      (contract) =>
        isAddressEqual(contract.buyer as `0x${string}`, userAccount) && contract.state === ContractState.Running,
    );

    return sortContracts(runningSortType, buyerOrders);
  }, [contractsQuery.data, runningSortType]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const completedContracts = useMemo(() => {
    if (!contractsQuery.data) return [];
    if (!userAccount) return [];

    const buyerOrders = contractsQuery.data
      .flatMap((c) => c.history!)
      .filter(
        (c) => isAddressEqual(c.buyer as `0x${string}`, userAccount!) && Number(c.endTime) < currentBlockTimestamp,
      );

    return sortContracts(completedSortType, buyerOrders);
  }, [contractsQuery.data, completedSortType]);

  const runningContractsCards: CardData[] = runningContracts.map((contract) => {
    const endTime = Number(contract.timestamp) + Number(contract.length);

    const poolInfo = getPoolInfo({
      contractId: contract.id,
      startedAt: BigInt(contract.timestamp),
    });

    return {
      contractAddr: contract.id!,
      startTime: Number(contract.timestamp!),
      endTime: endTime,
      speedHps: String(contract.speed!),
      price: contract.price!,
      fee: contract.fee!,
      length: String(contract.length!),
      poolAddress: poolInfo?.poolAddress || "",
      poolUsername: poolInfo?.username || "",
      validatorAddress: poolInfo?.validatorAddress || "",
    };
  });

  const completedContractsCards: CardData[] = completedContracts.map((historyEntry) => {
    const poolInfo = getPoolInfo({
      contractId: historyEntry.id,
      startedAt: BigInt(historyEntry.purchaseTime),
    });

    return {
      contractAddr: historyEntry.id!,
      startTime: Number(historyEntry.purchaseTime!),
      endTime: Number(historyEntry.endTime!),
      speedHps: String(historyEntry.speed!),
      price: historyEntry.price!,
      fee: historyEntry.fee!,
      length: String(historyEntry.length!),
      poolAddress: poolInfo?.poolAddress || "",
      poolUsername: poolInfo?.username || "",
      validatorAddress: historyEntry.validator || "",
    };
  });

  const onEditFormClose = useCallback(async () => {
    contractsQuery.refetch();
    editModal.close();
  }, []);

  const onCancelFormClose = useCallback(async () => {
    contractsQuery.refetch();
    cancelModal.close();
  }, []);

  return (
    <>
      <ModalItem open={editModal.isOpen} setOpen={editModal.setOpen} key={`edit-${contractId}`}>
        <BuyerEditForm contractId={contractId!} closeForm={onEditFormClose} />
      </ModalItem>
      <ModalItem open={cancelModal.isOpen} setOpen={cancelModal.setOpen}>
        <CancelForm contractId={contractId!} closeForm={onCancelFormClose} />
      </ModalItem>
      <WidgetsWrapper>
        <BuyerOrdersWidget isLoading={contractsQuery.isLoading} contracts={contractsQuery.data || []} />
      </WidgetsWrapper>
      <div className="flex flex-col flex-wrap justify-between items-center md:flex-row gap-y-6 mb-6">
        <TabSwitch
          values={[
            { text: "Active", value: CurrentTab.Running, count: runningContracts.length },
            { text: "Completed", value: CurrentTab.Completed, count: completedContracts.length },
          ]}
          value={activeOrdersTab}
          setValue={setActiveOrdersTab}
        />
        {activeOrdersTab === CurrentTab.Running && (
          <SortToolbar pageTitle="Active Contracts" sortType={runningSortType} setSortType={setRunningSortType} />
        )}
        {activeOrdersTab === CurrentTab.Completed && (
          <SortToolbar
            pageTitle="Completed Contracts"
            sortType={completedSortType}
            setSortType={setCompletedSortType}
          />
        )}
      </div>
      <div className="flex flex-col items-center">
        {activeOrdersTab === CurrentTab.Running && (
          <>
            {runningContracts.length === 0 && <p className="text-2xl text-white">You have no active contracts.</p>}
            {runningContracts.length > 0 && (
              <ContractCards>
                {runningContractsCards.map((item) => {
                  return (
                    <Card
                      key={`${item.contractAddr}-${item.startTime}`}
                      card={item}
                      editClickHandler={() => {
                        setContractId(item.contractAddr);
                        editModal.open();
                      }}
                      cancelClickHandler={() => {
                        setContractId(item.contractAddr);
                        cancelModal.open();
                      }}
                    />
                  );
                })}
              </ContractCards>
            )}
          </>
        )}
        {activeOrdersTab === CurrentTab.Completed && (
          <>
            {completedContractsCards.length === 0 && (
              <p className="text-2xl text-white">You have no completed contracts.</p>
            )}
            {completedContractsCards.length > 0 && (
              <ContractCards>
                {completedContractsCards.map((item) => {
                  return <Card key={`${item.contractAddr}-${item.startTime}`} card={item} />;
                })}
              </ContractCards>
            )}
          </>
        )}
        {contractsQuery.isLoading && (
          <div className="spinner">
            <Spinner />
          </div>
        )}
      </div>
    </>
  );
};
