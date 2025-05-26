import AddIcon from "@mui/icons-material/Add";
import { FormControl, styled, ToggleButtonGroup } from "@mui/material";
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
import { PrimaryButton } from "../../components/Forms/FormButtons/Buttons.styled";
import { Spinner } from "../../components/Spinner.styled";
import { Table } from "../../components/Table";
import { TableIcon } from "../../components/TableIcon";
import { AddressLength } from "../../types/types";
import { useContracts } from "../../hooks/data/useContracts";
import { useAccount } from "wagmi";
import { useModal } from "../../hooks/useModal";
import type { EthereumGateway } from "../../gateway/ethereum";
import { formatFeePrice, formatPaymentPrice, formatHashrateTHPS } from "../../lib/units";

import { DefaultLayout } from "../../components/Layouts/DefaultLayout";
import { ModalItem } from "../../components/Modal";

import { ClaimLmrButton } from "../../components/Forms/FormButtons/ActionButton";
import { faSackDollar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Pickaxe } from "../../components/Icons/Pickaxe";
import { SellerActions, SellerFilters, SellerToolbar, ToggleButtonIcon } from "../seller-hub/styled";
import { useValidatorHistory } from "../../hooks/data/useValidatorHistory";
import type { ValidatorHistoryEntry } from "../../gateway/interfaces";
import { truncateAddress } from "../../utils/utils";
import { formatDateTime } from "../../lib/date";
import { WidgetsWrapper } from "../marketplace/styled";
import { ValidatorWidget } from "../../components/Widgets/ValidatorWidget";
import { ClaimForm } from "../../components/Forms/ClaimForm";
import { CircularProgress } from "../../components/CircularProgress";

interface Props {
  web3Gateway: EthereumGateway;
}

const QuickFilterValues = ["running", "unclaimed", "unset"] as const;
type QuickFilter = (typeof QuickFilterValues)[number];

