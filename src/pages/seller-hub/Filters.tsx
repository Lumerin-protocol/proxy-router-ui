import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { SellerFilters, ToggleButtonIcon } from "./styled";
import type { ReactNode } from "react";
import { faFilter } from "@fortawesome/free-solid-svg-icons/faFilter";

type Props<T> = {
  readonly values: readonly {
    readonly icon: ReactNode;
    readonly text: string;
    readonly value: T;
  }[];
  quickFilter: T;
  setQuickFilter: (value: T) => void;
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
          renderValue={() => {
            if (quickFilter === "unset") {
              return (
                <>
                  <FontAwesomeIcon icon={faFilter} /> Filter
                </>
              );
            }
            return <>{quickFilter}</>;
          }}
        >
          <MenuItem value="unset">
            <FontAwesomeIcon icon={faFilter} />
            <span>Unset</span>
          </MenuItem>
          {props.values.map(({ value, icon, text }) => (
            <MenuItem key={value} value={value}>
              {icon}
              {text}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </SellerFilters>
  );
};
