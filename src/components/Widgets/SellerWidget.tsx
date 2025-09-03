import styled from "@mui/material/styles/styled";
import { useAccount, useReadContract } from "wagmi";
import { SmallWidget } from "../Cards/Cards.styled";
import { Spinner } from "../Spinner.styled";
import { formatFeePrice, formatHashrateTHPS } from "../../lib/units";
import { PrimaryButton } from "../Forms/FormButtons/Buttons.styled";
import { useCallback, type FC } from "react";
import { ModalItem } from "../Modal";
import { useModal } from "../../hooks/useModal";
import { truncateAddress } from "../../utils/formatters";
import { AddressLength, ContractState } from "../../types/types";
import { RegisterSellerForm } from "../Forms/RegisterSeller";
import { DeregisterSeller } from "../Forms/DeregisterSeller";
import { useContracts, useSellerContracts } from "../../hooks/data/useContracts";
import { GenericNumberStatsWidget } from "./GenericNumberStatsWidget";
import { EditSellerForm } from "../Forms/EditSeller";
import { cloneFactoryAbi } from "contracts-js/dist/abi/abi";
import { isAddressEqual } from "viem";

export const SellerWidget: FC = () => {
  const { address } = useAccount();
  const registerSellerModal = useModal();
  const editSellerModal = useModal();
  const deregisterSellerModal = useModal();

  const sellerQuery = useReadContract({
    address: process.env.REACT_APP_CLONE_FACTORY,
    abi: cloneFactoryAbi,
    functionName: "sellerByAddress",
    args: [address!],
    query: {
      enabled: !!address,
      gcTime: Number.POSITIVE_INFINITY,
    },
  });

  const contractsQuery = useContracts({
    select: (data) => {
      return {
        ...data,
        data: data.data?.filter((c) => isAddressEqual(c.seller as `0x${string}`, address!)),
      };
    },
    enabled: !!address,
  });

  const count = contractsQuery.data?.reduce<{
    available: number;
    running: number;
    archived: number;
    total: number;
    totalHashrate: number;
    availableHashrate: number;
    runningHashrate: number;
  }>(
    (acc, contract) => {
      // if running but is deleted it is still running
      if (contract.state === ContractState.Running) {
        acc.running++;
        acc.runningHashrate += Number(contract.speed);
        acc.totalHashrate += Number(contract.speed);
        acc.total++;
        return acc;
      }

      // not running, is deleted
      if (contract.isDeleted) {
        acc.archived++;
        return acc;
      }

      // not running, not deleted - available
      acc.available++;
      acc.availableHashrate += Number(contract.speed);
      acc.totalHashrate += Number(contract.speed);
      acc.total++;
      return acc;
    },
    {
      available: 0,
      running: 0,
      archived: 0,
      total: 0,
      totalHashrate: 0,
      availableHashrate: 0,
      runningHashrate: 0,
    },
  );

  const [seller, isActive, isRegistered] = sellerQuery.isSuccess ? sellerQuery.data : [undefined, false, false];

  const onRegisterSellerClose = useCallback(async () => {
    sellerQuery.refetch();
    registerSellerModal.close();
  }, []);

  const onEditSellerClose = useCallback(async () => {
    sellerQuery.refetch();
    editSellerModal.close();
  }, []);

  const onDeregisterSellerClose = useCallback(async () => {
    sellerQuery.refetch();
    deregisterSellerModal.close();
  }, []);

  return (
    <>
      <SmallWidget>
        {registerSellerModal.isOpen && (
          <ModalItem open={registerSellerModal.isOpen} setOpen={registerSellerModal.setOpen}>
            <RegisterSellerForm onClose={onRegisterSellerClose} />
          </ModalItem>
        )}
        {editSellerModal.isOpen && (
          <ModalItem open={editSellerModal.isOpen} setOpen={editSellerModal.setOpen}>
            <EditSellerForm sellerStake={seller!.stake} onClose={onEditSellerClose} />
          </ModalItem>
        )}
        {deregisterSellerModal.isOpen && (
          <ModalItem open={deregisterSellerModal.isOpen} setOpen={deregisterSellerModal.setOpen}>
            <DeregisterSeller closeForm={onDeregisterSellerClose} />
          </ModalItem>
        )}
        <h3>
          {!address && "You are not registered as a Seller"}
          {sellerQuery.isLoading && "Loading..."}
          {sellerQuery.isSuccess && !isRegistered && "You are not registered as a Seller"}
          {sellerQuery.isSuccess &&
            isRegistered &&
            !isActive &&
            "You are registered as a Seller but you're not active. Please increase your stake."}
          {sellerQuery.isSuccess && isActive && "You are registered as a Seller and you're active."}
        </h3>
        <WidgetContent>
          {!address && "Connect wallet to become a seller"}

          {sellerQuery.isLoading && <Spinner fontSize="0.3em" />}
          {sellerQuery.isSuccess && !isRegistered && (
            <PrimaryButton onClick={registerSellerModal.open}>Become a seller</PrimaryButton>
          )}
          {sellerQuery.isSuccess && isRegistered && !isActive && (
            <PrimaryButton onClick={editSellerModal.open}>Increase your stake</PrimaryButton>
          )}
          {sellerQuery.isSuccess && isActive && (
            <SellerInfo>
              <Key>Address</Key>
              <Value>{truncateAddress(address!, AddressLength.SHORT)}</Value>
              <Key>Stake</Key>
              <Value>{formatFeePrice(seller!.stake).full}</Value>
            </SellerInfo>
          )}
        </WidgetContent>
        <div className="link">
          <PrimaryButton onClick={editSellerModal.open} disabled={!isRegistered}>
            Edit seller
          </PrimaryButton>
          <PrimaryButton onClick={deregisterSellerModal.open} disabled={!isRegistered}>
            Unregister
          </PrimaryButton>
        </div>
      </SmallWidget>
      <GenericNumberStatsWidget
        data={[
          { title: "Available", value: count?.available.toString() ?? "0" },
          { title: "Running", value: count?.running.toString() ?? "0" },
          { title: "Archived", value: count?.archived.toString() ?? "0", dim: true },
        ]}
        title="Seller Contracts"
        contentUnderneath={<>Total offered contracts: {count?.total.toString() ?? "0"}</>}
      />
      <GenericNumberStatsWidget
        data={[
          {
            title: "Running, TH/s",
            value: formatHashrateTHPS(count?.runningHashrate.toString() ?? "0").valueRounded,
          },
          {
            title: "Available, TH/s",
            value: formatHashrateTHPS(count?.availableHashrate.toString() ?? "0").valueRounded,
          },
        ]}
        title="Seller Hashrate"
        contentUnderneath={<>Total hashrate: {formatHashrateTHPS(count?.totalHashrate.toString() ?? "0").full}</>}
      />
    </>
  );
};

const Value = styled("dd")`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  grid-row: 1;
  font-size: 1em;
  font-weight: 600;
`;

const Key = styled("dt")`
  display: flex;
  align-items: center;
  justify-content: center;
  grid-row: 2;
  font-size: 0.8em;
`;

const SellerInfo = styled("dl")`
  display: grid;
  grid-template-rows: 1fr 1fr;
  grid-auto-flow: column dense;
  column-gap: 2rem;
  align-items: flex-start;
  justify-content: space-evenly;
`;

const WidgetContent = styled("div")`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  flex: 1;
  width: 100%;
  flex-direction: column;
  gap: 0.5rem 0;

  @media (min-width: 1024px) {
    flex-direction: row;
  }
`;
