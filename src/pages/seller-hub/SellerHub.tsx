// biome-ignore-all lint/correctness/useExhaustiveDependencies: <explanation>

import AddIcon from "@mui/icons-material/Add";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { type FC, type HTMLProps, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { Spinner } from "../../components/Spinner.styled";
import { Table } from "../../components/Table";
import { TableIcon } from "../../components/TableIcon";
import type { HashRentalContract } from "../../types/types";
import { useSellerContracts } from "../../hooks/data/useContracts";
import { useAccount } from "wagmi";
import { useSimulatedBlockchainTime } from "../../hooks/data/useSimulatedBlockchainTime";
import { useModal } from "../../hooks/useModal";
import { formatFeePrice, formatHashrateTHPS, formatPaymentPrice } from "../../lib/units";
import { CreateContract } from "../../components/Forms/CreateForm";
import { EditForm } from "../../components/Forms/EditForm";
import { ModalItem } from "../../components/Modal";
import { ArchiveUnarchiveForm } from "../../components/Forms/ArchiveUnarchive";
import { formatDuration } from "../../lib/duration";
import { ArchiveButton, ClaimLmrButton, EditButton, UnarchiveButton } from "../../components/ActionButton";
import { faArchive } from "@fortawesome/free-solid-svg-icons/faArchive";
import { faSackDollar } from "@fortawesome/free-solid-svg-icons/faSackDollar";
import { faFileSignature } from "@fortawesome/free-solid-svg-icons/faFileSignature";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Pickaxe } from "../../components/Icons/Pickaxe";
import { SellerActions, SellerToolbar } from "./styled";
import { ClaimForm } from "../../components/Forms/ClaimForm";
import { WidgetsWrapper } from "../marketplace/styled";
import { SellerWidget } from "../../components/Widgets/SellerWidget";
import { FiltersButtonGroup, FiltersSelect } from "../../components/Filters";
import { ProgressCell } from "./ProgressCell";
import { StatusAccessor } from "./ProgressCell";
import { TableToolbarButton } from "../../components/TableToolbarButton";

