import styled from "@emotion/styled";
import AddIcon from "@mui/icons-material/Add";
import { Toolbar } from "@mui/material";
import { Duration } from "luxon";
import { type FC, useMemo, useState } from "react";
import { useReactTable, createColumnHelper, getCoreRowModel } from "@tanstack/react-table";
import { ActionButtonWrapper, PrimaryButton } from "../../components/Forms/FormButtons/Buttons.styled";
import { ClaimLmrButton } from "../../components/Forms/FormButtons/ClaimLmrButton";
import { EditButton } from "../../components/Forms/FormButtons/EditButton";
import { Spinner } from "../../components/Spinner.styled";
import { Table } from "../../components/Table";
import { TableIcon } from "../../components/TableIcon";
import { ContractState, type HashRentalContract } from "../../types/types";
import { useContracts } from "../../hooks/data/useContracts";
import { useAccount } from "wagmi";
import { useSimulatedBlockchainTime } from "../../hooks/data/useSimulatedBlockchainTime";
import { useModal } from "../../hooks/useModal";
import type { EthereumGateway } from "../../gateway/ethereum";
import { formatFeePrice, formatPaymentPrice } from "../../lib/units";
import { CreateContract } from "../../components/Forms/SellerForms/CreateForm";
import { EditForm } from "../../components/Forms/SellerForms/EditForm";
import { ClaimLmrForm } from "../../components/Forms/SellerForms/ClaimLmrForm";
import { DefaultLayout } from "../../components/Layouts/DefaultLayout";
import { ProgressBar } from "../../components/ProgressBar";
import { ModalItem } from "../../components/Modal";
import { faTrash, faUndo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ArchiveUnarchiveForm } from "../../components/Forms/SellerForms/ArchiveUnarchive";
// This interface needs to have all the properties for both data and columns based on index.d.ts

interface Props {
  web3Gateway: EthereumGateway;
}

