import AddIcon from "@mui/icons-material/Add";
import styled from "@mui/material/styles/styled";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { type FC, type HTMLProps, useEffect, useMemo, useRef, useState } from "react";
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { PrimaryButton } from "../../components/Forms/FormButtons/Buttons.styled";
import { Spinner } from "../../components/Spinner.styled";
import { Table } from "../../components/Table";
import { TableIcon } from "../../components/TableIcon";
import { ContractState, type HashRentalContract } from "../../types/types";
import { useSellerContracts } from "../../hooks/data/useContracts";
import { useAccount } from "wagmi";
import { useSimulatedBlockchainTime } from "../../hooks/data/useSimulatedBlockchainTime";
import { useModal } from "../../hooks/useModal";
import { formatFeePrice, formatHashrateTHPS, formatPaymentPrice } from "../../lib/units";
import { CreateContract } from "../../components/Forms/CreateForm";
import { EditForm } from "../../components/Forms/EditForm";
import { DefaultLayout } from "../../components/Layouts/DefaultLayout";
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
import { CircularProgress } from "../../components/CircularProgress";
import { FiltersButtonGroup, FiltersSelect } from "./Filters";

export const SellerHub: FC = () => {
  const { address: userAccount } = useAccount();
  const { data: contracts, isLoading } = useSellerContracts({ address: userAccount });
  const blockTime30s = useSimulatedBlockchainTime({ intervalSeconds: 30 });
  const [selectedRows, setSelectedRows] = useState<Record<`0x${string}`, boolean>>({});

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
    setContractIds(Object.keys(selectedRows));
    claimModal.open();
  }

  function onBatchArchive() {
    setContractIds(Object.keys(selectedRows));
    archiveModal.open();
  }

  function onBatchUnarchive() {
    setContractIds(Object.keys(selectedRows));
    unarchiveModal.open();
  }

  const ch = createColumnHelper<HashRentalContract>();

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
      ch.accessor("id", {
        header: "Address",
        sortingFn: "alphanumeric",
        cell: (r) => <TableIcon icon={null} text={r.getValue()} hasLink justify="center" />,
      }),
      ch.accessor(
        (r) => {
          if (r.isDeleted) {
            return -2;
          }
          if (r.state === ContractState.Available) {
            return -1;
          }
          const timeElapsed = blockTime30s - BigInt(r.timestamp);
          const percentage = Number(timeElapsed) / Number(r.length);
          return percentage;
        },
        {
          id: "status",
          header: "Status",
          sortingFn: "alphanumeric",
          filterFn: "inNumberRange",
          cell: (r) => {
            const value = r.getValue();
            if (value === -2) {
              return <ProgressCell>Archived</ProgressCell>;
            }
            if (value === -1) {
              return <ProgressCell>Available</ProgressCell>;
            }

            return (
              <ProgressCell>
                <ProgressBar progress={value} color="default" />
                {(value * 100).toFixed(0)}%
              </ProgressCell>
            );
          },
        },
      ),
      ch.accessor("speed", {
        id: "speed",
        header: "Speed",
        sortingFn: "alphanumeric",
        cell: (r) => `${formatHashrateTHPS(r.getValue()).full}`,
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
      ch.accessor("length", {
        header: "Duration",
        sortingFn: "alphanumeric",
        cell: (r) => formatDuration(BigInt(r.getValue())),
      }),
      ch.accessor("profitTargetPercent", {
        header: "Profit",
        sortingFn: "alphanumeric",
        cell: (r) => `${r.getValue()}%`,
      }),
      ch.accessor((r) => formatPaymentPrice(r.balance).full, {
        id: "balance",
        header: "Unclaimed",
        sortingFn: "alphanumeric",
      }),
      ch.display({
        header: "Actions",
        enableSorting: false,
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
  }, [blockTime30s]);

  const columnFilters = useMemo(() => getColumnFilters(quickFilter), [quickFilter]);

  const data = useMemo(() => contracts || [], [contracts]);
  const tableInstance = useReactTable<HashRentalContract>({
    columns,
    data,
    state: {
      rowSelection: selectedRows,
      columnFilters: columnFilters,
      columnVisibility: {
        select: selectRowsColumnVisible,
      },
    },
    getRowId: (row) => row.id,
    onRowSelectionChange: setSelectedRows,
    // onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <DefaultLayout pageTitle="Seller Hub">
      {createModal.isOpen && (
        <ModalItem open={createModal.isOpen} setOpen={createModal.setOpen}>
          <CreateContract setOpen={createModal.setOpen} />
        </ModalItem>
      )}
      {editModal.isOpen && (
        <ModalItem open={editModal.isOpen} setOpen={editModal.setOpen}>
          <EditForm contract={contracts?.[0]!} closeForm={editModal.close} />
        </ModalItem>
      )}
      {claimModal.isOpen && (
        <ModalItem open={claimModal.isOpen} setOpen={claimModal.setOpen}>
          <ClaimForm contractIDs={contractIds as `0x${string}`[]} closeForm={claimModal.close} />
        </ModalItem>
      )}
      {archiveModal.isOpen && (
        <ModalItem open={archiveModal.isOpen} setOpen={archiveModal.setOpen}>
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
          <FiltersSelect values={QuickFilterValues} quickFilter={quickFilter} setQuickFilter={setQuickFilter} />
        ) : (
          <FiltersButtonGroup values={QuickFilterValues} quickFilter={quickFilter} setQuickFilter={setQuickFilter} />
        )}

        <SellerActions>
          <PrimaryButton className="create-button" onClick={onCreate}>
            <AddIcon className="add-icon" />
            Create Contract
          </PrimaryButton>
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
              <PrimaryButton onClick={onBatchClaim}>
                <AddIcon className="add-icon" />
                Claim
              </PrimaryButton>
              <PrimaryButton onClick={() => setSelectRowsColumnVisible(false)}>
                <AddIcon className="add-icon" />
                Archive
              </PrimaryButton>
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
    </DefaultLayout>
  );
};

const ArchiveUnarchiveButton = (props: {
  onArchive: () => void;
  onUnarchive: () => void;
  isArchived: boolean;
}) =>
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
