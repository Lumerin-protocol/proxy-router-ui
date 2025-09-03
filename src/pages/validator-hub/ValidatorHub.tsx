import AddIcon from "@mui/icons-material/Add";
import CancelIcon from "@mui/icons-material/CancelOutlined";
import { type FC, type HTMLProps, useEffect, useMemo, useRef, useState } from "react";
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type RowData,
  type Row,
  type FilterMeta,
} from "@tanstack/react-table";
import { Spinner } from "../../components/Spinner.styled";
import { Table } from "../../components/Table";
import { TableIcon } from "../../components/TableIcon";
import { AddressLength } from "../../types/types";
import { useContracts } from "../../hooks/data/useContracts";
import { useAccount } from "wagmi";
import { useModal } from "../../hooks/useModal";
import { formatFeePrice, formatPaymentPrice, formatHashrateTHPS } from "../../lib/units";
import { ModalItem } from "../../components/Modal";
import { faSackDollar } from "@fortawesome/free-solid-svg-icons/faSackDollar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Pickaxe } from "../../components/Icons/Pickaxe";
import { SellerActions, SellerToolbar } from "../seller-hub/styled";
import { useValidatorHistory } from "../../hooks/data/useValidatorHistory";
import type { ValidatorHistoryEntry } from "../../gateway/interfaces";
import { truncateAddress } from "../../utils/formatters";
import { formatDateTime } from "../../lib/date";
import { WidgetsWrapper } from "../marketplace/styled";
import { ValidatorWidget } from "../../components/Widgets/ValidatorWidget";
import { ClaimForm } from "../../components/Forms/ClaimForm";
import { getStatus, ProgressCell } from "./ProgressCell";
import { isAddressEqual } from "viem";
import { TableToolbarButton } from "../../components/TableToolbarButton";
import { useMediaQuery } from "@mui/material";
import { FiltersButtonGroup, FiltersSelect } from "../../components/Filters";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { ValidatorStatsWidget } from "../../components/Widgets/ValidatorStatsWidget";

