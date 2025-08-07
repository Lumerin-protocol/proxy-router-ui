import styled from "@mui/material/styles/styled";
import { isAddressEqual, zeroAddress } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { SmallWidget } from "../Cards/Cards.styled";
import { Spinner } from "../Spinner.styled";
import { formatFeePrice } from "../../lib/units";
import { PrimaryButton } from "../Forms/FormButtons/Buttons.styled";
import { ComponentType, useCallback, type FC } from "react";
import { ModalItem } from "../Modal";
import { RegisterValidatorForm } from "../Forms/RegisterValidator";
import { useModal } from "../../hooks/useModal";
import { EditValidatorForm } from "../Forms/EditValidator";
import { DeregisterValidator } from "../Forms/DeregisterValidator";
import { validatorRegistryAbi } from "contracts-js/dist/abi/abi";
import { GenericNumberStatsWidget } from "./GenericNumberStatsWidget";

export const ValidatorWidget: FC = () => {
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

  const onRegisterValidatorClose = useCallback(async () => {
    validatorQuery.refetch();
    registerValidatorModal.close();
  }, []);

  const onEditValidatorClose = useCallback(async () => {
    validatorQuery.refetch();
    editValidatorModal.close();
  }, []);

  const onDeregisterValidatorClose = useCallback(async () => {
    validatorQuery.refetch();
    removeValidatorModal.close();
  }, []);

  return (
    <SmallWidget>
      {registerValidatorModal.isOpen && (
        <ModalItem open={registerValidatorModal.isOpen} setOpen={registerValidatorModal.setOpen}>
          <RegisterValidatorForm onClose={onRegisterValidatorClose} />
        </ModalItem>
      )}
      {editValidatorModal.isOpen && (
        <ModalItem open={editValidatorModal.isOpen} setOpen={editValidatorModal.setOpen}>
          <EditValidatorForm
            validatorHost={validator!.host}
            validatorStake={validator!.stake}
            onClose={onEditValidatorClose}
          />
        </ModalItem>
      )}
      {removeValidatorModal.isOpen && (
        <ModalItem open={removeValidatorModal.isOpen} setOpen={removeValidatorModal.setOpen}>
          <DeregisterValidator closeForm={onDeregisterValidatorClose} />
        </ModalItem>
      )}
      <h3>
        {!address && "You are not registered as a Validator"}
        {validatorQuery.isLoading && "Loading..."}
        {validatorQuery.isSuccess && !isRegistered && "You are not registered as a Validator"}
        {validatorQuery.isSuccess &&
          isRegistered &&
          !isActive &&
          "You are registered as a Validator, but your stake is too low"}
        {validatorQuery.isSuccess && isRegistered && isActive && "You are registered as a Validator"}
      </h3>
      <WidgetContent>
        {!address && "Connect wallet to become a Validator"}
        {validatorQuery.isLoading && <Spinner fontSize="0.3em" />}
        {validatorQuery.isSuccess && !isRegistered && (
          <PrimaryButton onClick={registerValidatorModal.open}>Become a validator</PrimaryButton>
        )}
        {validatorQuery.isSuccess && isRegistered && (
          <ValidatorInfo>
            <Entry $hoverText={validator?.host}>
              <Key>Host</Key>
              <Value style={{ display: "inline-block" }}>{validator?.host}</Value>
            </Entry>
            <Entry>
              <Key>Stake</Key>
              <Value>{validator ? formatFeePrice(validator.stake).full : "0"}</Value>
            </Entry>
            <Entry>
              <Key>Complaints</Key>
              <Value>{validator?.complains}</Value>
            </Entry>
            <Entry>
              <Key>Last Complainer</Key>
              <Value>
                {validator && isAddressEqual(validator?.lastComplainer, zeroAddress)
                  ? "n/a"
                  : validator?.lastComplainer}
              </Value>
            </Entry>
          </ValidatorInfo>
        )}
      </WidgetContent>
      <div className="link">
        <PrimaryButton onClick={editValidatorModal.open} disabled={!isRegistered}>
          Edit validator
        </PrimaryButton>
        <PrimaryButton onClick={removeValidatorModal.open} disabled={!isRegistered}>
          Unregister
        </PrimaryButton>
      </div>
    </SmallWidget>
  );
};

const Entry = styled("dl", {
  shouldForwardProp: (prop) => typeof prop === "string" && !prop.startsWith("$"),
})<{ $hoverText?: string }>`
  position: relative;
  display: grid;
  grid-template-rows: 1fr 1fr;
  grid-auto-flow: column dense;
  column-gap: 2rem;
  align-items: flex-start;
  ${({ $hoverText }) =>
    $hoverText &&
    `
    &:after {
      content: "${$hoverText}";
    }
  `}
  &:after {
    position: absolute;
    bottom: calc(100% + 0.5em);
    width: max-content;
    padding: 0.5em;
    border-radius: 0.5em;
    background-color: rgba(0, 0, 0, 0.9);
    color: #ccc;
    font-size: 0.8rem;
    visibility: hidden;
    transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
    opacity: 0;
    left: 50%;
    transform: translateX(-50%);
  }
  &:hover:after {
    visibility: visible;
    opacity: 1;
  }
`;

const Key = styled("dt")`
  display: flex;
  align-items: center;
  justify-content: center;
  grid-row: 2;
  font-size: 0.8em;
`;

const ValidatorInfo = styled("div")`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.5rem;
  align-items: flex-start;
  justify-content: space-evenly;
  width: 100%;
  max-width: 100%;
  margin-top: 1rem;
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

const Tooltip = styled("div", {
  shouldForwardProp: (prop) => typeof prop === "string" && !prop.startsWith("$"),
})<{ $hoverText?: string }>`
  position: relative;

  ${({ $hoverText }) =>
    $hoverText &&
    `
    &:hover:after {
      content: "${$hoverText}";
    }
  `}

  &:after {
    position: absolute;
    bottom: calc(100% + 0.5em);
    width: max-content;
    padding: 0.5em;
    border-radius: 0.5em;
    background-color: rgba(0, 0, 0, 0.9);
    color: #ccc;
    font-size: 0.8rem;
    visibility: hidden;
    transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
    opacity: 0;
    left: 50%;
    transform: translateX(-50%);
  }
  &:hover:after {
    visibility: visible;
    opacity: 1;
  }
`;

const Value = styled("dd")`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  grid-row: 1;
  font-size: 1em;
  font-weight: 600;
  white-space: nowrap;
  text-align: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;