export const SellerHub: FC<Props> = ({ web3Gateway }) => {
  const { address: userAccount } = useAccount();
  const { data: contracts, isLoading } = useContracts({ userAccount, includeDeleted: true });

  const createModal = useModal();
  const editModal = useModal();
  const claimModal = useModal();
  const archiveModal = useModal();
  const unarchiveModal = useModal();
  const [contractId, setContractId] = useState<string>("");
  const contract = contracts?.find((c) => c.id === contractId);

  function onCreate() {
    createModal.open();
  }

  function onEdit(id: string) {
    setContractId(id);
    editModal.open();
  }

  function onClaim(id: string) {
    setContractId(id);
    claimModal.open();
  }

  function onArchive(id: string) {
    setContractId(id);
    archiveModal.open();
  }

  function onUnarchive(id: string) {
    setContractId(id);
    unarchiveModal.open();
  }

  const ch = createColumnHelper<HashRentalContract>();

  const columns = useMemo(() => {
    return [
      ch.accessor("id", {
        header: "CONTRACT ADDRESS",
        sortingFn: "alphanumeric",
        cell: (r) => <TableIcon icon={null} text={r.getValue()} hasLink justify="center" />,
      }),
      ch.accessor("state", {
        header: "STATUS",
        sortingFn: "alphanumeric",
        cell: (r) => {
          const status = r.getValue();
          if (r.row.original.isDeleted) {
            return <div>Archived</div>;
          }
          if (status === ContractState.Available) {
            return <div>Available</div>;
          }
          return (
            <ProgressBarWithTime
              state={r.row.original.state}
              startTime={BigInt(r.row.original.timestamp)}
              length={BigInt(r.row.original.length)}
            />
          );
        },
      }),
      ch.accessor("price", {
        header: "PRICE",
        sortingFn: "alphanumeric",
        cell: (r) => formatPaymentPrice(r.getValue()).full,
      }),
      ch.accessor("fee", {
        header: "FEE",
        sortingFn: "alphanumeric",
        cell: (r) => formatFeePrice(r.getValue()).full,
      }),
      ch.accessor("length", {
        header: "DURATION",
        sortingFn: "alphanumeric",
        cell: (r) => formatDuration(r.getValue()),
      }),
      ch.accessor((r) => formatPaymentPrice(r.balance).full, {
        header: "INCOME",
        enableSorting: false,
      }),
      ch.display({
        header: "Actions",
        enableSorting: false,
        cell: (r) => (
          <div className="flex flex-row gap-2">
            <ClaimLmrButton onClick={() => onClaim(r.row.original.id)} disabled={r.row.original.balance === "0"} />
            <EditButton onEdit={() => onEdit(r.row.original.id)} />
            <ArchiveUnarchiveButton
              onArchive={() => onArchive(r.row.original.id)}
              onUnarchive={() => onUnarchive(r.row.original.id)}
              isArchived={r.row.original.isDeleted}
            />
          </div>
        ),
      }),
    ];
  }, []);

  const data = useMemo(() => contracts || [], [contracts]);
  const tableInstance = useReactTable<HashRentalContract>({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <DefaultLayout>
      {createModal.isOpen && (
        <ModalItem open={createModal.isOpen} setOpen={createModal.setOpen}>
          <CreateContract web3Gateway={web3Gateway} setOpen={createModal.setOpen} />
        </ModalItem>
      )}
      {editModal.isOpen && (
        <ModalItem open={editModal.isOpen} setOpen={editModal.setOpen}>
          <EditForm web3Gateway={web3Gateway} contract={contract!} closeForm={editModal.close} />
        </ModalItem>
      )}
      {claimModal.isOpen && (
        <ModalItem open={claimModal.isOpen} setOpen={claimModal.setOpen}>
          <ClaimLmrForm web3Gateway={web3Gateway} contractId={contractId} closeForm={claimModal.close} />
        </ModalItem>
      )}
      {archiveModal.isOpen && (
        <ModalItem open={archiveModal.isOpen} setOpen={archiveModal.setOpen}>
          <ArchiveUnarchiveForm
            web3Gateway={web3Gateway}
            contractId={contractId}
            isArchived={false}
            closeForm={archiveModal.close}
          />
        </ModalItem>
      )}
      {unarchiveModal.isOpen && (
        <ModalItem open={unarchiveModal.isOpen} setOpen={unarchiveModal.setOpen}>
          <ArchiveUnarchiveForm
            web3Gateway={web3Gateway}
            contractId={contractId}
            isArchived={true}
            closeForm={unarchiveModal.close}
          />
        </ModalItem>
      )}

      <SellerToolbar>
        <PrimaryButton className="create-button" onClick={onCreate}>
          <AddIcon className="add-icon" />
          Create Contract
        </PrimaryButton>
      </SellerToolbar>
      {isLoading && (
        <div className="spinner">
          <Spinner />
        </div>
      )}
      {data.length > 0 && <Table tableInstance={tableInstance} columnCount={6} />}
      {!isLoading && data.length === 0 && <div className="text-center text-2xl">You have no contracts.</div>}
    </DefaultLayout>
  );
};

const SellerToolbar = styled(Toolbar)`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-bottom: 3rem;
  margin-top: 2rem;

  .create-button {
    justify-self: flex-end;
    display: flex;
    justify-content: center;
    align-items: center;

    .add-icon {
      margin-bottom: 2px;
      font-size: 1.2rem;
      margin-right: 10px;
    }
  }
`;

function formatDuration(lengthSeconds: string) {
  const duration = Number.parseInt(lengthSeconds);
  return Duration.fromObject({ seconds: duration }, { locale: "en-US" }).normalize().toHuman({ unitDisplay: "short" });
}

export const ProgressBarWithTime = (props: {
  state: string;
  startTime: bigint;
  length: bigint;
}) => {
  const currentBlockTimestamp = useSimulatedBlockchainTime();
  const { state, startTime, length } = props;

  if (length === 0n || currentBlockTimestamp === 0n || state === ContractState.Available) {
    return <div>0%</div>;
  }

  const timeElapsed = currentBlockTimestamp - startTime;
  const percentage = (Number(timeElapsed) / Number(length)) * 100;

  return (
    <div key={percentage.toFixed()} className="flex flex-col mt-3 sm:mt-0 sm:items-center sm:flex-row">
      <div>{percentage.toFixed()}%</div>
      <div className="w-1/2 sm:ml-4">
        <ProgressBar width={percentage.toString()} />
      </div>
    </div>
  );
};

const ArchiveUnarchiveButton = (props: {
  onArchive: () => void;
  onUnarchive: () => void;
  isArchived: boolean;
}) => (
  <ActionButtonWrapper>
    <button type="button" onClick={() => (props.isArchived ? props.onUnarchive() : props.onArchive())}>
      <FontAwesomeIcon icon={props.isArchived ? faUndo : faTrash} color="rgb(6 65 82)" />
    </button>
    <p>{props.isArchived ? "Unarchive" : "Archive"}</p>
  </ActionButtonWrapper>
);
