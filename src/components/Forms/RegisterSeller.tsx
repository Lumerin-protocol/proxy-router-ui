import { useController, useForm } from "react-hook-form";
import { useAccount, usePublicClient, useReadContract, useWalletClient } from "wagmi";
import { GenericConfirmContent } from "./Shared/GenericConfirmContent";
import { TransactionForm } from "./Shared/MultistepForm";
import { parseUnits } from "viem";
import { InputWrapper } from "./Shared/Forms.styled";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { readContract } from "@wagmi/core";
import { config } from "../../clients/wagmi";
import { formatFeePrice, sellerStakeToken } from "../../lib/units";
import { truncateAddress } from "../../utils/utils";
import { GenericCompletedContent } from "./Shared/GenericCompletedContent";
import { useApproveFee } from "../../hooks/data/useApproveFee";
import { cloneFactoryAbi } from "contracts-js/dist/abi/abi";

export interface RegisterSellerInput {
  stake: string;
}

interface CreateFormProps {
  onClose: () => Promise<void>;
}

export const RegisterSellerForm: React.FC<CreateFormProps> = ({ onClose }) => {
  const publicClient = usePublicClient();
  const wc = useWalletClient();
  const { address } = useAccount();
  const { approveFeeAsync } = useApproveFee();

  const minSellerStakeQuery = useReadContract({
    address: process.env.REACT_APP_CLONE_FACTORY,
    abi: cloneFactoryAbi,
    functionName: "minSellerStake",
    query: {
      gcTime: Number.POSITIVE_INFINITY,
    },
  });

  // Input validation setup
  const form = useForm<RegisterSellerInput>({
    mode: "onBlur",
    defaultValues: async () => {
      const minStake = await readContract(config, {
        address: process.env.REACT_APP_CLONE_FACTORY,
        abi: cloneFactoryAbi,
        functionName: "minSellerStake",
      });

      return {
        stake: formatFeePrice(minStake).value,
      };
    },
  });

  const minStake = minSellerStakeQuery.isSuccess ? formatFeePrice(minSellerStakeQuery.data) : undefined;

  return (
    <TransactionForm
      onClose={onClose}
      client={publicClient!}
      title="Register yourself as a Seller"
      description="Register yourself as a Seller to start selling on the Lumerin Marketplace"
      inputForm={(props) => {
        const stakeController = useController({
          name: "stake",
          control: form.control,
          rules: {
            required: "Stake is required",
            min: {
              value: minStake?.value || "0",
              message: `Stake must be at least ${minStake?.value || "0"} ${sellerStakeToken.symbol}`,
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
          </>
        );
      }}
      validateInput={async () => {
        return await form.trigger();
      }}
      reviewForm={(props) => (
        <GenericConfirmContent
          data={{
            "Wallet Address": truncateAddress(address!),
            Stake: `${form.getValues().stake} ${sellerStakeToken.symbol}`,
          }}
        />
      )}
      resultForm={(props) => (
        <GenericCompletedContent
          title="Thank you for registering as a Seller"
          description="Your now can start creating hashpower contracts on the Lumerin Marketplace."
        />
      )}
      transactionSteps={[
        {
          label: "Approve the stake",
          action: async () => {
            const data = form.getValues();
            const stake = parseUnits(data.stake, sellerStakeToken.decimals);

            const txhash = await approveFeeAsync({
              spender: process.env.REACT_APP_CLONE_FACTORY as `0x${string}`,
              amount: stake,
            });

            return txhash ? { isSkipped: false, txhash } : { isSkipped: true };
          },
        },
        {
          label: "Register Seller",
          action: async () => {
            const data = form.getValues();
            const stake = parseUnits(data.stake, sellerStakeToken.decimals);

            const req = await publicClient!.simulateContract({
              address: process.env.REACT_APP_CLONE_FACTORY,
              abi: cloneFactoryAbi,
              functionName: "sellerRegister",
              args: [stake],
              account: address,
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
};
