import { useController, useForm } from "react-hook-form";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import type { EthereumGateway } from "../../gateway/ethereum";
import { CompletedContent } from "./SellerForms/CompletedContent";
import { ConfirmContent, GenericConfirmContent } from "./SellerForms/ConfirmContent";
import { ReviewContent } from "./SellerForms/ReviewContent";
import { waitForBlockNumber } from "../../hooks/data/useContracts";
import { useQueryClient } from "@tanstack/react-query";
import { TransactionForm } from "./MultistepForm";
import { erc20Abi, formatUnits, parseUnits, type TransactionReceipt } from "viem";
import { ContentState } from "../../types/types";
import { FC, useRef } from "react";
import { validatorRegistryAbi } from "contracts-js/dist/abi/abi";
import { InputWrapper } from "./Forms.styled";
import { InputAdornment, TextField } from "@mui/material";
import { feeToken, formatFeePrice, validatorStakeToken } from "../../lib/units";
import { compressPublicKey } from "../../lib/pubkey";
import { errorToPOJO, getErr, isErr } from "../../lib/error";
import { useFeeTokenAddress } from "../../hooks/data/useFeeTokenBalance";
import { isValidHost } from "../../utils/utils";

export interface RegisterValidatorInput {
  stake: string;
  host: string;
}

interface CreateFormProps {
  web3Gateway: EthereumGateway;
  onClose: () => Promise<void>;
}

export const RegisterValidatorForm: React.FC<CreateFormProps> = ({ web3Gateway, onClose }) => {
  const { address: userAccount } = useAccount();
  const publicClient = usePublicClient();
  const feeTokenAddress = useFeeTokenAddress();
  const minStakeRef = useRef<bigint>(0n);

  const wc = useWalletClient();

  // Input validation setup
  const form = useForm<RegisterValidatorInput>({
    mode: "onBlur",
    defaultValues: async () => {
      const minStake = await publicClient!.readContract({
        address: process.env.REACT_APP_VALIDATOR_REGISTRY_ADDRESS as `0x${string}`,
        abi: validatorRegistryAbi,
        functionName: "stakeRegister",
      });

      minStakeRef.current = minStake;

      return {
        stake: formatFeePrice(minStake).value,
        host: "",
      };
    },
  });

  const pubKey = useRef<`0x${string}` | undefined>(undefined);

  return (
    <TransactionForm
      onCancel={onClose}
      client={publicClient!}
      title="Register yourself as a validator"
      description="Register yourself as a validator to start validating on the Lumerin Marketplace"
      inputForm={(props) => {
        const minStakeString = formatUnits(minStakeRef.current, validatorStakeToken.decimals);

        const stakeController = useController({
          name: "stake",
          control: form.control,
          rules: {
            required: "Stake is required",
            min: {
              value: minStakeString,
              message: `Stake must be at least ${minStakeString} ${validatorStakeToken.symbol}`,
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
            Stake: form.getValues().stake,
            Host: form.getValues().host,
          }}
        />
      )}
      resultForm={(props) => <CompletedContent contentState={ContentState.Complete} />}
      transactionSteps={[
        {
          label: "Sign the message so we can retrieve your Public Key",
          action: async () => {
            const pk = await web3Gateway.getPublicKey(userAccount!);
            pubKey.current = pk;
            return undefined;
          },
        },
        {
          label: "Approve the stake",
          action: async () => {
            const data = form.getValues();

            const stake = parseUnits(data.stake, validatorStakeToken.decimals);

            const currentAllowance = await publicClient!.readContract({
              address: feeTokenAddress.data!,
              abi: erc20Abi,
              functionName: "allowance",
              args: [userAccount!, process.env.REACT_APP_VALIDATOR_REGISTRY_ADDRESS],
            });

            if (currentAllowance >= stake) {
              return;
            }

            const req = await publicClient!.simulateContract({
              address: feeTokenAddress.data!,
              abi: erc20Abi,
              functionName: "approve",
              args: [process.env.REACT_APP_VALIDATOR_REGISTRY_ADDRESS, stake],
              account: userAccount,
            });

            return await wc.data!.writeContract(req.request);
          },
        },
        {
          label: "Register Validator",
          action: async () => {
            const data = form.getValues();
            const { yParity, x } = compressPublicKey(pubKey.current!);

            const stake = parseUnits(data.stake, validatorStakeToken.decimals);

            const req = await publicClient!.simulateContract({
              address: process.env.REACT_APP_VALIDATOR_REGISTRY_ADDRESS,
              abi: validatorRegistryAbi,
              functionName: "validatorRegister",
              args: [stake, yParity, x, data.host],
              account: userAccount,
            });

            return await wc.data!.writeContract(req.request);
          },
        },
      ]}
    />
  );
};
