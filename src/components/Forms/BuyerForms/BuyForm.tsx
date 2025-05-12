import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  encryptMessage,
  formatStratumUrl,
  getButton,
  getHandlerBlockchainError,
  printError,
  type ErrorWithCode,
  truncateAddress,
} from "../../../utils/utils";
import { CompletedContent } from "./CompletedContent";
import { ConfirmContent } from "./ConfirmContent";
import { ReviewContent } from "./ReviewContent";
import { Alert as AlertMUI } from "@mui/material";
import { useNavigate } from "react-router";
import { useAccount } from "wagmi";
import { purchasedHashrate } from "../../../analytics";
import type { EthereumGateway } from "../../../gateway/ethereum";
import { decompressPublicKey } from "../../../gateway/utils";
import { useContracts } from "../../../hooks/data/useContracts";
import { useFeeTokenBalance } from "../../../hooks/data/useFeeTokenBalance";
import { usePaymentTokenBalance } from "../../../hooks/data/usePaymentTokenBalance";
import { useValidators } from "../../../hooks/data/useValidators";
import { AddressLength, AlertMessage, ContentState, type InputValuesBuyForm, PathName } from "../../../types/types";
import { buttonText } from "../../../utils/shared";
import { Alert } from "../../Alert";
import { ContractLink } from "../../Modal.styled";
import { FormButtonsWrapper, SecondaryButton } from "../FormButtons/Buttons.styled";
import { setPoolInfo } from "../../../gateway/localStorage";

interface BuyFormProps {
  contractId: string;
  web3Gateway?: EthereumGateway;
  setOpen: (isOpen: boolean) => void;
}

export const BuyForm: React.FC<BuyFormProps> = ({ contractId, web3Gateway, setOpen }) => {
  const navigate = useNavigate();
  const { address: userAccount } = useAccount();

  // data fetching
  const paymentTokenBalance = usePaymentTokenBalance(userAccount);
  const { data: validators } = useValidators({ offset: 0, limit: 100 });
  const feeTokenBalance = useFeeTokenBalance(userAccount);
  const contractsQuery = useContracts({ userAccount });

  // state management
  const [contentState, setContentState] = useState<string>(ContentState.Review);
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [purchasedTx, setPurchasedTx] = useState<string>("");

  // form setup
  const form = useForm<InputValuesBuyForm>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      poolAddress: "",
      username: "",
      validatorAddress: "",
      predefinedPoolIndex: "",
      lightningAddress: "",
    },
  });

  // Contract setup
  const contract = contractsQuery.data?.filter((contract) => contract.id === contractId)?.[0]!;

  const onSubmit = async (data: InputValuesBuyForm): Promise<void> => {
    if (contentState === ContentState.Review) {
      setContentState(ContentState.Confirm);
    }

    if (contentState === ContentState.Confirm) {
      setContentState(ContentState.Pending);

      if (contract.price && paymentTokenBalance.balance && paymentTokenBalance.balance < BigInt(contract.price)) {
        setAlertOpen(true);
        setAlertMessage("Insufficient USDC balance");
        return;
      }

      if (contract.fee && feeTokenBalance.balance && feeTokenBalance.balance < BigInt(contract.fee)) {
        setAlertOpen(true);
        setAlertMessage("Insufficient LMR balance");
        return;
      }

      try {
        if (!web3Gateway) {
          console.error("Web3 gateway is not available");
          return;
        }
        if (!userAccount) {
          console.error("User account is not available");
          return;
        }

        const receipt = await web3Gateway.approvePayment(contract.price, userAccount);
        if (!receipt.status) {
          setAlertMessage(AlertMessage.ApprovePaymentFailed);
          setAlertOpen(true);
          setContentState(ContentState.Cancel);
          return;
        }

        const feeReceipt = await web3Gateway.approveFee(contract.fee, userAccount);
        if (!feeReceipt.status) {
          setAlertMessage(AlertMessage.ApproveFeeFailed);
          setAlertOpen(true);
          setContentState(ContentState.Cancel);
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

        const pubKey = await web3Gateway.getContractPublicKey(contract.id);
        const encrValidatorURL = await encryptMessage(pubKey, validatorURL);

        const receipt2 = await web3Gateway.purchaseContract({
          contractAddress: contract.id,
          validatorAddress: validator.addr,
          encrValidatorURL: encrValidatorURL.toString("hex"),
          encrDestURL: encrDestURL.toString("hex"),
          buyer: userAccount,
          termsVersion: contract.version,
        });

        if (!receipt2.status) {
          setAlertMessage(AlertMessage.PurchaseFailed);
          setAlertOpen(true);
          setContentState(ContentState.Cancel);
          return;
        }
        setPurchasedTx(receipt2.transactionHash);
        purchasedHashrate(Number(contract.speed));
        setContentState(ContentState.Complete);
        setPoolInfo({
          contractId,
          startedAt: receipt2.timestamp,
          poolAddress: data.poolAddress,
          username: data.username || data.lightningAddress,
          validatorAddress: data.validatorAddress,
        });
      } catch (error) {
        const typedError = error as ErrorWithCode;
        printError(typedError.message, typedError.stack);
        getHandlerBlockchainError(setAlertMessage, setAlertOpen, setContentState)(typedError);
      }
    }
  };

  function renderContent() {
    switch (contentState) {
      case ContentState.Confirm: {
        const validator = validators?.find((v) => v.addr === form.getValues().validatorAddress)?.host;
        return <ConfirmContent data={form.getValues()} validator={validator} />;
      }
      case ContentState.Pending:
      case ContentState.Complete: {
        return (
          <CompletedContent
            contentState={contentState}
            tx={purchasedTx}
            useLightningPayouts={form.getValues().lightningAddress !== ""}
          />
        );
      }
      default: {
        return <ReviewContent form={form} />;
      }
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
          <h2>Purchase Hashpower</h2>
          <p className="font-normal mb-3">
            Enter the Pool Address, Port Number, and Username you are pointing the purchased hashpower to.
          </p>
          <ContractLink href={`${process.env.REACT_APP_ETHERSCAN_URL}${contract.id}`} target="_blank" rel="noreferrer">
            Contract Address: {truncateAddress(contract.id, AddressLength.MEDIUM)}
          </ContractLink>
        </>
      )}
      {contentState === ContentState.Confirm && (
        <AlertMUI severity="warning" sx={{ margin: "3px 0" }}>
          You will be prompted to approve 3 transactions through your wallet. Once they are confirmed, you will be
          redirected to view your order.
        </AlertMUI>
      )}

      {renderContent()}

      <FormButtonsWrapper>
        {contentState !== ContentState.Pending &&
          getButton(
            contentState,
            getButtonText(contentState),
            () => {
              setOpen(false);
              navigate(PathName.BuyerHub);
            },
            async () => {
              if (!isValid) {
                const isValidated = await form.trigger();
                if (!isValidated) {
                  return;
                }
              }
              onSubmit(form.getValues());
            },
            false,
            form.formState.isValidating,
          )}
        <SecondaryButton type="submit" onClick={() => setOpen(false)}>
          Close
        </SecondaryButton>
      </FormButtonsWrapper>
    </>
  );
};

function getButtonText(contentState: string) {
  switch (contentState) {
    case ContentState.Confirm:
      return buttonText.confirm;
    case ContentState.Pending:
      return buttonText.completed;
  }
  return buttonText.review;
}
