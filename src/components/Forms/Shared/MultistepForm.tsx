import { type FC, type ReactNode, useState } from "react";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import styled from "@mui/material/styles/styled";
import CheckCircle from "@mui/icons-material/CheckCircle";
import SkipNext from "@mui/icons-material/SkipNext";
import ErrorIcon from "@mui/icons-material/Error";
import { FormButtonsWrapper, PrimaryButton, SecondaryButton } from "../FormButtons/Buttons.styled";
import { truncateAddress } from "../../../utils/utils";
import { BaseError, ContractFunctionRevertedError, type PublicClient, UserRejectedRequestError } from "viem";
import { type TransactionStep, type TxState, useMultistepTx } from "../../../hooks/useTxForm";
import { SpinnerV2 } from "../../Spinner.styled";
import { Link } from "react-router";
import { getTxUrl } from "../../../lib/indexer";

interface TransactionFormProps {
  title: string;
  description: ReactNode;
  inputForm?: FC<StepComponentProps>;
  validateInput?: () => Promise<boolean>;
  reviewForm: FC<StepComponentProps>;
  resultForm?: FC<StepComponentProps>;
  transactionSteps: TransactionStep[];
  client: PublicClient;
  onClose: () => void;
}

export const TransactionForm = (props: TransactionFormProps) => {
  const multistepTx = useMultistepTx({
    steps: props.transactionSteps,
    client: props.client,
  });

  async function handleExecuteTransaction(fromStep = 0) {
    for (let i = fromStep; i < props.transactionSteps.length; i++) {
      const success = await multistepTx.executeNextTransaction(i);
      if (!success) {
        console.error("transaction failed");
        return;
      }
    }
  }

  return (
    <MultistepForm
      steps={[
        ...(props.inputForm
          ? [
              {
                label: props.title,
                component: (p: StepComponentProps) => (
                  <>
                    <p>{props.description}</p>
                    {props.inputForm!(p)}
                    <MultistepFormActions
                      primary={{
                        label: "Review",
                        onClick: async () => {
                          if (props.validateInput && !(await props.validateInput())) {
                            return;
                          }
                          p.nextStep();
                        },
                      }}
                      secondary={{ label: "Cancel", onClick: () => props.onClose() }}
                    />
                  </>
                ),
              },
            ]
          : []),
        {
          label: props.title,
          component: (p) => (
            <>
              <p>{props.description}</p>
              {props.reviewForm(p)}
              <MultistepFormActions
                primary={{
                  label: "Execute",
                  onClick: () => {
                    p.nextStep();
                    handleExecuteTransaction();
                  },
                }}
                secondary={{ label: "Back", onClick: () => p.prevStep() }}
              />
            </>
          ),
        },
        {
          label: props.title,
          component: (p) => (
            <>
              <MultipleTransactionProgress
                steps={props.transactionSteps}
                txState={multistepTx.txState}
                onRetry={(stepNumber) => handleExecuteTransaction(stepNumber)}
              />
              <MultistepFormActions
                primary={{
                  label: multistepTx.isSuccess && props.resultForm ? "Next" : "Close",
                  onClick: multistepTx.isSuccess && props.resultForm ? () => p.nextStep() : () => props.onClose(),
                  disabled: multistepTx.isPending,
                }}
              />
            </>
          ),
        },
        ...(props.resultForm
          ? [
              {
                label: props.title,
                component: (p: StepComponentProps) => (
                  <>
                    {props.resultForm!(p)}
                    <MultistepFormActions
                      primary={{ label: "Close", onClick: () => props.onClose() }}
                      secondary={{ label: "Back", onClick: () => p.prevStep() }}
                    />
                  </>
                ),
              },
            ]
          : []),
      ]}
    />
  );
};

// TransactionForm.whyDidYouRender = true;

