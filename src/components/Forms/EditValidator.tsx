import { useController, useForm } from "react-hook-form";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import type { EthereumGateway } from "../../gateway/ethereum";
import { CompletedContent } from "./SellerForms/CompletedContent";
import { GenericConfirmContent } from "./Shared/GenericConfirmContent";
import { TransactionForm } from "./Shared/MultistepForm";
import { erc20Abi, parseUnits } from "viem";
import { ContentState } from "../../types/types";
import { type FC, useRef } from "react";
import { validatorRegistryAbi } from "contracts-js/dist/abi/abi";
import { InputWrapper } from "./Shared/Forms.styled";
import { InputAdornment, TextField } from "@mui/material";
import { formatFeePrice, parseValidatorStake, validatorStakeToken } from "../../lib/units";
import { compressPublicKey } from "../../lib/pubkey";
import { useFeeTokenAddress } from "../../hooks/data/useFeeTokenBalance";
import { isValidHost } from "../../utils/utils";
import { GenericCompletedContent } from "./Shared/GenericCompletedContent";

export interface EditValidatorInput {
  stake: string;
  host: string;
}

interface EditValidatorFormProps {
  web3Gateway: EthereumGateway;
  validatorStake: bigint;
  validatorHost: string;
  onClose: () => Promise<void>;
}

export const EditValidatorForm: FC<EditValidatorFormProps> = (props) => {
  const { address: userAccount } = useAccount();
  const publicClient = usePublicClient();
  const feeTokenAddress = useFeeTokenAddress();

  const wc = useWalletClient();

  // Input validation setup
  const form = useForm<EditValidatorInput>({
    mode: "onBlur",
    defaultValues: {
      stake: formatFeePrice(props.validatorStake).value,
      host: props.validatorHost,
    },
  });

  const pubKey = useRef<`0x${string}` | undefined>(undefined);

  return (
    <TransactionForm
      onCancel={props.onClose}
      client={publicClient!}
      title="Edit your validator record"
      description="Edit your validator record to update your stake or host"
      inputForm={() => {
        const stakeController = useController({
          name: "stake",
          control: form.control,
          rules: {
            required: "Stake is required",
            min: {
              value: formatFeePrice(props.validatorStake).value,
              message: "You cannot reduce your stake. Unregister if you want to exit.",
            },
          },
        });

        const hostController = useController({
          name: "host",
          control: form.control,
          rules: {
            required: "Validator host is required",
            validate: (poolAddress: string) => {
              if (isValidHost(poolAddress)) {
                return true;
              }
              return "Host address should have the format: myhost.com:3333";
            },
          },
        });

        return (
          <>
            <InputWrapper>
              <TextField
                {...stakeController.field}
                id="stake"
                type="number"
                label="Stake"
                error={!!stakeController.fieldState.error}
                helperText={stakeController.fieldState.error?.message}
                slotProps={{
                  input: {
                    endAdornment: <InputAdornment position="end">LMR</InputAdornment>,
                  },
                }}
              />
            </InputWrapper>
            <InputWrapper>
              <TextField
                {...hostController.field}
                id="host"
                type="text"
                label="Host"
                placeholder="validator.com:1234"
                error={!!hostController.fieldState.error}
                helperText={hostController.fieldState.error?.message}
              />
            </InputWrapper>
          </>
        );
      }}
      validateInput={async () => {
        return await form.trigger();
      }}
      reviewForm={(props) => (
        <GenericConfirmContent
          data={{
            Stake: `${form.getValues().stake} ${validatorStakeToken.symbol}`,
            Host: form.getValues().host,
          }}
        />
      )}
      resultForm={(props) => <GenericCompletedContent title="Your validator record has been updated" />}
      transactionSteps={[
        {
          label: "Sign the message so we can retrieve your Public Key",
          action: async () => {
            const pk = await props.web3Gateway.getPublicKey(userAccount!);
            pubKey.current = pk;
            return undefined;
          },
        },
        {
          label: "Approve the stake",
          action: async () => {
            const newValidatorStake = parseValidatorStake(form.getValues().stake);
            if (newValidatorStake === props.validatorStake) {
              return undefined;
            }
            const req = await publicClient!.simulateContract({
              address: feeTokenAddress.data!,
              abi: erc20Abi,
              functionName: "approve",
              args: [
                process.env.REACT_APP_VALIDATOR_REGISTRY_ADDRESS as `0x${string}`,
                BigInt(newValidatorStake - props.validatorStake),
              ],
            });

            return await wc.data!.writeContract(req.request);
          },
        },
        {
          label: "Register Validator",
          action: async () => {
            const data = form.getValues();
            const { yParity, x } = compressPublicKey(pubKey.current!);

            const newValidatorStake = parseValidatorStake(form.getValues().stake);
            const stakeToAdd = newValidatorStake - props.validatorStake;

            const req = await publicClient!.simulateContract({
              address: process.env.REACT_APP_VALIDATOR_REGISTRY_ADDRESS as `0x${string}`,
              abi: validatorRegistryAbi,
              functionName: "validatorRegister",
              args: [stakeToAdd, yParity, x, data.host],
              account: userAccount,
            });

            return await wc.data!.writeContract(req.request);
          },
        },
      ]}
    />
  );
};
