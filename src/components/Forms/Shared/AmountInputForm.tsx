import { type FC } from "react";
import TextField from "@mui/material/TextField";
import { type Control, useController } from "react-hook-form";
import { ErrorWrapper, InputWrapper } from "./Forms.styled";
import styled from "@mui/material/styles/styled";

interface Props {
  control: Control<{ amount: string }>;
  label?: string;
  additionalValidate?: (value: string) => string | true;
  onMaxClick?: () => void;
  showMaxButton?: boolean;
}

export const AmountInputForm: FC<Props> = ({
  control,
  label = "Amount",
  additionalValidate,
  onMaxClick,
  showMaxButton = false,
}) => {
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
        // Apply additional validation if provided
        if (additionalValidate) {
          const additionalResult = additionalValidate(value);
          if (additionalResult !== true) {
            return additionalResult;
          }
        }
        return true;
      },
    },
  });

  return (
    <InputWrapper>
      <InputContainer>
        <TextField
          {...amountController.field}
          label={label}
          type="number"
          autoComplete="off"
          fullWidth
          variant="outlined"
          error={!!amountController.fieldState.error}
          helperText={amountController.fieldState.error?.message}
          inputProps={{
            min: 0,
            step: "0.01",
          }}
          sx={{ flex: 1 }}
        />
        {showMaxButton && onMaxClick && (
          <MaxButton onClick={onMaxClick} type="button">
            Max
          </MaxButton>
        )}
      </InputContainer>
      {/* <ErrorWrapper>{amountController.fieldState.error?.message}</ErrorWrapper> */}
    </InputWrapper>
  );
};

const InputContainer = styled("div")`
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
`;

const MaxButton = styled("button")`
  padding: 0.75rem 1rem;
  background: #4c5a5f;
  color: #fff;
  height: 56px;
  width: 100px;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
  white-space: nowrap;

  &:hover {
    background: #5a6b70;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;