export const MultipleTransactionProgress = (props: {
  steps: TransactionStep[];
  txState: Record<number, TxState>;
  onRetry: (txNumber: number) => void;
}) => {
  return (
    <div>
      <Alert severity="warning" sx={{ margin: "3px 0" }}>
        You will be prompted to approve {Object.entries(props.txState).length} transactions through your wallet. Once
        they are confirmed, you will be redirected to view your order.
      </Alert>
      <Steps>
        {Object.entries(props.txState).map(([index, tx]) => (
          <StepStyled key={index}>
            <StepLabel>{props.steps[Number(index)].label}</StepLabel>
            <StepProgressIcon>{getStepProgressIcon(tx.state)}</StepProgressIcon>
            <StepProgressLabel>{getStepProgressLabel(tx)}</StepProgressLabel>
            {tx.txhash && (
              <StepTxHash>
                TxHash: <TxLink to={getTxUrl(tx.txhash)}>{truncateAddress(tx.txhash)}</TxLink>
              </StepTxHash>
            )}
            {tx.error && (
              <>
                <StepError>{mapErrorToString(tx.error)}</StepError>
                <Button type="button" color="error" onClick={() => props.onRetry(Number(index))}>
                  Retry
                </Button>
              </>
            )}
          </StepStyled>
        ))}
      </Steps>
    </div>
  );
};

function mapErrorToString(error: Error): string {
  if (error instanceof BaseError) {
    let found: string | undefined;

    const err = error.walk((err) => {
      const errorString = knownError(err as BaseError);
      if (errorString) {
        found = errorString;
      }
      return false;
    });

    return found || error.message;
  }
  return error.message;
}

function knownError(error: BaseError): string | undefined {
  if (error instanceof UserRejectedRequestError) {
    return "User rejected transaction";
  }
  if (error instanceof ContractFunctionRevertedError) {
    return error.message;
  }
}

function getStepProgressIcon(tx: TxState["state"]): ReactNode {
  const style = {
    fontSize: "1.2rem",
  };
  switch (tx) {
    case "pending":
      return <></>;
    case "sending":
      return <SpinnerV2 />;
    case "sent":
      return <SpinnerV2 />;
    case "confirmed":
      return <CheckCircle style={style} />;
    case "failed":
      return <ErrorIcon style={style} />;
    case "skipped":
      return <SkipNext style={style} />;
  }
}

function getStepProgressLabel(tx: TxState): string {
  switch (tx.state) {
    case "pending":
      return "pending";
    case "sending":
      return "Please confirm the transaction in your wallet";
    case "sent":
      return "Waiting for confirmation";
    case "confirmed": {
      if (tx.txhash) {
        return "Transaction successful";
      }
      return "Success";
    }
    case "failed": {
      return "Failed";
    }
    case "skipped":
      return "Skipped";
  }
}

const Steps = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 1em;
`;

const StepStyled = styled("div")`
  display: grid;
  grid-template-columns: 2em 1fr;
  grid-auto-flow: row;
`;

const StepLabel = styled("div")`
  font-weight: 500;
  font-size: 1rem;
  margin-bottom: 0.8em;
  grid-column: span 2;
`;

const StepProgressIcon = styled("div")`
  font-weight: normal;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
`;

const StepProgressLabel = styled("div")`
  font-weight: normal;
  font-size: 1rem;
`;

const StepTxHash = styled("div")`
  font-weight: normal;
  font-size: 0.9rem;
  grid-column-start: 2;
`;

const StepError = styled("div")`
  font-weight: normal;
  color: red;
  grid-column-start: 2;
`;

const TxLink = styled(Link)`
  text-decoration: underline;
`;

// MultipleTransactionProgress.whyDidYouRender = true;

export type StepComponentProps = {
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
};

interface MultistepProps {
  steps: {
    label: string;
    component: FC<StepComponentProps>;
  }[];
}

export const MultistepForm = (props: MultistepProps) => {
  const [step, setStep] = useState(0);
  const StepComponent = props.steps[step].component;

  return (
    <>
      <h2>{props.steps[step].label}</h2>
      <StepComponent
        key={step}
        goToStep={setStep}
        nextStep={() => setStep(step + 1)}
        prevStep={() => setStep(step - 1)}
      />
    </>
  );
};

export const MultistepFormActions = (props: {
  primary?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  secondary?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
}) => {
  return (
    <FormButtonsWrapper>
      {props.primary && (
        <PrimaryButton type="submit" onClick={props.primary.onClick} disabled={props.primary.disabled}>
          {props.primary.label}
        </PrimaryButton>
      )}
      {props.secondary && (
        <SecondaryButton onClick={props.secondary.onClick} disabled={props.secondary.disabled}>
          {props.secondary.label}
        </SecondaryButton>
      )}
    </FormButtonsWrapper>
  );
};
