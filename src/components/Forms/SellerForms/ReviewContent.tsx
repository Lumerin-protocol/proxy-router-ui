import { useController, type UseFormReturn } from "react-hook-form";
import { InputWrapper } from "../Forms.styled";
import type { InputValuesCreateForm } from "./CreateForm";
import { InputAdornment, TextField } from "@mui/material";
import type { FC } from "react";

interface ReviewContentProps {
  form: UseFormReturn<InputValuesCreateForm>;
  isCreate?: boolean;
}

export const ReviewContent: FC<ReviewContentProps> = ({ form, isCreate }) => {
  const walletAddressController = useController({
    name: "walletAddress",
    control: form.control,
    rules: {
      required: "Wallet Address is required",
    },
  });

  const durationHoursController = useController({
    name: "durationHours",
    control: form.control,
    rules: {
      required: "Contract Duration is required",
      min: { value: 24, message: "Contract Duration must be at least 24 hours" },
    },
  });

  const speedTHPSController = useController({
    name: "speedTHPS",
    control: form.control,
    rules: {
      required: "Speed is required",
      min: { value: 100, message: "Speed must be at least 100 TH/s" },
    },
  });

  const profitTargetPercentController = useController({
    name: "profitTargetPercent",
    control: form.control,
    rules: {
      required: "Profit Target is required",
      min: { value: -128, message: "Profit Target must be at least -128" },
      max: { value: 127, message: "Profit Target must be at most 127" },
    },
  });

  return (
    <>
      <InputWrapper>
        <TextField
          {...walletAddressController.field}
          id="walletAddress"
          type="text"
          placeholder="0x0000000000000000000000000000000000000000"
          label="Ethereum Address"
          disabled
          error={!!walletAddressController.fieldState.error}
          helperText={walletAddressController.fieldState.error?.message}
        />
      </InputWrapper>
      <InputWrapper>
        <TextField
          {...durationHoursController.field}
          type="number"
          label="Contract Duration (hours)"
          placeholder="24"
          error={!!durationHoursController.fieldState.error}
          helperText={durationHoursController.fieldState.error?.message}
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="end">hours</InputAdornment>,
            },
          }}
        />
      </InputWrapper>
      <InputWrapper>
        <TextField
          {...speedTHPSController.field}
          type="number"
          label="Speed (TH/S)"
          placeholder="TH/S"
          error={!!speedTHPSController.fieldState.error}
          helperText={speedTHPSController.fieldState.error?.message}
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="end">TH/s</InputAdornment>,
            },
          }}
        />
      </InputWrapper>
      <InputWrapper>
        <TextField
          {...profitTargetPercentController.field}
          type="number"
          label="Profit Target Percent"
          placeholder="5"
          error={!!profitTargetPercentController.fieldState.error}
          helperText={profitTargetPercentController.fieldState.error?.message}
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            },
          }}
        />
      </InputWrapper>
    </>
  );
};
