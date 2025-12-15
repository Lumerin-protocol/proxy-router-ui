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

/**
 * Validates numeric input for decimal numbers with up to 2 decimal places.
 * Prevents non-numeric characters (except single decimal point) and limits decimal places.
 * @param e - The beforeinput event
 */
export const handleNumericDecimalInput = (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const inputChar = e.data;

  // Allow deletion or navigation
  if (!inputChar) return;

  // Reject anything not digit or "."
  if (!/^[0-9.]$/.test(inputChar)) {
    e.preventDefault();
    return;
  }

  const current = e.target.value;
  const selectionStart = e.target.selectionStart;
  const selectionEnd = e.target.selectionEnd;

  // Predict the new value if input is allowed
  const newValue = current.slice(0, selectionStart ?? 0) + inputChar + current.slice(selectionEnd ?? 0);

  // Only one dot allowed
  if ((newValue.match(/\./g) || []).length > 1) {
    e.preventDefault();
    return;
  }

  // Max 2 digits after decimal
  const parts = newValue.split(".");
  if (parts[1] && parts[1].length > 2) {
    e.preventDefault();
    return;
  }
};

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
          type="text"
          inputMode={"numeric"}
          autoComplete="off"
          fullWidth
          variant="outlined"
          error={!!amountController.fieldState.error}
          helperText={amountController.fieldState.error?.message}
          onBeforeInput={handleNumericDecimalInput}
          inputProps={{
            min: 0.01,
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
