import styled from "@emotion/styled";
import { zeroAddress } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { SmallWidget } from "../Cards/Cards.styled";
import { Spinner } from "../Spinner.styled";
import { formatFeePrice } from "../../lib/units";
import { PrimaryButton } from "../Forms/FormButtons/Buttons.styled";
import type { FC } from "react";
import { ModalItem } from "../Modal";
import { RegisterValidatorForm } from "../Forms/RegisterValidator";
import { useModal } from "../../hooks/useModal";
import { EditValidatorForm } from "../Forms/EditValidator";
import { DeregisterValidator } from "../Forms/DeregisterValidator";
import { abi } from "contracts-js";
import type { EthereumGateway } from "../../gateway/ethereum";

const { validatorRegistryAbi, cloneFactoryAbi } = abi;

interface ValidatorWidgetProps {
  web3Gateway: EthereumGateway;
}

export const ValidatorWidget: FC<ValidatorWidgetProps> = (props) => {
  const { address } = useAccount();
  const registerValidatorModal = useModal();
  const editValidatorModal = useModal();
  const removeValidatorModal = useModal();

  const validatorQuery = useReadContract({
    address: process.env.REACT_APP_VALIDATOR_REGISTRY_ADDRESS,
    abi: validatorRegistryAbi,
    functionName: "getValidatorV2",
    args: [address!],
    query: {
      enabled: !!address,
      gcTime: Number.POSITIVE_INFINITY,
    },
  });

  const [validator, isActive, isRegistered] = validatorQuery.isSuccess
    ? validatorQuery.data
    : [undefined, false, false];

  return (
    <SmallWidget>
      {registerValidatorModal.isOpen && (
        <ModalItem open={registerValidatorModal.isOpen} setOpen={registerValidatorModal.setOpen}>
          <RegisterValidatorForm
            web3Gateway={props.web3Gateway}
            onClose={async () => {
              await validatorQuery.refetch();
              registerValidatorModal.close();
            }}
          />
        </ModalItem>
      )}
      {editValidatorModal.isOpen && (
        <ModalItem open={editValidatorModal.isOpen} setOpen={editValidatorModal.setOpen}>
          <EditValidatorForm
            web3Gateway={props.web3Gateway}
            validatorHost={validator!.host}
            validatorStake={validator!.stake}
            onClose={async () => {
              await validatorQuery.refetch();
              editValidatorModal.close();
            }}
          />
        </ModalItem>
      )}
      {removeValidatorModal.isOpen && (
        <ModalItem open={removeValidatorModal.isOpen} setOpen={removeValidatorModal.setOpen}>
          <DeregisterValidator closeForm={() => removeValidatorModal.setOpen(false)} />
        </ModalItem>
      )}
      <h3>
        {validatorQuery.isLoading && "Loading..."}
        {validatorQuery.isSuccess && !isRegistered && "You are not registered as a Validator"}
        {validatorQuery.isSuccess &&
          isRegistered &&
          !isActive &&
          "You are registered as a Validator, but your stake is too low"}
        {validatorQuery.isSuccess && isRegistered && isActive && "You are registered as a Validator"}
      </h3>
      <WidgetContent>
        {validatorQuery.isLoading && <Spinner fontSize="0.3em" />}
        {validatorQuery.isSuccess && !isRegistered && (
          <PrimaryButton onClick={registerValidatorModal.open}>Become a validator</PrimaryButton>
        )}
        {validatorQuery.isSuccess && isRegistered && (
          <ValidatorInfo>
            <Key>Host</Key>
            <Value>{validator?.host}</Value>
            <Key>Stake</Key>
            <Value>{validator ? formatFeePrice(validator.stake).full : "0"}</Value>
            <Key>Complaints</Key>
            <Value>{validator?.complains}</Value>
            <Key>Last Complainer</Key>
            <Value>{validator?.lastComplainer === zeroAddress ? "n/a" : validator?.lastComplainer}</Value>
          </ValidatorInfo>
        )}
      </WidgetContent>
      <div className="link">
        <PrimaryButton onClick={editValidatorModal.open}>Edit validator</PrimaryButton>
        <PrimaryButton onClick={removeValidatorModal.open}>Remove yourself as a validator</PrimaryButton>
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

const ValidatorInfo = styled.dl`
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
