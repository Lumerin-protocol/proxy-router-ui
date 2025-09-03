import ToggleButton from "@mui/material/ToggleButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import type { ReactNode } from "react";
import { faFilter } from "@fortawesome/free-solid-svg-icons/faFilter";
import styled from "@mui/material/styles/styled";

type Props<T> = {
  readonly values: readonly Value<T>[];
  quickFilter: T;
  setQuickFilter: (value: T) => void;
};

type Value<T> = {
  readonly icon: ReactNode;
  readonly text: string;
  readonly value: T;
};

export const FiltersButtonGroup = <T extends string | "unset">(props: Props<T>) => {
  const { quickFilter, setQuickFilter } = props;

  return (
    <SellerFilters>
      <FormControl>
        <ToggleButtonGroup
          value={quickFilter}
          exclusive
          onChange={(_, qf: T | null) => {
            if (!qf) {
              setQuickFilter("unset" as T);
              return;
            }

            setQuickFilter(qf);
          }}
        >
          {props.values.map(({ value, icon, text }) => (
            <ToggleButtonIcon key={value} value={value} icon={icon} text={text} />
          ))}
        </ToggleButtonGroup>
      </FormControl>
    </SellerFilters>
  );
};

export const FiltersSelect = <T extends string | "unset">(props: Props<T>) => {
  const { quickFilter, setQuickFilter } = props;
  const mapping = props.values.reduce<Record<T, Value<T>>>(
    (acc, { value, text, icon }) => {
      acc[value as T] = { text, icon, value: value as T };
      return acc;
    },
    {} as Record<T, Value<T>>,
  );

  const handleChange = (event: SelectChangeEvent<T>) => {
    const value = event.target.value as T;
    setQuickFilter(value);
  };

  return (
    <SellerFilters>
      <FormControl>
        <Select
          value={quickFilter}
          onChange={handleChange}
          displayEmpty
          renderValue={(val) => {
            const { icon, text } = mapping[val] || {
              icon: <FontAwesomeIcon icon={faFilter} />,
              text: "Filter",
            };

            return (
              <SelectedItem>
                {icon}
                {text}
              </SelectedItem>
            );
          }}
        >
          <MenuItemStyled value="unset" key="unset">
            <FontAwesomeIcon icon={faFilter} />
            <span>Unset</span>
          </MenuItemStyled>
          {props.values.map(({ value, icon, text }) => (
            <MenuItemStyled key={value} value={value}>
              {icon}
              {text}
            </MenuItemStyled>
          ))}
        </Select>
      </FormControl>
    </SellerFilters>
  );
};

const MenuItemStyled = styled(MenuItem)`
  gap: 0.5rem;
`;

const SellerFilters = styled("div")`
  display: flex;
  width: 100%;
`;

const ToggleButtonStyled = styled(ToggleButton)`
  display: flex;
  gap: 1em;
  align-items: center;
  justify-content: center;

  svg {
    fill: #fff;
  }
`;

const SelectedItem = styled("div")`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ToggleButtonIcon = (props: { value: NonNullable<unknown>; icon: ReactNode; text: string }) => {
  return (
    <ToggleButtonStyled value={props.value} size="medium">
      {props.icon}
      <span>{props.text}</span>
    </ToggleButtonStyled>
  );
};
