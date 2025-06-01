import styled from "@mui/material/styles/styled";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Toolbar from "@mui/material/Toolbar";
import useMediaQuery from "@mui/material/useMediaQuery";
import { SortTypes } from "../types/types";

const StyledToolbar = styled(Toolbar)`
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  width: 100%;
  padding: 0 !important;
  select {
    background-color: none;
    border: none;
  }
`;

export const SortToolbar = (props: {
  pageTitle: string;
  sortType: string;
  setSortType: (sortType: SortTypes) => void;
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <StyledToolbar>
      <h2 className="text-xl text-white font-Raleway font-regular text-left">{!isMobile ? props.pageTitle : ""}</h2>

      <Box sx={{ minWidth: 120 }}>
        <FormControl fullWidth>
          <InputLabel id="sort-label">Sort By</InputLabel>
          <Select
            labelId="sort-label"
            id="sort"
            value={props.sortType}
            label="Sort By"
            onChange={(e) => props.setSortType(e.target.value as SortTypes)}
          >
            {Object.values(SortTypes).map((value) => (
              <MenuItem value={value} key={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </StyledToolbar>
  );
};