export const ValidatorHub: FC<Props> = ({ web3Gateway }) => {
  const { address: userAccount } = useAccount();
  const validatorHistory = useValidatorHistory({ address: userAccount! });
  const contracts = useContracts();

  const [selectedRows, setSelectedRows] = useState<Record<`0x${string}`, boolean>>({});
  const [selectedContractAddresses, setSelectedContractAddresses] = useState<`0x${string}`[]>([]);

  const claimModal = useModal();
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("unset");
  const [selectRowsColumnVisible, setSelectRowsColumnVisible] = useState(false);

  const ch = createColumnHelper<ValidatorHistoryEntry>();

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
        header: "Contract Address",
        sortingFn: "text",
        cell: (r) => <TableIcon icon={null} text={r.cell.getValue()} hasLink justify="center" />,
      }),
      ch.accessor("speed", {
        header: "Speed",
        sortingFn: "alphanumeric",
        cell: (r) => formatHashrateTHPS(r.cell.getValue()).full,
      }),
      ch.accessor("price", {
        id: "price",
        header: "Price / Fee",
        sortingFn: "alphanumeric",
        cell: (r) => (
          <div className="flex-column gap-1">
            <div>{formatPaymentPrice(r.getValue()).full}</div>
            <div className="text-sm text-gray-300">{formatFeePrice(r.row.original.fee).full}</div>
          </div>
        ),
      }),
      ch.accessor("buyer", {
        header: "Buyer",
        sortingFn: "alphanumeric",
        cell: (r) => truncateAddress(r.cell.getValue(), AddressLength.SHORT),
      }),

      ch.accessor("purchaseTime", {
        header: "Purchase Time",
        sortingFn: "alphanumeric",
        cell: (r) => formatDateTime(Number(r.cell.getValue())),
      }),
      ch.accessor(
        (r) => {
          return getStatus(r).sortValue;
        },
        {
          id: "status",
          header: "Status",
          sortingFn: "alphanumeric",
          filterFn: inNumberRangeInclusiveExclusive,
          cell: (r) => {
            const { progress, isRunning, isSuccess } = getStatus(r.row.original);

            const color = isSuccess ? "success" : isRunning ? "default" : "error";
            const text = isSuccess ? "Success" : isRunning ? `${Math.round(progress * 100)}%` : "Closed";

            return (
              <ProgressCell>
                <ProgressBar progress={progress} color={color} />
                {text}
              </ProgressCell>
            );
          },
        },
      ),
      ch.accessor(
        (r) => {
          // display the fee balance of the contract as unclaimed validator fe only if
          // 1. the contract is not reconciled
          // 2. the contract validator is the user's wallet
          // 3. this is the most recent validation for the contract
          const contractIndex = contracts.data!.findIndex((c) => c.id === r.contract);
          const contractEntry = contracts.data![contractIndex];
          const isMostRecent = contractEntry.history?.[0].purchaseTime === r.purchaseTime;
          const isValidator = contractEntry.validator === userAccount;
          const isUnsettled = Number(contractEntry.feeBalance) > 0;

          if (isMostRecent && isValidator && isUnsettled) {
            return contractEntry.feeBalance;
          }

          return "0";
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
      rowSelection: selectedRows,
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

  return (
    <DefaultLayout>
      <>
        <WidgetsWrapper>
          <ValidatorWidget web3Gateway={web3Gateway} />
        </WidgetsWrapper>
        {claimModal.isOpen && (
          <ModalItem open={claimModal.isOpen} setOpen={claimModal.setOpen}>
            <ClaimForm
              web3Gateway={web3Gateway}
              contractIDs={Array.from(selectedContractAddresses) as `0x${string}`[]}
              closeForm={claimModal.close}
            />
          </ModalItem>
        )}

        <SellerToolbar>
          <SellerFilters>
            <FormControl>
              <ToggleButtonGroup
                value={quickFilter}
                exclusive
                onChange={(_, qf: unknown) => {
                  if (!qf) {
                    setQuickFilter("unset");
                    return;
                  }
                  if (!QuickFilterValues.includes(qf as QuickFilter)) {
                    throw new Error(`Invalid quick filter: ${qf}`);
                  }
                  setQuickFilter(qf as QuickFilter);
                }}
              >
                <ToggleButtonIcon value="running" icon={<Pickaxe />} text="Running" />
                <ToggleButtonIcon value="unclaimed" icon={<FontAwesomeIcon icon={faSackDollar} />} text="Unclaimed" />
              </ToggleButtonGroup>
            </FormControl>
          </SellerFilters>
          <SellerActions>
            {!selectRowsColumnVisible && (
              <PrimaryButton onClick={() => setSelectRowsColumnVisible(true)}>
                <AddIcon className="add-icon" />
                Select columns
              </PrimaryButton>
            )}
            {selectRowsColumnVisible && (
              <>
                <PrimaryButton onClick={() => setSelectRowsColumnVisible(false)}>
                  <AddIcon className="add-icon" />
                  Cancel selection
                </PrimaryButton>
                <PrimaryButton
                  onClick={() => {
                    const selectedContracts = tableInstance.getSelectedRowModel().rows.map((r) => r.original.contract);
                    setSelectedContractAddresses(selectedContracts);
                    claimModal.open();
                  }}
                >
                  <AddIcon className="add-icon" />
                  Claim
                </PrimaryButton>
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
    </DefaultLayout>
  );
};

const getColumnFilters = (quickFilter: QuickFilter) => {
  switch (quickFilter) {
    case "running":
      return [{ id: "status", value: [0, 0.99] }];
    case "unclaimed":
      return [{ id: "balance", value: [0, Number.POSITIVE_INFINITY] }];
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

  useEffect(() => {
    if (typeof indeterminate === "boolean") {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [ref, indeterminate]);

  return <input type="checkbox" ref={ref} className={`${className} cursor-pointer`} {...rest} />;
}

const ProgressBar = styled(CircularProgress)`
  width: 2em;
  height: 2em;
`;

const ProgressCell = styled("div")`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
`;

function getStatus(r: ValidatorHistoryEntry) {
  const purchaseTime = Number(r.purchaseTime);
  const endTime = Number(r.endTime);
  const length = Number(r.length);

  const now = new Date().getTime() / 1000;

  const expectedEndTime = purchaseTime + length;
  const isRunning = endTime > now;
  const isClosedEarly = expectedEndTime > endTime;

  let progress = 1;
  // table column is sorted by this value
  // {-1;0} - closed early
  // {0;1} - running
  // 1 - success
  let sortValue = 1;

  if (isRunning) {
    progress = (now - purchaseTime) / length;
    sortValue = progress;
  }

  if (isClosedEarly) {
    progress = (endTime - purchaseTime) / length;
    sortValue = progress - 1;
  }

  return {
    progress,
    isRunning,
    isClosedEarly,
    isSuccess: progress === 1,
    sortValue,
  };
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
