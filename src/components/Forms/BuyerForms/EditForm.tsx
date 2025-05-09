/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useAccount } from "wagmi";
import type { EthereumGateway } from "../../../gateway/ethereum";
import { useContracts } from "../../../hooks/data/useContracts";
import {
  AddressLength,
  AlertMessage,
  ContentState,
  type ContractInfo,
  type FormData,
  type InputValuesBuyForm,
  PathName,
} from "../../../types/types";
import { buttonText, paragraphText } from "../../../utils/shared";
import {
  encryptMessage,
  getButton,
  getHandlerBlockchainError,
  getPoolRfc2396,
  isNoEditBuyer,
  printError,
  truncateAddress,
  validateLightningUrl,
} from "../../../utils/utils";
import { Alert } from "../../Alert";
import { ContractLink } from "../../Modal.styled";
import { FormButtonsWrapper, SecondaryButton } from "../FormButtons/Buttons.styled";
import { CompletedContent } from "./CompletedContent";
import { ConfirmContent } from "./ConfirmContent";
import { ReviewContent } from "./ReviewContent";

// Used to set initial state for contentData to prevent undefined error
const initialFormData: FormData = {
  poolAddress: "",
  portNumber: "",
  username: "",
  password: "",
  speed: "",
  price: "",
};

interface EditFormProps {
  contractId: string;
  web3Gateway?: EthereumGateway;
  closeForm: () => void;
}

