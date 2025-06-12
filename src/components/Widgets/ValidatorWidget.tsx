import styled from "@mui/material/styles/styled";
import { isAddressEqual, zeroAddress } from "viem";
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
import { validatorRegistryAbi } from "contracts-js/dist/abi/abi";

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

  return (
    <SmallWidget>
      {registerValidatorModal.isOpen && (
        <ModalItem open={registerValidatorModal.isOpen} setOpen={registerValidatorModal.setOpen}>
          <RegisterValidatorForm
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
          <DeregisterValidator
            closeForm={async () => {
              removeValidatorModal.close();
              await validatorQuery.refetch();
            }}
          />
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
            <Entry>
              <Key>Host</Key>
              <Value>{validator?.host}</Value>
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

const Entry = styled("dl")`
  display: grid;
  grid-template-rows: 1fr 1fr;
  grid-auto-flow: column dense;
  column-gap: 2rem;
  align-items: flex-start;
`;

const Value = styled("dd")`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  grid-row: 1;
  font-size: 1em;
  font-weight: 600;
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
  white-space: normal;
  text-align: center;
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
