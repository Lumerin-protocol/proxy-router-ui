import type { ReactNode } from "react";
import { flexRender, type Table as ReactTable } from "@tanstack/react-table";
import { ArrowDownIcon } from "@heroicons/react/24/outline";
import { ArrowUpIcon } from "@heroicons/react/24/outline";
import { ArrowsUpDownIcon } from "@heroicons/react/24/outline";
import styled from "@mui/material/styles/styled";

interface TableProps<T> {
  tableInstance: ReactTable<T>;
  pagination?: boolean;
}

type ColumnMeta = {
  hideTitleMobile?: boolean;
};

export const Table = <T,>({ tableInstance: table, pagination }: TableProps<T>): ReactNode => {
  const { getFlatHeaders, getRowModel } = table;

  return (
    <div>
      <StyledTable>
        <TableHeader2>
          {getFlatHeaders().map((header) => (
            <TableHeadingStyled key={header.id} onClick={header.column.getToggleSortingHandler()}>
              {flexRender(header.column.columnDef.header, header.getContext())}
              {getSortIcon(header.column.getCanSort(), header.column.getIsSorted())}
            </TableHeadingStyled>
          ))}
        </TableHeader2>
        {getRowModel()?.rows.map((row) => (
          <Tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <Td key={cell.id}>
                {(cell.column.columnDef.meta as ColumnMeta)?.hideTitleMobile && (
                  <ColumnTitleMobile>{cell.column.columnDef.header as ReactNode}</ColumnTitleMobile>
                )}
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Td>
            ))}
          </Tr>
        ))}
      </StyledTable>
      {/* {pagination ? (
        <div>
          <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
            <FontAwesomeIcon icon={faAngleDoubleLeft} color={colors["lumerin-aqua"]} />
          </button>{" "}
          <button onClick={() => previousPage()} disabled={!canPreviousPage}>
            <FontAwesomeIcon icon={faAngleLeft} color={colors["lumerin-aqua"]} />
          </button>{" "}
          <button onClick={() => nextPage()} disabled={!canNextPage}>
            <FontAwesomeIcon icon={faAngleRight} color={colors["lumerin-aqua"]} />
          </button>{" "}
          <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
            <FontAwesomeIcon icon={faAngleDoubleRight} color={colors["lumerin-aqua"]} />
          </button>{" "}
          <span className="text-xs md:text-base">
            Page{" "}
            <strong className="text-lumerin-aqua">
              {pageIndex + 1} of {pageOptions.length}
            </strong>{" "}
          </span>
          <span className="text-xs md:text-base">
            | Go to page:{" "}
            <input
              className="pl-4 py-1 text-xs md:text-base text-lumerin-aqua border border-lumerin-aqua rounded-5"
              type="number"
              defaultValue={pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                gotoPage(page);
              }}
              style={{ width: "100px" }}
            />
          </span>{" "}
          <select
            className="pr-8 py-1 text-xs md:text-base text-lumerin-aqua border border-lumerin-aqua rounded-5"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
            }}
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      ) : null} */}
    </div>
  );
};

const getSortIcon = (canSort: boolean, sortDirection: "asc" | "desc" | false) => {
  if (!canSort) {
    return null;
  }

  switch (sortDirection) {
    case "asc":
      return <ArrowDownIcon className="h-4 w-4" />;
    case "desc":
      return <ArrowUpIcon className="h-4 w-4" />;
    default:
      return <ArrowsUpDownIcon className="h-4 w-4" />;
  }
};

export const StyledTable = styled("div")`
  border-collapse: separate;
  border-spacing: 0 1em;
  width: 100%;
  position: relative;
`;

const TableHeader2 = styled("div")`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
  grid-template-rows: 1fr;
  font-size: 0.625rem;
  align-items: center;
  border: 1px solid rgba(171, 171, 171, 1);
  border-radius: 9px;
  margin-bottom: 1rem;
  div {
    height: 3rem;
  }

  @media (min-width: 640px) {
    font-size: 0.75rem;
  }

  @media (max-width: 1024px) {
    height: unset;
    grid-template-columns: repeat(3, 1fr);
    div {
      height: 2rem;
    }
  }
`;

const Tr = styled("div")`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
  grid-template-rows: 1fr;
  background: radial-gradient(circle, rgba(0, 0, 0, 0) 36%, rgba(255, 255, 255, 0.05) 100%);
  border-radius: 9px;
  color: white;
  margin-bottom: 1rem;
  width: 100%;
  height: 100px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(171, 171, 171, 1);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr 1fr;
    grid-auto-flow: row;
    height: unset;
  }
`;

const TableHeadingStyled = styled("div")`
  text-align: center;
  color: #fff;
  cursor: pointer;
  font-weight: normal;
  font-size: 1.3em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  flex-wrap: wrap;
  gap: 0.2em 0.5em;

  svg {
    flex-shrink: 0;
  }
`;

const Td = styled("div")`
  text-align: center;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: safe center;
  gap: 0.2em;
  padding: 0.2em 0;
`;

const ColumnTitleMobile = styled("div")`
  display: none;
  font-size: 0.8em;
  color: rgb(194, 194, 194);

  @media (max-width: 1024px) {
    display: flex;
  }
`;
