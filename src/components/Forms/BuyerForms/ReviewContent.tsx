import { Checkbox, FormControlLabel, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { UseFormSetValue, type UseFormReturn } from "react-hook-form";
import { useValidators } from "../../../hooks/data/useValidators";
import { AlertMessage, type InputValuesBuyForm, Validator } from "../../../types/types";
import {
  isValidLightningUsername,
  isValidPoolAddress,
  isValidUsername,
} from "../../../utils/utils";
import { Alert } from "../../Alert";
// import { Checkbox } from "../../Checkbox";
import { InputWrapper } from "../Forms.styled";

interface PoolData {
  name: string;
  address: string;
  isLightning?: boolean;
}

interface Props {
  form: UseFormReturn<InputValuesBuyForm>;
  setValue: UseFormSetValue<InputValuesBuyForm>;
}

const predefinedPools: PoolData[] = [
  { name: "Luxor", address: "btc.global.luxor.tech:700" },
  { name: "Braiins", address: "stratum.braiins.com:3333" },
  {
    name: "Titan Lightning Pool",
    address: process.env.REACT_APP_TITAN_LIGHTNING_POOL,
    isLightning: true,
  },
];

export const ReviewContent: React.FC<Props> = ({ form, setValue }) => {
  const { data: validators, isLoading: isLoadingValidators } = useValidators({
    offset: 0,
    limit: 100,
  });

  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const hasSetValidator = React.useRef(false);

  // register fields

  const poolAddressController = form.register("poolAddress", {
    required: "Pool Address is required",
    validate: (poolAddress: string) => isValidPoolAddress(poolAddress) || "Invalid pool address.",
  });

  const usernameController = form.register("username", {
    required: "Username is required",
    validate: (username: string) => {
      return (
        isValidUsername(username) || "Invalid username. Only letters a-z, numbers and .@- allowed"
      );
    },
  });

  const lightningAddressController = form.register("lightningAddress", {
    required: "Lightning Address is required",
    validate: (lightningAddress: string) =>
      isValidLightningUsername(lightningAddress) || "Invalid email.",
  });

  const validatorAddressController = form.register("validatorAddress", {
    required: "Validator Address is required",
  });

  const poolController = form.register("predefinedPoolIndex", {
    required: "Pool is required",
    onChange: (event) => {
      const value = event.target.value;
      if (value >= 0) {
        setValue("poolAddress", predefinedPools[value].address);
      } else {
        setValue("poolAddress", "");
      }
    },
  });

  useEffect(() => {
    if (!validators?.length || hasSetValidator.current) {
      return;
    }
    const index = Math.floor(Math.random() * validators.length);
    setValue("validatorAddress", validators[index].addr);
    hasSetValidator.current = true;
    console.log("validatorAddress updated", validators[index].addr);
  }, [validators, setValue]);

  const predefinedPoolIndex = form.watch("predefinedPoolIndex");
  const validatorAddress = form.watch("validatorAddress");
  console.log("validatorAddress", validatorAddress);

  const isManualPool = predefinedPoolIndex === -1;
  const isLightningPool =
    !isManualPool && predefinedPoolIndex && predefinedPools[predefinedPoolIndex].isLightning;

  if (isLoadingValidators) {
    return <></>;
  }

  return (
    <>
      <Alert
        message={AlertMessage.RemovePort}
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
      />
      <div>
        <InputWrapper>
          <TextField
            id="validatorAddress"
            {...validatorAddressController}
            label="Validators"
            defaultValue=""
            select
          >
            {validators?.map((o) => (
              <MenuItem value={o.addr} key={o.addr}>
                {o.host}
              </MenuItem>
            ))}
          </TextField>
        </InputWrapper>

        {/* <Tooltip title='Temporary Unavailable' placement='top'>
					<DisabledButton>Become Validator</DisabledButton>
				</Tooltip> */}
      </div>

      <InputWrapper>
        <TextField select {...poolController} label="Predefined Pools" defaultValue="">
          {predefinedPools.map((item, index) => (
            <MenuItem key={item.name} value={index}>
              {item.name}
            </MenuItem>
          ))}
          <MenuItem key="-1" value={-1}>
            Enter manually
          </MenuItem>
        </TextField>
      </InputWrapper>
      <InputWrapper>
        <TextField
          {...poolAddressController}
          id="poolAddress"
          type="text"
          placeholder="mypool.com:3333"
          label="Pool Address"
          disabled={!isManualPool}
        />
      </InputWrapper>

      {isLightningPool ? (
        <InputWrapper>
          <TextField
            {...lightningAddressController}
            id="lightningAddress"
            type="text"
            placeholder="bob@getalby.com"
            label="Lightning Address"
          />
        </InputWrapper>
      ) : (
        <InputWrapper>
          <TextField
            {...usernameController}
            id="username"
            placeholder="account.worker"
            label="Username"
          />
        </InputWrapper>
      )}
    </>
  );
};

ReviewContent.displayName = "ReviewContent";
