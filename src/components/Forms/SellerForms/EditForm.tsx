/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAccount } from "wagmi";
import type { EthereumGateway } from "../../../gateway/ethereum";
import { AlertMessage, ContentState, type HashRentalContract } from "../../../types/types";
import { getButton, isNoEditSeller, printError } from "../../../utils/utils";
import { multiplyByDigits } from "../../../web3/helpers";
import { Alert } from "../../Alert";
import { CompletedContent } from "./CompletedContent";
import { ConfirmContent } from "./ConfirmContent";
import { ReviewContent } from "./ReviewContent";
import type { InputValuesCreateForm } from "./CreateForm";
import { SecondaryButton } from "../FormButtons/Buttons.styled";

// Form text setup
const buttonText = {
  edit: "Edit Contract",
  confirm: "Confirm Changes",
  completed: "Close",
};

export interface EditFormProps {
  contract: HashRentalContract;
  web3Gateway: EthereumGateway;
  closeForm: () => void;
}

export const EditForm: React.FC<EditFormProps> = ({ web3Gateway, contract, closeForm }) => {
  const { address: userAccount } = useAccount();
  const [contentState, setContentState] = useState<string>(ContentState.Create);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

  // Input validation setup
  const form = useForm<InputValuesCreateForm>({
    mode: "onBlur",
    defaultValues: {
      walletAddress: contract.seller,
      durationHours: Number.parseInt(contract.length) / 3600,
      speedTHPS: Number.parseInt(contract.speed) / 10 ** 12,
      profitTargetPercent: Number(contract.profitTargetPercent),
    },
  });

  const {
    handleSubmit,
    formState: { isValid, isDirty },
  } = form;

  const editContractAsync: (data: InputValuesCreateForm) => void = async (data) => {
    // Edit
    if (contentState === ContentState.Create) {
      setContentState(ContentState.Confirm);
    }

    // Confirm
    if (isValid && contentState === ContentState.Confirm) {
      setContentState(ContentState.Pending);

      try {
        const durationSeconds = Number(data.durationHours) * 3600;
        const speedHPS = Number(data.speedTHPS) * 10 ** 12;

        const receipt = await web3Gateway.editContractTerms({
          contractAddress: contract.id,
          profitTargetPercent: BigInt(data.profitTargetPercent),
          speedHPS: BigInt(speedHPS),
          durationSeconds: BigInt(durationSeconds),
          from: userAccount!,
        });
        if (receipt.status) {
          setContentState(ContentState.Complete);
          setTxHash(receipt.transactionHash);
        }
      } catch (error) {
        const typedError = error as Error;
        printError(typedError.message, typedError.stack as string);
        closeForm();
      }
    }

    // Completed
    if (contentState === ContentState.Complete) {
      closeForm();
    }
  };

  // Content setup
  // Defaults to create state
  // Initialize since html element needs a value on first render
  const renderButtonContent = (): string => {
    switch (contentState) {
      case ContentState.Confirm:
        return buttonText.confirm;
      case ContentState.Pending:
      case ContentState.Complete:
        return buttonText.completed;
      default:
        return buttonText.edit;
    }
  };

  const renderContent = (): JSX.Element => {
    switch (contentState) {
      case ContentState.Confirm:
        return <ConfirmContent data={form.getValues()} />;
      case ContentState.Pending:
      case ContentState.Complete:
        return <CompletedContent contentState={contentState} txHash={txHash} isEdit />;
      default:
        return <ReviewContent form={form} />;
    }
  };

  const isHeaderVisible = contentState !== ContentState.Complete && contentState !== ContentState.Pending;

  return (
    <>
      <div className="flex flex-col justify-center w-full min-w-21 max-w-32 sm:min-w-26 font-medium">
        <div className="flex justify-between p-4 border-transparent rounded-t-5">
          <div className={isHeaderVisible ? "block" : "hidden"}>
            <p className="text-3xl">Edit Contract</p>
            <p>Sell your hashpower on the Lumerin Marketplace</p>
          </div>
        </div>
        {renderContent()}
        <div className="flex gap-6 p-4 pt-14 rounded-b-5">
          <SecondaryButton type="button" onClick={() => closeForm()}>
            Close
          </SecondaryButton>
          {contentState !== ContentState.Pending
            ? getButton(contentState, renderButtonContent(), () => {}, handleSubmit(editContractAsync), !isDirty)
            : null}
        </div>
      </div>
    </>
  );
};