export const EditForm: React.FC<EditFormProps> = ({ contractId, web3Gateway, closeForm }) => {
  const { address: userAccount } = useAccount();
  const contractsQuery = useContracts({ userAccount });

  const contract = contractsQuery.data?.filter((contract) => contract.id === contractId)?.[0];

  const [contentState, setContentState] = useState<string>(ContentState.Review);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [usedLightningPayoutsFlow, setUsedLightningPayoutsFlow] = useState<boolean>(false);
  const [validatingUrl, setValidatingUrl] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);

  const navigate = useNavigate();

  const handleEditError = getHandlerBlockchainError(setAlertMessage, setAlertOpen, setContentState);

  // Input validation setup
  const {
    register,
    clearErrors,
    formState: { errors, isValid },
    trigger,
  } = useForm<InputValuesBuyForm>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      portNumber: "",
      poolAddress: "",
      username: "",
      predefinedPoolIndex: -1,
      useLightningPayouts: false,
      lightningAddress: "",
    },
  });

  // Contract setup
  const getContractInfo: () => ContractInfo = () => {
    return {
      speed: contract.speed as string,
      price: contract.price as string,
      length: contract.length as string,
    };
  };

  // Controls contentState and creating a transaction
  const editContractAsync: (data: InputValuesBuyForm) => void = async (data) => {
    if (isNoEditBuyer(contract, userAccount)) return;

    // Review
    if (isValid && contentState === ContentState.Review) {
      setContentState(ContentState.Confirm);
      setFormData({
        poolAddress: data.poolAddress,
        portNumber: data.portNumber,
        username: data.username,
        password: data.password,
        ...getContractInfo(),
      });
    }

    // Confirm
    if (isValid && contentState === ContentState.Confirm) {
      setContentState(ContentState.Pending);
    }

    // Pending
    if (isValid && contentState === ContentState.Pending) {
      try {
        if (!web3Gateway) {
          console.error("Web3 is not connected");
          return;
        }

        const buyerDest: string = getPoolRfc2396(formData)!;
        // const validatorPublicKey = (await getValidatorPublicKey()) as string;
        // const encryptedBuyerInput = (await encryptMessage(validatorPublicKey.slice(2), buyerDest)).toString("hex");

        // const validatorURL: string = `stratum+tcp://:@${getValidatorURL()}`;
        const validatorURL: string = `stratum+tcp://:@`;
        const pubKey = await web3Gateway.getContractPublicKey(contractId);
        const encrValidatorURL = (await encryptMessage(`04${pubKey}`, validatorURL)).toString(
          "hex"
        );

        const receipt = await web3Gateway.editContractDestination({
          from: userAccount,
          contractAddress: contractId,
          encrValidatorURL: encrValidatorURL,
          encrDestURL: encryptedBuyerInput,
        });

        if (receipt?.status) {
          setContentState(ContentState.Complete);
          localStorage.setItem(
            contractId,
            JSON.stringify({ poolAddress: formData.poolAddress, username: formData.username })
          );
        } else {
          setAlertMessage(AlertMessage.EditFailed);
          setAlertOpen(true);
          setContentState(ContentState.Cancel);
        }
      } catch (error) {
        const typedError = error as Error;
        printError(typedError.message, typedError.stack as string);
        handleEditError(typedError);
      }
    }

    // Completed
    if (contentState === ContentState.Complete) {
      closeForm();
    }
  };

  // Check if user is buyer and contract is running
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isNoEditBuyer(contract, userAccount)) {
      setAlertOpen(true);
      setAlertMessage(AlertMessage.NoEditBuyer);
      timeoutId = setTimeout(() => closeForm(), 3000);
    }

    return () => clearTimeout(timeoutId);
  }, []);

  // Create transaction when in pending state
  useEffect(() => {
    if (contentState === ContentState.Pending) editContractAsync(formData);
  }, [contentState]);

  // Content setup
  // Defaults to review state
  // Initialize variables since html elements need values on first render
  let paragraphContent = "";
  let buttonContent = "";
  let content = <div></div>;
  const createContent: () => void = () => {
    switch (contentState) {
      case ContentState.Confirm:
        paragraphContent = paragraphText.confirm as string;
        buttonContent = buttonText.confirmChanges as string;
        content = <ConfirmContent data={formData} />;
        break;
      case ContentState.Pending:
      case ContentState.Complete:
        buttonContent = buttonText.completed as string;
        content = (
          <CompletedContent
            contentState={contentState}
            isEdit
            useLightningPayouts={usedLightningPayoutsFlow}
          />
        );
        break;
      default:
        paragraphContent = paragraphText.review as string;
        buttonContent = buttonText.edit as string;
        content = (
          <ReviewContent
            register={register}
            errors={errors}
            buyerString={contract.encryptedPoolData}
            // TODO: path validator for edit form
            validators={[]}
            isEdit={true}
            inputData={formData}
            setFormData={setFormData}
            clearErrors={clearErrors}
            onUseLightningPayoutsFlow={(e) => {
              setUsedLightningPayoutsFlow(e);
              trigger("poolAddress");
              clearErrors();
              setShowValidationError(false);
            }}
            showValidationError={showValidationError}
          />
        );
    }
  };
  createContent();

  const onSubmit = () => {
    setShowValidationError(false);
    if (usedLightningPayoutsFlow) {
      setValidatingUrl(true);
      validateLightningUrl(formData?.username).then((isValid) => {
        setValidatingUrl(false);
        if (isValid) {
          editContractAsync(formData);
        } else {
          setShowValidationError(true);
        }
      });
      return;
    }
    editContractAsync(formData);
  };

  // Set styles and button based on ContentState
  const display =
    contentState === ContentState.Pending || contentState === ContentState.Complete ? false : true;

  return (
    <Fragment>
      <Alert message={alertMessage} isOpen={alertOpen} onClose={() => setAlertOpen(false)} />
      {display && (
        <>
          <h2>Edit Order</h2>
          <ContractLink
            href={`${process.env.REACT_APP_ETHERSCAN_URL}${contract.id as string}`}
            target="_blank"
            rel="noreferrer"
          >
            Contract Address: {truncateAddress(contract.id as string, AddressLength.MEDIUM)}
          </ContractLink>
        </>
      )}
      {content}
      {display && <p className="subtext">{paragraphContent}</p>}
      <FormButtonsWrapper>
        <SecondaryButton type="submit" onClick={() => closeForm()}>
          Close
        </SecondaryButton>
        {contentState !== ContentState.Pending &&
          getButton(
            contentState,
            buttonContent,
            () => {
              closeForm();
              navigate(PathName.BuyerHub);
            },
            () => onSubmit(),
            !isValid,
            validatingUrl
          )}
      </FormButtonsWrapper>
    </Fragment>
  );
};

EditForm.displayName = "EditForm";
