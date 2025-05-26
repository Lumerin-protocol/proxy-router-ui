import styled from "@emotion/styled";
import { useAccount, useReadContract } from "wagmi";
import { SmallWidget } from "../Cards/Cards.styled";
import { Spinner } from "../Spinner.styled";
import { formatFeePrice } from "../../lib/units";
import { PrimaryButton } from "../Forms/FormButtons/Buttons.styled";
import type { FC } from "react";
import { ModalItem } from "../Modal";
import { useModal } from "../../hooks/useModal";
import { abi } from "contracts-js";
import { truncateAddress } from "../../utils/utils";
import { AddressLength } from "../../types/types";
import { RegisterSellerForm } from "../Forms/RegisterSeller";
import { DeregisterSeller } from "../Forms/DeregisterSeller";
const { cloneFactoryAbi } = abi;

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

  const [seller, isActive, isRegistered] = sellerQuery.isSuccess ? sellerQuery.data : [undefined, false, false];

  return (
    <SmallWidget>
      {registerSellerModal.isOpen && (
        <ModalItem open={registerSellerModal.isOpen} setOpen={registerSellerModal.setOpen}>
          <RegisterSellerForm
            onClose={async () => {
              await sellerQuery.refetch();
              registerSellerModal.close();
            }}
          />
        </ModalItem>
      )}
      {editSellerModal.isOpen && (
        <ModalItem open={editSellerModal.isOpen} setOpen={editSellerModal.setOpen}>
          {/* <EditValidatorForm
            web3Gateway={props.web3Gateway}
            setOpen={registerValidatorModal.setOpen}
            validatorHost={validator.data!.host}
            validatorStake={validator.data!.stake}
          /> */}
        </ModalItem>
      )}
      {deregisterSellerModal.isOpen && (
        <ModalItem open={deregisterSellerModal.isOpen} setOpen={deregisterSellerModal.setOpen}>
          <DeregisterSeller
            closeForm={async () => {
              await sellerQuery.refetch();
              deregisterSellerModal.close();
            }}
          />
        </ModalItem>
      )}
      <h3>
        {sellerQuery.isLoading && "Loading..."}
        {sellerQuery.isSuccess && !isRegistered && "You are not registered as a Seller"}
        {sellerQuery.isSuccess &&
          isRegistered &&
          !isActive &&
          "You are registered as a Seller but you're not active. Please increase your stake."}
        {sellerQuery.isSuccess && isActive && "You are registered as a Seller and you're active."}
      </h3>
      <WidgetContent>
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
            <Value>{truncateAddress(address!, AddressLength.MEDIUM)}</Value>
            <Key>Stake</Key>
            <Value>{formatFeePrice(seller!.stake).full}</Value>
          </SellerInfo>
        )}
      </WidgetContent>
      <div className="link">
        <PrimaryButton onClick={editSellerModal.open}>Edit your seller</PrimaryButton>
        <PrimaryButton onClick={deregisterSellerModal.open}>Remove yourself as a seller</PrimaryButton>
      </div>
    </SmallWidget>
  );
};

const Value = styled.dd`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  grid-row: 1;
  font-size: 1em;
  font-weight: 600;
`;

const Key = styled.dt`
  display: flex;
  align-items: center;
  justify-content: center;
  grid-row: 2;
  font-size: 0.8em;
`;

const SellerInfo = styled.dl`
  display: grid;
  grid-template-rows: 1fr 1fr;
  grid-auto-flow: column dense;
  column-gap: 2rem;
  align-items: flex-start;
  justify-content: space-evenly;
`;

const WidgetContent = styled.div`
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
