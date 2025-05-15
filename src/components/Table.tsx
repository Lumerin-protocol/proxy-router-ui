import type { ReactNode } from "react";
import { flexRender, type Table as ReactTable } from "@tanstack/react-table";
import { classNames } from "../utils/utils";

import { faAngleDoubleLeft, faAngleDoubleRight, faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { colors } from "../styles/styles.config";
import styled from "@emotion/styled";
interface TableProps<T> {
  tableInstance: ReactTable<T>;
  columnCount: number;
  pagination?: boolean;
}

export const Table = <T,>({ tableInstance: table, pagination }: TableProps<T>): ReactNode => {
  const { getHeaderGroups, getRowModel } = table;

  return (
    <div className="w-95 md:w-99">
      <StyledTable className={classNames("relative w-full")}>
        <thead className="bg-lumerin-dark-gray h-500 sm:h-16 text-xxs sm:text-xs">
          {getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Th key={header.id} colSpan={header.colSpan}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </Th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {getRowModel().rows.map((row) => (
            <Tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <Td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Td>
              ))}
            </Tr>
          ))}
        </tbody>
        <tfoot>
          {table.getFooterGroups().map((footerGroup) => (
            <tr key={footerGroup.id}>
              {footerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.footer, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </tfoot>
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

export const StyledTable = styled.table`
  border-collapse: separate;
  border-spacing: 0 1em;
`;

export const Tr = styled.tr`
  background: radial-gradient(circle, rgba(0, 0, 0, 0) 36%, rgba(255, 255, 255, 0.05) 100%);
  border-radius: 9px;
  color: white;
  margin-bottom: 1rem;
  padding: 2rem;
  width: 100%;
  height: 100px;

  p {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    img {
      margin-right: 1rem;
      width: 20px;
    }
  }
`;

export const Td = styled.td`
  border-top: 1px solid rgba(171, 171, 171, 1);
  border-bottom: 1px solid rgba(171, 171, 171, 1);
  text-align: center;

  &:first-of-type {
    border-left: 1px solid rgba(171, 171, 171, 1);
    border-radius: 9px 0 0 9px;
  }

  &:last-of-type {
    border-right: 1px solid rgba(171, 171, 171, 1);
    border-radius: 0 9px 9px 0;
  }
`;

export const Th = styled.th`
  border-top: 1px solid rgba(171, 171, 171, 1);
  border-bottom: 1px solid rgba(171, 171, 171, 1);
  text-align: center;
  color: #fff;

  &:first-of-type {
    border-left: 1px solid rgba(171, 171, 171, 1);
    border-radius: 9px 0 0 9px;
  }

  &:last-of-type {
    border-right: 1px solid rgba(171, 171, 171, 1);
    border-radius: 0 9px 9px 0;
  }
`;
