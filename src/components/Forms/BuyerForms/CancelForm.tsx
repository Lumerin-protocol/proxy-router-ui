/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, type MouseEventHandler, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import type { EthereumGateway } from "../../../gateway/ethereum";
import { useContracts } from "../../../hooks/data/useContracts";
import { AlertMessage, CloseOutType, ContentState, ContractState } from "../../../types/types";
import { getHandlerBlockchainError, isNoCancel, printError } from "../../../utils/utils";
import { Alert } from "../../Alert";
import { ButtonGroup } from "../../ButtonGroup";
import { Spinner } from "../../Spinner.styled";
import { CancelButton } from "../FormButtons/Buttons.styled";
import { SecondaryButton } from "../FormButtons/Buttons.styled";

export interface CancelFormProps {
  contractId: string;
  web3Gateway?: EthereumGateway;
  currentBlockTimestamp?: number;
  closeForm: () => void;
}

export const CancelForm: React.FC<CancelFormProps> = ({ contractId, web3Gateway, closeForm }) => {
  const { address: userAccount } = useAccount();
  const contractsQuery = useContracts({ userAccount });

  const [contentState, setContentState] = useState<string>(ContentState.Review);
  const [isConfirmModal, setIsConfirmModal] = useState<boolean>(false);
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");

  const contract = contractsQuery.data?.filter((contract) => contract.id === contractId)?.[0];
  const handleCancelError = getHandlerBlockchainError(setAlertMessage, setAlertOpen, setContentState);

  const cancelSubmitHandler: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (!contract || !userAccount) return;
    if (isNoCancel(contract, userAccount)) return;
    setIsConfirmModal(true);
    setContentState(ContentState.Confirm);
  };

  const cancelContractAsync: () => void = async () => {
    if (!contract || !userAccount) return;
    // Confirm
    if (contentState === ContentState.Confirm) {
      if (contract.state !== ContractState.Available && contract.state !== ContractState.Running) {
        setAlertMessage(AlertMessage.NoCancelBuyer);
        setAlertOpen(true);
        return;
      }
      setIsConfirmModal(false);
      setContentState(ContentState.Pending);
    }

    // Pending
    if (contentState === ContentState.Pending) {
      if (isNoCancel(contract, userAccount)) return;

      if (!web3Gateway) {
        console.error("missing web3 gateway");
        return;
      }
      try {
        const fee = "0"; //web3Gateway.getMarketplaceFee();
        const receipt = await web3Gateway.closeContract({
          contractAddress: contractId,
          from: userAccount,
          fee: fee,
          closeoutType: CloseOutType.BuyerOrValidatorCancel,
        });

        if (receipt.status) {
          setContentState(ContentState.Complete);
        } else {
          setAlertMessage(AlertMessage.CancelFailed);
          setAlertOpen(true);
          setContentState(ContentState.Cancel);
        }
      } catch (error) {
        const typedError = error as Error;
        printError(typedError.message, typedError.stack as string);
        handleCancelError(typedError);
      }
    }
  };

  // Check if user is buyer or seller and contract is running
  useEffect(() => {
    if (!contract || !userAccount) return;

    let timeoutId: NodeJS.Timeout;
    if (isNoCancel(contract, userAccount)) {
      setAlertMessage(AlertMessage.NoCancelBuyer);
      setAlertOpen(true);
      timeoutId = setTimeout(() => closeForm(), 3000);
    }

    return () => clearTimeout(timeoutId);
  }, []);

  // Create transaction when in pending state
  useEffect(() => {
    if (contentState === ContentState.Pending) cancelContractAsync();
  }, [contentState]);

  return (
    <Fragment>
      <Alert message={alertMessage} isOpen={alertOpen} onClose={() => setAlertOpen(false)} />
      <div>
        {!isConfirmModal && contentState === ContentState.Review && (
          <>
            <h2 className="text-3xl mb-3">Cancel Order</h2>
            <p className="mb-3 font-normal">
              You are about to cancel your order, and the purchased hashrate will no longer be delivered.
            </p>
            <p className="text-sm font-light">
              Please note - Gas fees are required in order to proceed with the cancellation.
            </p>
            <ButtonGroup
              button1={
                <SecondaryButton type="submit" onClick={() => closeForm()}>
                  Close
                </SecondaryButton>
              }
              button2={
                <CancelButton type="submit" onClick={cancelSubmitHandler}>
                  Cancel Order
                </CancelButton>
              }
            />
          </>
        )}
        {isConfirmModal && contentState === ContentState.Confirm && (
          <Fragment>
            <p className="mb-2">Make sure you want to cancel the order.</p>
            <p>The cancellation is permanent.</p>
            <ButtonGroup
              button1={
                <SecondaryButton type="submit" onClick={() => closeForm()}>
                  Close
                </SecondaryButton>
              }
              button2={
                <CancelButton type="submit" onClick={cancelContractAsync}>
                  Confirm Cancellation
                </CancelButton>
              }
            />
          </Fragment>
        )}
        {contentState === ContentState.Pending && (
          <div className="flex flex-col items-center bg-white text-black modal-input-spacing pb-8 border-transparent rounded-5">
            <div className="flex justify-center">
              <p className="bg-white modal-input-spacing border-transparent pt-0 mb-8 text-xl text-center">
                Your transaction is pending.
              </p>
            </div>
            <Spinner />
          </div>
        )}
        {contentState === ContentState.Complete && (
          <div className="flex bg-white text-black modal-input-spacing pb-8 border-transparent rounded-5">
            <p className="mb-1">The order has been cancelled successfully, and its status will update shortly.</p>
          </div>
        )}
      </div>
    </Fragment>
  );
};

CancelForm.displayName = "CancelForm";
