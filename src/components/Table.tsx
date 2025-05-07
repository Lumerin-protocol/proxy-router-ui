import { faAngleDoubleLeft, faAngleDoubleRight, faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ReactElement } from "react";
import type { TableInstance } from "react-table";
import { colors } from "../styles/styles.config";
import { classNames } from "../utils/utils";

interface TableProps<T extends object = {}> {
  id: string;
  tableInstance: TableInstance<T>;
  columnCount: number;
  pagination?: boolean;
}

export const Table = <T extends object = {}>({
  id,
  tableInstance,
  columnCount,
  pagination,
}: TableProps<T>): ReactElement | null => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = tableInstance;

  return (
    <div className="w-95 md:w-99">
      <table id={id} {...getTableProps()} className={classNames("relative border-separate w-full")}>
        <thead className="bg-lumerin-dark-gray h-500 sm:h-16 text-xxs sm:text-xs">
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className={`sticky pl-2 md:pl-4 text-justify top-0 bg-lumerin-dark-gray`}
                  style={{
                    width: `${Math.floor(100 / columnCount)}%`,
                    cursor:
                      column.id !== "id" && column.id !== "editCancel" && column.id !== "trade" ? "pointer" : "text",
                  }}
                >
                  {column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()} className="divide-y">
          {(pagination ? page : rows).map((row, index) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} className="h-600 sm:h-750 text-center">
                {row.cells.map((cell) => {
                  return (
                    <td
                      {...cell.getCellProps()}
                      className={`pl-2 md:pl-4 text-justify font-semibold text-xxs sm:text-sm`}
                    >
                      {cell.render("Cell")}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {pagination ? (
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
      ) : null}
    </div>
  );
};

Table.displayName = "Table";
Table.whyDidYouRender = false;
