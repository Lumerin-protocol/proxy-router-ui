import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAccount } from "wagmi";
import type { EthereumGateway } from "../../../gateway/ethereum";
import { ContentState } from "../../../types/types";
import { getButton, printError } from "../../../utils/utils";
import { FormButtonsWrapper, SecondaryButton } from "../FormButtons/Buttons.styled";
import { CompletedContent } from "./CompletedContent";
import { ConfirmContent } from "./ConfirmContent";
import { ReviewContent } from "./ReviewContent";

export interface InputValuesCreateForm {
  walletAddress: string;
  durationHours: number | "";
  speedTHPS: number | "";
  profitTargetPercent: number | "";
}

interface CreateFormProps {
  web3Gateway: EthereumGateway;
  setOpen: (isOpen: boolean) => void;
}

export const CreateContract: React.FC<CreateFormProps> = ({ web3Gateway, setOpen }) => {
  const { address: userAccount } = useAccount();
  const [contentState, setContentState] = useState<ContentState>(ContentState.Create);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

  // Input validation setup
  const form = useForm<InputValuesCreateForm>({
    mode: "onBlur",
    defaultValues: {
      walletAddress: userAccount,
      durationHours: 24,
      speedTHPS: 100,
      profitTargetPercent: 5,
    },
  });

  const {
    handleSubmit,
    formState: { isValid },
  } = form;

  const createContractAsync = async (data: InputValuesCreateForm): Promise<void> => {
    // Create
    if (isValid && contentState === ContentState.Create) {
      setContentState(ContentState.Confirm);
      return;
    }

    // Confirm
    if (isValid && contentState === ContentState.Confirm) {
      setContentState(ContentState.Pending);

      // Create contract
      try {
        const durationSeconds = Number(data.durationHours) * 3600;
        const speedHPS = Number(data.speedTHPS) * 10 ** 12;

        const receipt = await web3Gateway.createContract({
          profitTargetPercent: BigInt(data.profitTargetPercent),
          speedHPS: BigInt(speedHPS),
          durationSeconds: BigInt(durationSeconds),
          from: userAccount!,
        });
        setTxHash(receipt.transactionHash);
        if (receipt.status) {
          setContentState(ContentState.Complete);
        }
      } catch (error) {
        const typedError = error as Error;
        printError(typedError.message, typedError.stack as string);
        setOpen(false);
      }
    }
  };

  function renderContent() {
    switch (contentState) {
      case ContentState.Confirm:
        return <ConfirmContent data={form.getValues()} />;
      case ContentState.Pending:
      case ContentState.Complete:
        return <CompletedContent contentState={contentState} txHash={txHash} />;
      default:
        return <ReviewContent form={form} isCreate />;
    }
  }

  function renderButton() {
    switch (contentState) {
      case ContentState.Confirm:
        return "Confirm New Contract";
      case ContentState.Pending:
      case ContentState.Complete:
        return "Close";
      default:
        return "Create New Contract";
    }
  }

  // Set styles and button based on ContentState
  const displayHeader = ![ContentState.Pending, ContentState.Complete].includes(contentState);

  return (
    <form onSubmit={handleSubmit(createContractAsync)}>
      {displayHeader && (
        <>
          <h2>Create New Contract</h2>
          <p>Sell your hashpower on the Lumerin Marketplace</p>
        </>
      )}
      {renderContent()}
      <FormButtonsWrapper>
        <SecondaryButton type="button" onClick={() => setOpen(false)}>
          Close
        </SecondaryButton>
        {contentState !== ContentState.Pending &&
          getButton(contentState, renderButton(), () => {}, handleSubmit(createContractAsync), false)}
      </FormButtonsWrapper>
    </form>
  );
};
