import { type FC, memo } from "react";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import {
  type Control,
  useController,
  type UseFormResetField,
  type UseFormSetValue,
  useFormState,
  useWatch,
} from "react-hook-form";
import { useValidators } from "../../../hooks/data/useValidators";
import type { InputValuesBuyForm, HashRentalContractV2 } from "../../../types/types";
import { validateLightningUrl } from "../../../utils/validators";
import { isValidLightningUsername, isValidHost, isValidUsername } from "../../../utils/validators";
import { ErrorWrapper, InputWrapper } from "./Forms.styled";
import { predefinedPools } from "../BuyerForms/predefinedPools";
import Alert from "@mui/material/Alert/Alert";
import { formatPaymentPrice } from "../../../lib/units";

const uncompressedPublicKeyRegex = /^0x04[0-9a-fA-F]{128}$/;

interface Props {
  control: Control<InputValuesBuyForm>;
  resetField: UseFormResetField<InputValuesBuyForm>;
  setValue: UseFormSetValue<InputValuesBuyForm>;
  purchaseType?: "purchase" | "purchase-and-resell";
  contract?: HashRentalContractV2;
}

export const CreateEditPurchaseForm: FC<Props> = memo(
  ({ control, resetField, setValue, purchaseType = "purchase", contract }) => {
    const { data: validators, isLoading: isLoadingValidators } = useValidators({
      offset: 0,
      limit: 100,
    });

    // register fields

    const poolAddressController = useController({
      name: "poolAddress",
      control: control,
      rules: {
        required: "Pool Address is required",
        validate: (poolAddress: string) => {
          if (isValidHost(poolAddress)) {
            return true;
          }
          return "Pool address should have the format: mypool.com:3333";
        },
      },
    });

    const formState = useFormState({ control });

    const usernameController = useController({
      name: "username",
      control: control,
      rules: {
        validate: (username: string, formValues: InputValuesBuyForm) => {
          if (formValues.predefinedPoolIndex === "") {
            return true;
          }
          const isManualPool = formValues.predefinedPoolIndex === -1;
          const isLightningPool = !isManualPool && predefinedPools[formValues.predefinedPoolIndex].isLightning;
          if (!isLightningPool) {
            return isValidUsername(username) || "Invalid username. Only letters a-z, numbers and .@- allowed";
          }
          return true;
        },
      },
    });

    const lightningAddressController = useController({
      name: "lightningAddress",
      control: control,
      rules: {
        validate: async (lightningAddress: string, formValues: InputValuesBuyForm) => {
          if (formValues.predefinedPoolIndex === "") {
            return true;
          }
          if (formValues.predefinedPoolIndex === -1) {
            return true;
          }
          const isLightningPool = predefinedPools[formValues.predefinedPoolIndex].isLightning;
          if (!isLightningPool) {
            return true;
          }
          if (!isValidLightningUsername(lightningAddress)) {
            return "Invalid lightning address format, it should be like bob@getalby.com";
          }

          const isValid = await validateLightningUrl(lightningAddress);
          if (!isValid) {
            return "This lightning address is not reachable";
          }
          return true;
        },
      },
    });

    const validatorAddressController = useController({
      name: "validatorAddress",
      control: control,
      rules: {
        required: "Validator is required",
      },
    });

    const predefinedPool = useController({
      name: "predefinedPoolIndex",
      control: control,
      rules: {
        required: true,
        onChange: (event) => {
          const value = event.target.value;
          const poolType = getPoolType(value);

          if (poolType === "pool") {
            resetField("lightningAddress");
            setValue("poolAddress", predefinedPools[value].address);
          }

          if (poolType === "manual") {
            resetField("poolAddress");
            resetField("lightningAddress");
          }

          if (poolType === "lightning") {
            resetField("username");
            setValue("poolAddress", predefinedPools[value].address);
          }
        },
      },
    });

    const customValidatorPublicKeyController = useController({
      name: "customValidatorPublicKey",
      control: control,
      rules: {
        validate: (validatorPublicKey: string, formValues: InputValuesBuyForm) => {
          if (formValues.validatorAddress !== "custom") {
            return true;
          }
          if (uncompressedPublicKeyRegex.test(validatorPublicKey)) {
            return true;
          }
          return "Public key should be an uncompressed public key in the hex format: '0x04...', 130 characters long";
        },
      },
    });

    const customValidatorHostController = useController({
      name: "customValidatorHost",
      control: control,
      rules: {
        validate: (validatorHost: string, formValues: InputValuesBuyForm) => {
          if (formValues.validatorAddress !== "custom") {
            return true;
          }
          if (isValidHost(validatorHost)) {
            return true;
          }
          return "Validator host should have the format: myvalidator.com:3333";
        },
      },
    });

    const resellToDefaultController = useController({
      name: "resellToDefault",
      control: control,
    });

    const profitPercentageController = useController({
      name: "profitPercentage",
      control: control,
      rules: {
        required: "Profit percentage is required",
        min: {
          value: 0,
          message: "Profit percentage must be at least 0",
        },
        max: {
          value: 100,
          message: "Profit percentage must be at most 100",
        },
      },
    });

    // useEffect(() => {
    //   if (!validators?.length || hasSetValidator.current) {
    //     return;
    //   }
    //   const index = Math.floor(Math.random() * validators.length);
    //   setValue("validatorAddress", validators[index].addr);
    //   hasSetValidator.current = true;
    // }, [validators, setValue]);

    const predefinedPoolIndex = useWatch({ control, name: "predefinedPoolIndex" });
    const isManualPool = predefinedPoolIndex && getPoolType(predefinedPoolIndex) === "manual";
    const isLightningPool = predefinedPoolIndex && getPoolType(predefinedPoolIndex) === "lightning";

    const isCustomValidator = useWatch({ control, name: "validatorAddress" }) === "custom";
    const resellToDefault = useWatch({ control, name: "resellToDefault" });

    if (isLoadingValidators || formState.isLoading) {
      return <></>;
    }

    return (
      <>
        {purchaseType === "purchase-and-resell" && (
          <InputWrapper style={{ maxWidth: "100%" }}>
            <FormControlLabel
              control={
                <Checkbox {...resellToDefaultController.field} checked={resellToDefaultController.field.value} />
              }
              label="Resell to default buyer"
            />
            <div style={{ marginTop: "8px", fontSize: "0.875rem", marginBottom: "32px" }}>
              No need to setup your pool account. Your contract will be immediately purchased by us until there is a new
              buyer
            </div>
          </InputWrapper>
        )}
        {!resellToDefault ? (
          <>
            <InputWrapper>
              <TextField
                select
                {...predefinedPool.field}
                label="Predefined Pools"
                error={!!predefinedPool.fieldState.error}
                helperText={predefinedPool.fieldState.error?.message}
              >
                {predefinedPools.map((item, index) => (
                  <MenuItem key={item.name} value={index}>
                    {item.name}
                  </MenuItem>
                ))}
                <MenuItem key="-1" value={-1}>
                  Manually enter pool address
                </MenuItem>
              </TextField>
            </InputWrapper>
            <InputWrapper>
              <TextField
                {...poolAddressController.field}
                id="poolAddress"
                type="text"
                placeholder="mypool.com:3333"
                label="Pool Address"
                disabled={!isManualPool}
                error={!!poolAddressController.fieldState.error}
                helperText={poolAddressController.fieldState.error?.message}
              />
            </InputWrapper>

            {isLightningPool ? (
              <InputWrapper>
                <TextField
                  {...lightningAddressController.field}
                  id="lightningAddress"
                  type="text"
                  placeholder="bob@getalby.com"
                  label="Lightning Address"
                  error={!!lightningAddressController.fieldState.error}
                  helperText={lightningAddressController.fieldState.error?.message}
                />
              </InputWrapper>
            ) : (
              <InputWrapper>
                <TextField
                  {...usernameController.field}
                  id="username"
                  placeholder="account.worker"
                  label="Username"
                  error={!!usernameController.fieldState.error}
                  helperText={usernameController.fieldState.error?.message}
                />
              </InputWrapper>
            )}

            <InputWrapper>
              <TextField
                id="validatorAddress"
                {...validatorAddressController.field}
                label="Validators"
                select
                error={!!validatorAddressController.fieldState.error}
                helperText={validatorAddressController.fieldState.error?.message}
              >
                {validators?.map((o) => (
                  <MenuItem value={o.addr} key={o.addr}>
                    {o.host}
                  </MenuItem>
                ))}
                <MenuItem value="custom">Custom Validator</MenuItem>
              </TextField>
            </InputWrapper>
          </>
        ) : (
          <>
            <InputWrapper>
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.7)", marginBottom: "4px" }}>
                  Purchase price
                </div>
                <div style={{ fontSize: "1rem", fontWeight: "500" }}>
                  {contract ? formatPaymentPrice(contract.price).full : "N/A"}
                </div>
              </div>
            </InputWrapper>
            <InputWrapper>
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.7)", marginBottom: "4px" }}>
                  Default buyer resell price
                </div>
                <div style={{ fontSize: "1rem", fontWeight: "500" }}>
                  <span>
                    {contract
                      ? `${formatPaymentPrice((Number(contract.price) * 0.95).toFixed().toString()).full}`
                      : "N/A"}
                  </span>
                  <span style={{ marginLeft: "16px" }}>- 5%</span>
                </div>
              </div>
            </InputWrapper>
          </>
        )}

        {purchaseType === "purchase-and-resell" && (
          <InputWrapper style={{ marginTop: "32px" }}>
            <TextField
              {...profitPercentageController.field}
              type="number"
              label="Resell Profit Target (%)"
              inputProps={{
                min: 0,
                max: 100,
                step: 1,
              }}
              error={!!profitPercentageController.fieldState.error}
              helperText={profitPercentageController.fieldState.error?.message}
              sx={{
                "& input[type=number]": {
                  "-moz-appearance": "textfield",
                },
                "& input[type=number]::-webkit-outer-spin-button": {
                  "-webkit-appearance": "none",
                  margin: 0,
                },
                "& input[type=number]::-webkit-inner-spin-button": {
                  "-webkit-appearance": "none",
                  margin: 0,
                },
              }}
            />
          </InputWrapper>
        )}

        {isCustomValidator && (
          <>
            <InputWrapper>
              <TextField
                {...customValidatorHostController.field}
                label="Custom Validator Host"
                error={!!customValidatorHostController.fieldState.error}
                helperText={customValidatorHostController.fieldState.error?.message}
              />
            </InputWrapper>
            <InputWrapper>
              <TextField
                {...customValidatorPublicKeyController.field}
                label="Custom Validator Public Key"
                error={!!customValidatorPublicKeyController.fieldState.error}
                helperText={customValidatorPublicKeyController.fieldState.error?.message}
              />
            </InputWrapper>
          </>
        )}
        {formState.errors.root && (
          <div className="mt-2">
            {Object.entries(formState.errors.root).map(([kind, err]) => (
              <ErrorWrapper key={kind}>
                <Alert severity="error">{formatErrorMessage(err)}</Alert>
              </ErrorWrapper>
            ))}
          </div>
        )}
      </>
    );
  },
  () => {
    return true;
  },
);

function getPoolType(predefinedPoolIndex: number) {
  if (predefinedPoolIndex === -1) {
    return "manual";
  }
  return predefinedPools[predefinedPoolIndex].isLightning ? "lightning" : "pool";
}

function formatErrorMessage(
  err:
    | string
    | number
    | Partial<{
        type: string | number;
        message: string;
      }>,
) {
  if (typeof err === "string") {
    return err;
  }
  if (typeof err === "number") {
    return err.toString();
  }
  return err.message;
}
