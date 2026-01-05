import { useEffect, useRef, useState, type FC } from "react";
import { HeroHeadline, HeroWrapper } from "../landing/Landing.styled";
import { useController, useForm } from "react-hook-form";
import type { InputValuesBuyForm } from "../../types/types";
import { isValidLightningUsername, isValidHost, isValidUsername } from "../../utils/validators";
import { InputWrapper } from "../../components/Forms/Shared/Forms.styled";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { useModal } from "../../hooks/useModal";
import Button from "@mui/material/Button";
import { useHashrateIndexData, type TimePeriod } from "../../hooks/data/useHashRateIndexData";
import { HashrateChart } from "../../components/Charts/HashrateChart";

export const Test: FC = () => {
  const editModal = useModal();
  const [contractId, setContractId] = useState<string>("0x123");
  const [chartTimePeriod, setChartTimePeriod] = useState<TimePeriod>("day");

  const hashrateQuery = useHashrateIndexData({ timePeriod: chartTimePeriod });

  if (hashrateQuery.isSuccess) {
    console.log(hashrateQuery.data);
  }

  return (
    <HeroWrapper>
      <div className="content-wrapper">
        <HeroHeadline>Test</HeroHeadline>

        {/* Hashrate Chart */}
        <div style={{ marginBottom: "2rem" }}>
          <HashrateChart
            data={hashrateQuery.data || []}
            isLoading={hashrateQuery.isLoading}
            timePeriod={chartTimePeriod}
            onTimePeriodChange={setChartTimePeriod}
          />
        </div>

        <Button
          type="button"
          onClick={() => {
            setContractId(`0x124${Math.floor(Math.random() * 10000)}`);
            editModal.setOpen(!editModal.isOpen);
          }}
        >
          Edit
        </Button>

        {editModal.isOpen && (
          <TestChild
            contractId={contractId}
            setContractId={setContractId}
            closeModal={editModal.close}
            key={`edit-${contractId}`}
          />
        )}
      </div>
    </HeroWrapper>
  );
};

export const TestChild: FC<{
  contractId: string;
  setContractId: (contractId: string) => void;
  closeModal: () => void;
}> = ({ contractId, setContractId, closeModal }) => {
  const validators = [
    {
      addr: "0x123",
      host: "validator1.com",
    },
    {
      addr: "0x124",
      host: "validator2.com",
    },
  ];

  const predefinedPools = [
    { name: "Luxor", address: "btc.global.luxor.tech:700" },
    { name: "Braiins", address: "stratum.braiins.com:3333" },
    {
      name: "Titan Lightning Pool",
      address: process.env.REACT_APP_TITAN_LIGHTNING_POOL,
      isLightning: true,
    },
  ];

  const hasSetValidator = useRef(false);

  const form = useForm<InputValuesBuyForm>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: async () => {
      // fake async call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        validatorAddress: contractId,
        poolAddress: "btc.global.luxor.tech:700",
        username: "shev",
        predefinedPoolIndex: 0,
        lightningAddress: "",
        customValidatorPublicKey: "",
        customValidatorHost: "",
      };
    },
  });

  const poolAddressController = useController({
    name: "poolAddress",
    control: form.control,
    rules: {
      required: "Pool Address is required",
      validate: (poolAddress: string) => {
        if (isValidHost(poolAddress)) {
          return true;
        }
        return "Invalid pool address.";
      },
    },
  });

  const usernameController = useController({
    name: "username",
    control: form.control,
    rules: {
      required: false,
      validate: (username: string) => {
        if (isValidUsername(username)) {
          return true;
        }
        return "Invalid username. Only letters a-z, numbers and .@- allowed";
      },
    },
  });

  const lightningAddressController = useController({
    name: "lightningAddress",
    control: form.control,
    rules: {
      required: false,
      validate: (lightningAddress: string) => isValidLightningUsername(lightningAddress) || "Invalid email.",
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
      required: false,
      onChange: (event) => {
        // const value = event.target.value;
        // if (value >= 0) {
        //   const selectedPool = predefinedPools[value];
        //   form.setValue("poolAddress", selectedPool.address);
        // } else {
        //   form.setValue("poolAddress", "");
        //   form.setFocus("poolAddress");
        // }
      },
    },
  });

  // useEffect(() => {
  //   if (!validators?.length || hasSetValidator.current) {
  //     return;
  //   }
  //   const index = Math.floor(Math.random() * validators.length);
  //   form.setValue("validatorAddress", validators[index].addr);
  //   hasSetValidator.current = true;
  // }, [form.setValue]);

  const predefinedPoolIndex = form.watch("predefinedPoolIndex");

  const isManualPool = predefinedPoolIndex === -1;
  const isLightningPool = !isManualPool && predefinedPoolIndex && predefinedPools[predefinedPoolIndex].isLightning;

  useEffect(() => {
    if (isLightningPool) {
      form.setValue("username", "");
    } else {
      form.setValue("lightningAddress", "");
    }
  }, [isLightningPool, form]);

  if (form.formState.isLoading) {
    return <div>Loading...</div>;
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
            Enter manually
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

      {/* {isLightningPool ? ( */}
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
      {/* ) : ( */}
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
      {/* )} */}

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
      <div style={{ color: "white" }}>
        <div>Is form valid: {form.formState.isValid ? "true" : "false"}</div>
        <div>Errors: {JSON.stringify(form.formState.errors)}</div>
      </div>
    </>
  );
};