export const SellerHub: FC = () => {
  const { address: userAccount } = useAccount();
  const contractsQuery = useSellerContracts({ address: userAccount });
  const { data: contracts, isLoading } = contractsQuery;
  const blockTime30s = useSimulatedBlockchainTime({ intervalSeconds: 30 });
  const [_selectedRows, _setSelectedRows] = useState<Record<`0x${string}`, boolean>>({});
  const selectedRows = Object.entries(_selectedRows).reduce((acc, [key, value]) => {
    if (value) {
      acc.push(key);
    }
    return acc;
  }, [] as string[]);

  const createModal = useModal();
  const editModal = useModal();
  const claimModal = useModal();
  const archiveModal = useModal();
  const unarchiveModal = useModal();

  const [contractIds, setContractIds] = useState<string[]>([]);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("unset");
  const [selectRowsColumnVisible, setSelectRowsColumnVisible] = useState(false);
  const isMobile = useMediaQuery("(max-width: 1024px)");

  function onCreate() {
    createModal.open();
  }

  function onEdit(id: string) {
    setContractIds([id]);
    editModal.open();
  }

  function onClaim(id: string) {
    setContractIds([id]);
    claimModal.open();
  }

  function onArchive(id: string) {
    setContractIds([id]);
    archiveModal.open();
  }

  function onUnarchive(id: string) {
    setContractIds([id]);
    unarchiveModal.open();
  }

  function onBatchClaim() {
    setContractIds(selectedRows);
    claimModal.open();
  }

  function onBatchArchive() {
    setContractIds(selectedRows);
    archiveModal.open();
  }

  function onBatchUnarchive() {
    setContractIds(selectedRows);
    unarchiveModal.open();
  }

  const ch = createColumnHelper<HashRentalContract>();

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
      ch.accessor("id", {
        header: "Address",
        sortingFn: "alphanumeric",
        cell: (r) => <TableIcon icon={null} text={r.getValue()} hasLink justify="center" />,
      }),

      ch.accessor("speed", {
        id: "speed",
        header: "Speed",
        sortingFn: "alphanumeric",
        cell: (r) => `${formatHashrateTHPS(r.getValue()).full}`,
      }),
      ch.accessor("length", {
        header: "Duration",
        sortingFn: "alphanumeric",
        cell: (r) => {
          return formatDuration(BigInt(r.getValue()));
        },
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
      ch.accessor("profitTargetPercent", {
        header: "Profit",
        sortingFn: "alphanumeric",
        cell: (r) => `${r.getValue()}%`,
      }),
      ch.accessor((r) => StatusAccessor(r, Number(blockTime30s)), {
        id: "status",
        header: "Status",
        sortingFn: "basic",
        filterFn: "inNumberRange",
        cell: (r) => <ProgressCell contract={r.row.original} />,
      }),
      ch.accessor(
        (r) => {
          // the unclaimed balance is not equal 0 only in two cases:
          // 1. the contract is running and the balance is equal to the price of a whole contract
          //  - in this case we can claim partially, return the balance multiplied by progress
          //
          // 2. the contract auto-closed and is available and the balance is equal to the real unclaimed balance
          //  - in this case we can claim full amount, return the balance

          const progress = StatusAccessor(r, Number(blockTime30s));
          if (progress < 0) {
            return BigInt(r.balance);
          }

          const toBePaidTillTheEnd = (1 - progress) * Number(r.price);
          const unpaidBalance = Number(r.balance) - toBePaidTillTheEnd;

          // unpaid balance could be negative if contract balance is out of date
          // displaying 0 before it will eventually update
          if (unpaidBalance <= 0) {
            return 0n;
          }

          return BigInt(Math.floor(unpaidBalance));
        },
        {
          id: "balance",
          header: "Unclaimed",
          cell: (r) => formatPaymentPrice(r.cell.getValue()).full,
        },
      ),
      ch.display({
        header: "Actions",
        enableSorting: false,
        meta: {
          hideTitleMobile: true,
        },
        cell: (r) => (
          <div className="flex flex-row gap-2 justify-center">
            <ClaimLmrButton onClick={() => onClaim(r.row.original.id)} disabled={r.row.original.balance === "0"} />
            <EditButton onClick={() => onEdit(r.row.original.id)} />
            <ArchiveUnarchiveButton
              onArchive={() => onArchive(r.row.original.id)}
              onUnarchive={() => onUnarchive(r.row.original.id)}
              isArchived={r.row.original.isDeleted}
            />
          </div>
        ),
      }),
    ];
  }, [blockTime30s, userAccount]);

  const columnFilters = useMemo(() => getColumnFilters(quickFilter), [quickFilter]);

  const data = useMemo(() => contracts || [], [contracts]);
  const tableInstance = useReactTable<HashRentalContract>({
    columns,
    data,
    state: {
      rowSelection: _selectedRows,
      columnFilters: columnFilters,
      columnVisibility: {
        select: selectRowsColumnVisible,
      },
    },
    initialState: {
      sorting: [{ id: "status", desc: true }],
    },
    getRowId: (row) => row.id,
    onRowSelectionChange: _setSelectedRows,
    // onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const isAnyRowSelected = selectedRows.length > 0;
  const isSelectedRowsDeleted =
    isAnyRowSelected && selectedRows.every((rowId) => tableInstance.getRow(rowId)?.original.isDeleted);
  const isSelectedRowsUndeleted =
    isAnyRowSelected && selectedRows.every((rowId) => !tableInstance.getRow(rowId)?.original.isDeleted);
  const isSelectedMixedDeleted = !isSelectedRowsDeleted && !isSelectedRowsUndeleted && isAnyRowSelected;

  const areAllSelectedRowsClaimable =
    isAnyRowSelected &&
    selectedRows.every((rowId) => {
      const data = tableInstance.getRow(rowId)?.getValue<bigint>("balance");
      return data !== 0n;
    });

  const onCreateFormClose = useCallback(async () => {
    contractsQuery.refetch();
    createModal.close();
  }, []);

  const onEditFormClose = useCallback(async () => {
    contractsQuery.refetch();
    editModal.close();
  }, []);

  const onClaimFormClose = useCallback(async () => {
    contractsQuery.refetch();
    claimModal.close();
  }, []);

  const onArchiveFormClose = useCallback(async () => {
    contractsQuery.refetch();
    archiveModal.close();
  }, []);

  return (
    <>
      {createModal.isOpen && (
        <ModalItem open={createModal.isOpen} setOpen={createModal.setOpen}>
          <CreateContract closeForm={onCreateFormClose} />
        </ModalItem>
      )}
      {editModal.isOpen && (
        <ModalItem open={editModal.isOpen} setOpen={editModal.setOpen}>
          <EditForm contract={tableInstance.getRow(contractIds[0])?.original} closeForm={onEditFormClose} />
        </ModalItem>
      )}
      {claimModal.isOpen && (
        <ModalItem open={claimModal.isOpen} setOpen={claimModal.setOpen}>
          <ClaimForm contractIDs={contractIds as `0x${string}`[]} closeForm={onClaimFormClose} />
        </ModalItem>
      )}
      {archiveModal.isOpen && (
        <ModalItem open={archiveModal.isOpen} setOpen={onArchiveFormClose}>
          <ArchiveUnarchiveForm contractIds={contractIds} isArchived={false} closeForm={archiveModal.close} />
        </ModalItem>
      )}
      {unarchiveModal.isOpen && (
        <ModalItem open={unarchiveModal.isOpen} setOpen={unarchiveModal.setOpen}>
          <ArchiveUnarchiveForm contractIds={contractIds} isArchived={true} closeForm={unarchiveModal.close} />
        </ModalItem>
      )}
      <WidgetsWrapper>
        <SellerWidget />
      </WidgetsWrapper>
      <SellerToolbar>
        {isMobile ? (
          !selectRowsColumnVisible && (
            <FiltersSelect values={QuickFilterValues} quickFilter={quickFilter} setQuickFilter={setQuickFilter} />
          )
        ) : (
          <FiltersButtonGroup values={QuickFilterValues} quickFilter={quickFilter} setQuickFilter={setQuickFilter} />
        )}

        <SellerActions>
          {!(isMobile && selectRowsColumnVisible) && (
            <TableToolbarButton
              onClick={onCreate}
              disabled={!userAccount}
              disabledText="Connect wallet to create a contract"
            >
              <AddIcon className="add-icon" />
              Create Contract
            </TableToolbarButton>
          )}
          {!selectRowsColumnVisible && (
            <TableToolbarButton onClick={() => setSelectRowsColumnVisible(true)}>
              <AddIcon className="add-icon" />
              Batch actions
            </TableToolbarButton>
          )}
          {selectRowsColumnVisible && (
            <>
              <TableToolbarButton onClick={() => setSelectRowsColumnVisible(false)}>
                <AddIcon className="add-icon" />
                Cancel
              </TableToolbarButton>
              <TableToolbarButton
                onClick={onBatchClaim}
                disabled={!areAllSelectedRowsClaimable}
                disabledText="All selected contracts must have a balance to claim"
              >
                <AddIcon className="add-icon" />
                Claim
              </TableToolbarButton>
              {isSelectedRowsDeleted && (
                <TableToolbarButton onClick={onBatchUnarchive}>
                  <AddIcon className="add-icon" />
                  Unarchive
                </TableToolbarButton>
              )}
              {isSelectedRowsUndeleted && (
                <TableToolbarButton onClick={onBatchArchive}>
                  <AddIcon className="add-icon" />
                  Archive
                </TableToolbarButton>
              )}
              {isSelectedMixedDeleted && (
                <TableToolbarButton disabled disabledText="Please select only archived or unarchived contracts">
                  <AddIcon className="add-icon" />
                  Archive
                </TableToolbarButton>
              )}
              {!isAnyRowSelected && (
                <TableToolbarButton disabled disabledText="Please select at least one contract">
                  <AddIcon className="add-icon" />
                  Archive
                </TableToolbarButton>
              )}
            </>
          )}
        </SellerActions>
      </SellerToolbar>
      {isLoading && (
        <div className="spinner">
          <Spinner />
        </div>
      )}
      {data.length > 0 && <Table tableInstance={tableInstance} />}
      {!isLoading && data.length === 0 && <div className="text-center text-2xl">You have no contracts.</div>}
    </>
  );
};

const ArchiveUnarchiveButton = (props: { onArchive: () => void; onUnarchive: () => void; isArchived: boolean }) =>
  props.isArchived ? <UnarchiveButton onClick={props.onUnarchive} /> : <ArchiveButton onClick={props.onArchive} />;

const getColumnFilters = (quickFilter: QuickFilter) => {
  switch (quickFilter) {
    case "archived":
      return [{ id: "status", value: [-2, -2] }];
    case "running":
      return [{ id: "status", value: [0, Number.POSITIVE_INFINITY] }];
    case "unclaimed":
      return [{ id: "balance", value: [0, Number.POSITIVE_INFINITY] }];
    case "available":
      return [{ id: "status", value: [-1, -1] }];
    case "unset":
      return [{ id: "status", value: [-1, Number.POSITIVE_INFINITY] }];
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

const QuickFilterValues = [
  {
    value: "archived",
    icon: <FontAwesomeIcon icon={faArchive} />,
    text: "Archived",
  },
  {
    value: "available",
    icon: <FontAwesomeIcon icon={faFileSignature} />,
    text: "Available",
  },
  {
    value: "running",
    icon: <Pickaxe fill="#fff" />,
    text: "Running",
  },
  {
    value: "unclaimed",
    icon: <FontAwesomeIcon icon={faSackDollar} />,
    text: "Unclaimed",
  },
] as const;

type QuickFilter = (typeof QuickFilterValues)[number]["value"] | "unset";
