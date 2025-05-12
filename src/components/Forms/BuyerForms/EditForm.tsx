import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useAccount, usePublicClient } from "wagmi";
import type { EthereumGateway } from "../../../gateway/ethereum";
import { AddressLength, AlertMessage, ContentState, type InputValuesBuyForm, PathName } from "../../../types/types";
import { buttonText, paragraphText } from "../../../utils/shared";
import {
  encryptMessage,
  formatStratumUrl,
  getButton,
  getHandlerBlockchainError,
  printError,
  truncateAddress,
} from "../../../utils/utils";
import { Alert } from "../../Alert";
import { ContractLink } from "../../Modal.styled";
import { FormButtonsWrapper, SecondaryButton } from "../FormButtons/Buttons.styled";
import { CompletedContent } from "./CompletedContent";
import { ConfirmContent } from "./ConfirmContent";
import { ReviewContent } from "./ReviewContent";
import { decompressPublicKey } from "../../../gateway/utils";
import { useValidators } from "../../../hooks/data/useValidators";
import { abi } from "contracts-js";
import { getPoolInfo, setPoolInfo } from "../../../gateway/localStorage";
import { predefinedPools } from "./predefinedPools";

interface EditFormProps {
  contractId: string;
  web3Gateway?: EthereumGateway;
  closeForm: () => void;
}

export const EditForm: React.FC<EditFormProps> = ({ contractId, web3Gateway, closeForm }) => {
  const navigate = useNavigate();
  const { address: userAccount } = useAccount();
  const { data: validators } = useValidators({ offset: 0, limit: 100 });
  const client = usePublicClient();

  const [contentState, setContentState] = useState<string>(ContentState.Review);
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");

  // Input validation setup
  const form = useForm<InputValuesBuyForm>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: async () => {
      const startTime = await client!.readContract({
        address: contractId as `0x${string}`,
        abi: abi.implementationAbi,
        functionName: "startingBlockTimestamp",
      });

      const poolInfo = getPoolInfo({ contractId, startedAt: startTime });
      const poolIndex = predefinedPools.findIndex((p) => p.address === poolInfo?.poolAddress);
      const isLightning = poolIndex !== -1 && predefinedPools[poolIndex].isLightning;
      const validatorAddress = validators?.find((v) => v.addr === poolInfo?.validatorAddress)?.addr;

      const defaultValues = {
        poolAddress: poolInfo?.poolAddress || "",
        username: poolInfo && !isLightning ? poolInfo.username : "",
        predefinedPoolIndex: poolIndex,
        lightningAddress: poolInfo && isLightning ? poolInfo.username : "",
        validatorAddress: validatorAddress || "",
      };

      console.log("pulled default values", defaultValues);

      return defaultValues;
    },
  });

  console.log("values", form.getValues());

  // Controls contentState and creating a transaction
  const editContractAsync = async (data: InputValuesBuyForm) => {
    // Review
    if (contentState === ContentState.Review) {
      setContentState(ContentState.Confirm);
    }

    // Confirm
    if (contentState === ContentState.Confirm) {
      setContentState(ContentState.Pending);

      try {
        if (!web3Gateway) {
          console.error("Web3 is not connected");
          return;
        }
        if (!userAccount) {
          console.error("User is not connected");
          return;
        }

        const buyerDest = formatStratumUrl({
          host: data.poolAddress,
          username: data.username,
        });
        const validator = validators?.find((v) => v.addr === data.validatorAddress)!;
        if (!validator) {
          console.error("Validator is not set");
          return;
        }
        const validatorPublicKey = decompressPublicKey(validator.pubKeyYparity, validator.pubKeyX);

        const encrDestURL = await encryptMessage(validatorPublicKey.slice(2), buyerDest);

        const validatorURL = formatStratumUrl({
          host: validator.host,
          username: data.username,
        });
        const pubKey = await web3Gateway.getContractPublicKey(contractId);
        const encrValidatorURL = await encryptMessage(pubKey, validatorURL);

        const receipt = await web3Gateway.editContractDestination({
          from: userAccount,
          contractAddress: contractId,
          encrValidatorURL: encrValidatorURL.toString("hex"),
          encrDestURL: encrDestURL.toString("hex"),
        });

        const startTime = await client!.readContract({
          address: contractId as `0x${string}`,
          abi: abi.implementationAbi,
          functionName: "startingBlockTimestamp",
        });

        if (!receipt.status) {
          console.error("Edit failed", receipt);
          setAlertMessage(AlertMessage.EditFailed);
          setAlertOpen(true);
          setContentState(ContentState.Cancel);
        }

        setContentState(ContentState.Complete);
        setPoolInfo({
          contractId,
          poolAddress: data.poolAddress,
          username: data.username || data.lightningAddress,
          startedAt: startTime,
          validatorAddress: data.validatorAddress,
        });
      } catch (error) {
        const typedError = error as Error;
        printError(typedError.message, typedError.stack as string);
        getHandlerBlockchainError(setAlertMessage, setAlertOpen, setContentState)(typedError);
      }
    }
  };

  function renderContent() {
    const validatorHost = validators?.find((v) => v.addr === form.getValues().validatorAddress)?.host;

    switch (contentState) {
      case ContentState.Confirm:
        return <ConfirmContent data={form.getValues()} validator={validatorHost} />;
      case ContentState.Pending:
      case ContentState.Complete:
        return (
          <CompletedContent
            contentState={contentState}
            isEdit
            useLightningPayouts={form.getValues().lightningAddress !== ""}
          />
        );
      default:
        return <ReviewContent form={form} />;
    }
  }

  function renderParagraph() {
    switch (contentState) {
      case ContentState.Confirm:
        return paragraphText.confirm;
      case ContentState.Pending:
      case ContentState.Complete:
        return paragraphText.completed;
      default:
        return paragraphText.review;
    }
  }

  function renderButton() {
    switch (contentState) {
      case ContentState.Confirm:
        return buttonText.confirmChanges;
      case ContentState.Pending:
      case ContentState.Complete:
        return buttonText.completed;
      default:
        return buttonText.edit;
    }
  }

  // Set styles and button based on ContentState
  const displayIntroText = !(contentState === ContentState.Pending || contentState === ContentState.Complete);

  const { isValid } = form.formState;

  return (
    <>
      <Alert message={alertMessage} isOpen={alertOpen} onClose={() => setAlertOpen(false)} />
      {displayIntroText && (
        <>
          <h2>Edit Order</h2>
          <ContractLink
            href={`${process.env.REACT_APP_ETHERSCAN_URL}${contractId as string}`}
            target="_blank"
            rel="noreferrer"
          >
            Contract Address: {truncateAddress(contractId as string, AddressLength.MEDIUM)}
          </ContractLink>
        </>
      )}
      {renderContent()}
      {displayIntroText && <p className="subtext">{renderParagraph()}</p>}
      <FormButtonsWrapper>
        <SecondaryButton
          type="submit"
          onClick={() => {
            closeForm();
            form.reset();
          }}
        >
          Close
        </SecondaryButton>
        {contentState !== ContentState.Pending &&
          getButton(
            contentState,
            renderButton(),
            () => {
              closeForm();
              navigate(PathName.BuyerHub);
            },
            async () => {
              if (!isValid) {
                const isValidated = await form.trigger();
                if (!isValidated) {
                  return;
                }
              }
              editContractAsync(form.getValues());
            },
            false,
            form.formState.isValidating,
          )}
      </FormButtonsWrapper>
    </>
  );
};
