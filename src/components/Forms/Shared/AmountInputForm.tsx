import { type FC } from "react";
import TextField from "@mui/material/TextField";
import { type Control, useController } from "react-hook-form";
import { ErrorWrapper, InputWrapper } from "./Forms.styled";

interface Props {
  control: Control<{ amount: string }>;
  label?: string;
}

export const AmountInputForm: FC<Props> = ({ control, label = "Amount" }) => {
  const amountController = useController({
    name: "amount",
    control: control,
    rules: {
      required: `${label} is required`,
      validate: (value: string) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue <= 0) {
          return `${label} must be a positive number`;
        }
        return true;
      },
    },
  });

  return (
    <InputWrapper>
      <TextField
        {...amountController.field}
        label={label}
        type="number"
        fullWidth
        variant="outlined"
        error={!!amountController.fieldState.error}
        helperText={amountController.fieldState.error?.message}
        inputProps={{
          min: 0,
          step: "0.01",
        }}
      />
      <ErrorWrapper>{amountController.fieldState.error?.message}</ErrorWrapper>
    </InputWrapper>
  );
};
