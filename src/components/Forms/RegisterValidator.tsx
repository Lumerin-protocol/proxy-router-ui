import { useController, useForm } from "react-hook-form";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { GenericConfirmContent } from "./Shared/GenericConfirmContent";
import { TransactionForm } from "./Shared/MultistepForm";
import { formatUnits, parseUnits } from "viem";
import { memo, useRef } from "react";
import { validatorRegistryAbi } from "contracts-js/dist/abi/abi";
import { InputWrapper } from "./Shared/Forms.styled";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { formatFeePrice, validatorStakeToken } from "../../lib/units";
import { compressPublicKey } from "../../lib/pubkey";
import { isValidHost } from "../../utils/validators";
import { GenericCompletedContent } from "./Shared/GenericCompletedContent";
import { useGetPublicKey } from "../../hooks/data/usePublicKey";
import { useApproveStaking } from "../../hooks/data/useApproveStaking";

export interface RegisterValidatorInput {
  stake: string;
  host: string;
}

interface CreateFormProps {
  onClose: () => Promise<void>;
}

export const RegisterValidatorForm: React.FC<CreateFormProps> = memo(({ onClose }) => {
  const { address: userAccount } = useAccount();
  const wc = useWalletClient();
  const publicClient = usePublicClient();
  const minStakeRef = useRef<bigint>(0n);
  const { getPublicKeyAsync } = useGetPublicKey();
  const fee = useApproveStaking();

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
      onClose={onClose}
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
            Stake: `${form.getValues().stake} ${validatorStakeToken.symbol}`,
            Host: form.getValues().host,
          }}
        />
      )}
      resultForm={(props) => (
        <GenericCompletedContent
          title="Thank you for registering as a validator"
          description="Your validator is now available for other sellers on the Lumerin Marketplace."
        />
      )}
      transactionSteps={[
        {
          label: "Sign the message so we can retrieve your Public Key",
          action: async () => {
            const pk = await getPublicKeyAsync();
            pubKey.current = pk;
            return { isSkipped: false, txhash: undefined };
          },
        },
        {
          label: "Approve the stake",
          action: async () => {
            const data = form.getValues();
            const stake = parseUnits(data.stake, validatorStakeToken.decimals);

            const txhash = await fee.approveAsync({
              spender: process.env.REACT_APP_VALIDATOR_REGISTRY_ADDRESS,
              amount: stake,
            });

            return txhash ? { isSkipped: false, txhash } : { isSkipped: true };
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

            const txhash = await wc.data!.writeContract(req.request);
            return {
              isSkipped: false,
              txhash: txhash,
            };
          },
        },
      ]}
    />
  );
});