export const ValidatorHub: FC = () => {
  const { address: userAccount } = useAccount();
  const validatorHistory = useValidatorHistory({ address: userAccount! });
  const contracts = useContracts();

  const [_selectedRows, setSelectedRows] = useState<Record<`0x${string}`, boolean>>({});
  const [selectedContractAddresses, setSelectedContractAddresses] = useState<`0x${string}`[]>([]);

  const selectedRows = Object.entries(_selectedRows).reduce((acc, [key, value]) => {
    if (value) {
      acc.push(key);
    }
    return acc;
  }, [] as string[]);

  const claimModal = useModal();
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("unset");
  const [selectRowsColumnVisible, setSelectRowsColumnVisible] = useState(false);

  const isMobile = useMediaQuery("(max-width: 1024px)");

  const ch = createColumnHelper<ValidatorHistoryEntry>();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const columns = useMemo(() => {
    return [
      ch.display({
        id: "select",
        header: ({ table }) => (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler(),
            }}
          />
        ),
        cell: ({ row }) => (
          <div className="px-1">
            <IndeterminateCheckbox
              {...{
                checked: row.getIsSelected(),
                disabled: !row.getCanSelect(),
                indeterminate: row.getIsSomeSelected(),
                onChange: row.getToggleSelectedHandler(),
              }}
            />
          </div>
        ),
      }),
      ch.accessor("contract", {
        header: "Contract",
        sortingFn: "text",
        cell: (r) => <TableIcon icon={null} text={r.cell.getValue()} hasLink justify="center" />,
      }),
      ch.accessor("buyer", {
        header: "Buyer",
        sortingFn: "alphanumeric",
        cell: (r) => truncateAddress(r.cell.getValue(), AddressLength.SHORT),
      }),

      ch.accessor("price", {
        id: "price",
        header: "Price / Fee",
        sortingFn: "alphanumeric",
        cell: (r) => (
          <div className="flex-column gap-1">
            <div>{formatPaymentPrice(r.getValue()).full}</div>
            <div className="text-xs text-gray-400">{formatFeePrice(r.row.original.fee).full}</div>
          </div>
        ),
      }),

      ch.accessor("purchaseTime", {
        header: "Purchased at",
        sortingFn: "alphanumeric",
        cell: (r) => formatDateTime(Number(r.cell.getValue())),
      }),
      ch.accessor(
        (r) => {
          return getStatus(r, Number(new Date().getTime() / 1000)).sortValue;
        },
        {
          id: "status",
          header: "Status",
          sortingFn: "alphanumeric",
          filterFn: inNumberRangeInclusiveExclusive,
          cell: (r) => <ProgressCell validatorHistoryEntry={r.row.original} />,
        },
      ),
      ch.accessor(
        (r) => {
          // display the fee balance of the contract as unclaimed validator fe only if
          // 1. the contract is not reconciled
          // 2. the contract validator is the user's wallet
          // 3. this is the most recent validation for the contract
          if (!contracts.data) {
            return 0n;
          }
          if (!userAccount) {
            return 0n;
          }
          const contractIndex = contracts.data.findIndex((c) => isAddressEqual(c.id as `0x${string}`, r.contract));
          const contractEntry = contracts.data[contractIndex];
          const isMostRecent = contractEntry.history?.[0].purchaseTime === r.purchaseTime;
          const isValidator = isAddressEqual(contractEntry.validator as `0x${string}`, userAccount);
          const isUnsettled = Number(contractEntry.feeBalance) > 0;

          if (isMostRecent && isValidator && isUnsettled) {
            const progress = getStatus(r, Number(new Date().getTime() / 1000)).progress;
            const feeToBePaidTillEnd = (1 - progress) * Number(contractEntry.fee);
            const unpaidFee = Number(contractEntry.feeBalance) - feeToBePaidTillEnd;
            return BigInt(Math.floor(unpaidFee));
          }

          return 0n;
        },
        {
          id: "balance",
          header: "Unclaimed",
          sortingFn: "alphanumeric",
          filterFn: inNumberRangeExclusive,
          cell: (r) => {
            return formatFeePrice(r.cell.getValue()).full;
          },
        },
      ),
    ];
  }, [userAccount, contracts.data, validatorHistory.data]);

  const columnFilters = useMemo(() => getColumnFilters(quickFilter), [quickFilter]);

  const tableData = useMemo(() => validatorHistory.data || [], [validatorHistory.data]);
  const tableInstance = useReactTable<ValidatorHistoryEntry>({
    columns,
    data: tableData,
    state: {
      rowSelection: _selectedRows,
      columnFilters: columnFilters,
      columnVisibility: {
        select: selectRowsColumnVisible,
      },
    },
    initialState: {
      sorting: [
        { id: "status", desc: true },
        { id: "purchaseTime", desc: true },
      ],
    },

    // getRowId: (row) => row.id,
    onRowSelectionChange: setSelectedRows,
    // onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const isAnyRowSelected = selectedRows.length > 0;
  const areAllSelectedRowsClaimable =
    isAnyRowSelected &&
    selectedRows.every((rowId) => {
      const data = tableInstance.getRow(rowId)?.getValue<string>("balance");
      return data !== "0";
    });

  return (
    <>
      <WidgetsWrapper>
        <ValidatorWidget />
        <ValidatorStatsWidget />
      </WidgetsWrapper>
      {claimModal.isOpen && (
        <ModalItem open={claimModal.isOpen} setOpen={claimModal.setOpen}>
          <ClaimForm contractIDs={selectedContractAddresses} closeForm={claimModal.close} />
        </ModalItem>
      )}

      <SellerToolbar>
        {isMobile ? (
          !selectRowsColumnVisible && (
            <FiltersSelect values={QuickFilterValues} quickFilter={quickFilter} setQuickFilter={setQuickFilter} />
          )
        ) : (
          <FiltersButtonGroup values={QuickFilterValues} quickFilter={quickFilter} setQuickFilter={setQuickFilter} />
        )}
        <SellerActions>
          {!selectRowsColumnVisible && (
            <TableToolbarButton onClick={() => setSelectRowsColumnVisible(true)}>
              <AddIcon className="add-icon" />
              Batch actions
            </TableToolbarButton>
          )}
          {selectRowsColumnVisible && (
            <>
              <TableToolbarButton onClick={() => setSelectRowsColumnVisible(false)}>
                <CancelIcon className="add-icon" />
                Cancel
              </TableToolbarButton>
              <TableToolbarButton
                disabled={!areAllSelectedRowsClaimable}
                disabledText="All selected contracts must have a balance to claim"
                onClick={() => {
                  const selectedContracts = tableInstance.getSelectedRowModel().rows.map((r) => r.original.contract);
                  setSelectedContractAddresses(selectedContracts);
                  claimModal.open();
                }}
              >
                <AddIcon className="add-icon" />
                Claim
              </TableToolbarButton>
            </>
          )}
        </SellerActions>
      </SellerToolbar>
      {validatorHistory.isLoading ||
        (contracts.isLoading && (
          <div className="spinner">
            <Spinner />
          </div>
        ))}
      <Table tableInstance={tableInstance} />
    </>
  );
};

const getColumnFilters = (quickFilter: QuickFilter) => {
  switch (quickFilter) {
    case "running":
      return [{ id: "status", value: [0, 0.99] }];
    case "unclaimed":
      return [{ id: "balance", value: [0, Number.POSITIVE_INFINITY] }];
    case "success":
      return [{ id: "status", value: [1, Number.POSITIVE_INFINITY] }];
    case "closed":
      return [{ id: "status", value: [Number.NEGATIVE_INFINITY, 0] }];
    case "unset":
      return [];
    default:
      throw new Error(`Invalid quick filter: ${quickFilter}`);
  }
};

function IndeterminateCheckbox({
  indeterminate,
  className = "",
  ...rest
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
  const ref = useRef<HTMLInputElement>(null!);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (typeof indeterminate === "boolean") {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [ref, indeterminate]);

  return <input type="checkbox" ref={ref} className={`${className} cursor-pointer`} {...rest} />;
}

const inNumberRangeInclusiveExclusive = <TData extends RowData>(
  row: Row<TData>,
  columnId: string,
  filterValue: [number, number],
  addMeta: (meta: FilterMeta) => void,
): boolean => {
  const cellValue = row.getValue(columnId) as number;
  const [min, max] = filterValue;

  // Include smaller value (>=) but exclude larger value (<)
  return cellValue >= min && cellValue < max;
};

const inNumberRangeExclusive = <TData extends RowData>(
  row: Row<TData>,
  columnId: string,
  filterValue: [number, number],
  addMeta: (meta: FilterMeta) => void,
): boolean => {
  const cellValue = row.getValue(columnId) as number;
  const [min, max] = filterValue;

  // Include smaller value (>=) but exclude larger value (<)
  return cellValue > min && cellValue < max;
};

const QuickFilterValues = [
  {
    value: "success",
    icon: <FontAwesomeIcon icon={faCheck} />,
    text: "Success",
  },
  {
    value: "closed",
    icon: <FontAwesomeIcon icon={faXmark} />,
    text: "Closed",
  },
  {
    value: "running",
    icon: <Pickaxe />,
    text: "Running",
  },
  {
    value: "unclaimed",
    icon: <FontAwesomeIcon icon={faSackDollar} />,
    text: "Unclaimed",
  },
] as const;

type QuickFilter = (typeof QuickFilterValues)[number]["value"] | "unset";
