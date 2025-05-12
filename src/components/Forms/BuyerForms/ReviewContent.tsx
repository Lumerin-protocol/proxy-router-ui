import { MenuItem, TextField, Tooltip } from "@mui/material";
import React, { useEffect } from "react";
import { useController, type UseFormReturn } from "react-hook-form";
import { useValidators } from "../../../hooks/data/useValidators";
import type { InputValuesBuyForm } from "../../../types/types";
import {
  isValidLightningUsername,
  isValidPoolAddress,
  isValidUsername,
  validateLightningUrl,
} from "../../../utils/utils";
import { InputWrapper } from "../Forms.styled";
import { DisabledButton } from "../FormButtons/Buttons.styled";
import styled from "@emotion/styled";
import { predefinedPools, type PoolData } from "./predefinedPools";

interface Props {
  form: UseFormReturn<InputValuesBuyForm>;
}

export const ReviewContent: React.FC<Props> = ({ form }) => {
  const { data: validators, isLoading: isLoadingValidators } = useValidators({
    offset: 0,
    limit: 100,
  });

  const hasSetValidator = React.useRef(false);

  // register fields

  const poolAddressController = useController({
    name: "poolAddress",
    control: form.control,
    rules: {
      required: "Pool Address is required",
      validate: (poolAddress: string) => {
        if (isValidPoolAddress(poolAddress)) {
          return true;
        }
        return "Pool address should have the format: mypool.com:3333";
      },
    },
  });

  const usernameController = useController({
    name: "username",
    control: form.control,
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
    control: form.control,
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
    control: form.control,
    rules: {
      required: "Validator is required",
    },
  });

  const predefinedPool = useController({
    name: "predefinedPoolIndex",
    control: form.control,
    rules: {
      required: true,
      onChange: (event) => {
        const value = event.target.value;
        if (value >= 0) {
          const selectedPool = predefinedPools[value];
          form.resetField("poolAddress");
          form.setValue("poolAddress", selectedPool.address);
        } else {
          form.resetField("poolAddress");
          form.setFocus("poolAddress");
        }
      },
    },
  });

  useEffect(() => {
    if (!validators?.length || hasSetValidator.current) {
      return;
    }
    const index = Math.floor(Math.random() * validators.length);
    form.setValue("validatorAddress", validators[index].addr);
    hasSetValidator.current = true;
  }, [validators, form]);

  const predefinedPoolIndex = form.watch("predefinedPoolIndex");

  const isManualPool = predefinedPoolIndex === -1;
  const isLightningPool = !isManualPool && predefinedPoolIndex && predefinedPools[predefinedPoolIndex].isLightning;

  useEffect(() => {
    if (isLightningPool) {
      form.resetField("username");
    } else {
      form.resetField("lightningAddress");
    }
  }, [isLightningPool, form]);

  if (isLoadingValidators || form.formState.isLoading) {
    return <></>;
  }

  return (
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

      <ValidatorRow>
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
          </TextField>
        </InputWrapper>

        <Tooltip title="Temporary Unavailable" placement="top">
          <BecomeValidatorButton>Become Validator</BecomeValidatorButton>
        </Tooltip>
      </ValidatorRow>
    </>
  );
};

const ValidatorRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0 1em;
`;

const BecomeValidatorButton = styled(DisabledButton)`
  height: unset;
  padding: 16.5px 1em;
  margin-top: 1.3rem;
  font-size: 0.8rem;
  background: rgb(52, 52, 52);
  color: rgb(225, 225, 225);
  opacity: 0.5;
`;
