import { useController, useForm } from "react-hook-form";
import { useAccount, usePublicClient, useReadContract, useWalletClient } from "wagmi";
import { CompletedContent } from "./SellerForms/CompletedContent";
import { GenericConfirmContent } from "./Shared/GenericConfirmContent";
import { TransactionForm } from "./Shared/MultistepForm";
import { erc20Abi, parseUnits } from "viem";
import { ContentState } from "../../types/types";
import { InputWrapper } from "./Shared/Forms.styled";
import { InputAdornment, TextField } from "@mui/material";
import { useFeeTokenAddress } from "../../hooks/data/useFeeTokenBalance";
import { abi } from "contracts-js";
import { readContract } from "@wagmi/core";
import { config } from "../../clients/wagmi";
import { formatFeePrice, sellerStakeToken } from "../../lib/units";
import { truncateAddress } from "../../utils/utils";
import { GenericCompletedContent } from "./Shared/GenericCompletedContent";

const { cloneFactoryAbi } = abi;

export interface RegisterSellerInput {
  stake: string;
}

interface CreateFormProps {
  onClose: () => Promise<void>;
}

export const RegisterSellerForm: React.FC<CreateFormProps> = ({ onClose }) => {
  const publicClient = usePublicClient();
  const feeTokenAddress = useFeeTokenAddress();
  const wc = useWalletClient();
  const { address } = useAccount();

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
      onCancel={onClose}
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
              message: `Stake must be at least ${minStake?.full || "0"}`,
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

            const currentAllowance = await publicClient!.readContract({
              address: feeTokenAddress.data!,
              abi: erc20Abi,
              functionName: "allowance",
              args: [address!, process.env.REACT_APP_CLONE_FACTORY],
            });
            if (currentAllowance >= stake) {
              return { isSkipped: true };
            }

            const req = await publicClient!.simulateContract({
              address: feeTokenAddress.data!,
              abi: erc20Abi,
              functionName: "approve",
              args: [process.env.REACT_APP_CLONE_FACTORY, stake],
              account: address,
            });

            const txhash = await wc.data!.writeContract(req.request);
            return {
              isSkipped: false,
              txhash: txhash,
            };
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
