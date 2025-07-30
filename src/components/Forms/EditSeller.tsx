import { useController, useForm } from "react-hook-form";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { GenericConfirmContent } from "./Shared/GenericConfirmContent";
import { TransactionForm } from "./Shared/MultistepForm";
import { parseUnits } from "viem";
import { memo, type FC } from "react";
import { InputWrapper } from "./Shared/Forms.styled";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { formatFeePrice, sellerStakeToken } from "../../lib/units";
import { GenericCompletedContent } from "./Shared/GenericCompletedContent";
import { cloneFactoryAbi } from "contracts-js/dist/abi/abi";
import { useFeeTokenBalance } from "../../hooks/data/useFeeTokenBalance";
import { useApproveStaking } from "../../hooks/data/useApproveStaking";

export interface EditSellerInput {
  stake: string;
}

interface EditSellerFormProps {
  sellerStake: bigint;
  onClose: () => Promise<void>;
}

export const EditSellerForm: FC<EditSellerFormProps> = memo(
  (props) => {
    const { address: userAccount } = useAccount();
    const pc = usePublicClient();
    const wc = useWalletClient();
    const fee = useApproveStaking();
    const balance = useFeeTokenBalance(userAccount!);

    // Input validation setup
    const form = useForm<EditSellerInput>({
      mode: "onBlur",
      defaultValues: {
        stake: formatFeePrice(props.sellerStake).value,
      },
    });

    const maxStakeValue = balance.data ? balance.data + props.sellerStake : undefined;

    return (
      <TransactionForm
        onClose={props.onClose}
        title="Edit your seller record"
        description="Edit your seller record to update your stake"
        inputForm={() => {
          const stakeController = useController({
            name: "stake",
            control: form.control,
            rules: {
              required: "Stake is required",
              min: {
                value: formatFeePrice(props.sellerStake).value,
                message: "You cannot reduce your stake. Unregister if you want to exit.",
              },
              max: {
                value: maxStakeValue ? formatFeePrice(maxStakeValue).value : Number.POSITIVE_INFINITY,
                message: `Not enough balance. The maximum stake you can have is ${
                  formatFeePrice(maxStakeValue!).valueRounded
                } ${sellerStakeToken.symbol}`,
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
              Stake: `${form.getValues().stake} ${sellerStakeToken.symbol}`,
            }}
          />
        )}
        resultForm={(props) => <GenericCompletedContent title="Your seller record has been updated" />}
        transactionSteps={[
          {
            label: "Approve the stake",
            action: async () => {
              const newSellerStake = parseUnits(form.getValues().stake, sellerStakeToken.decimals);
              const stakeToAdd = newSellerStake - props.sellerStake;

              const txhash = await fee.approveAsync({
                spender: process.env.REACT_APP_CLONE_FACTORY,
                amount: stakeToAdd,
              });

              return txhash ? { isSkipped: false, txhash } : { isSkipped: true };
            },
          },
          {
            label: "Update Seller Stake",
            action: async () => {
              const newSellerStake = parseUnits(form.getValues().stake, sellerStakeToken.decimals);
              const stakeToAdd = newSellerStake - props.sellerStake;

              const req = await pc!.simulateContract({
                address: process.env.REACT_APP_CLONE_FACTORY as `0x${string}`,
                abi: cloneFactoryAbi,
                functionName: "sellerRegister",
                args: [stakeToAdd],
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
  },
  (prevProps, nextProps) => {
    return prevProps.sellerStake === nextProps.sellerStake;
  },
);
