import styled from "@emotion/styled";
import AddIcon from "@mui/icons-material/Add";
import { Toolbar } from "@mui/material";
import _ from "lodash";
import { DateTime } from "luxon";
/* eslint-disable react-hooks/exhaustive-deps */
import { type Dispatch, type MouseEventHandler, type SetStateAction, useEffect, useMemo, useState } from "react";
import { type Column, Row, type SortByFn, useSortBy, useTable } from "react-table";
import { ButtonGroup } from "../../components/ButtonGroup";
import { PrimaryButton } from "../../components/Forms/FormButtons/Buttons.styled";
import { ClaimLmrButton } from "../../components/Forms/FormButtons/ClaimLmrButton";
import { EditButton } from "../../components/Forms/FormButtons/EditButton";
import { Spinner } from "../../components/Spinner.styled";
import { Table } from "../../components/Table";
import { TableIcon } from "../../components/TableIcon";
import { useInterval } from "../../hooks/useInterval";
import { type ContractData, ContractState, type HashRentalContract, type Header, SortByType } from "../../types/types";
import {
  getProgressDiv,
  getProgressPercentage,
  getStatusDiv,
  setMediaQueryListOnChangeHandler,
  sortByNumber,
} from "../../utils/utils";
import { divideByDigits } from "../../web3/helpers";

// This interface needs to have all the properties for both data and columns based on index.d.ts
interface CustomTableOptions extends ContractData, Header {}

interface MyContractsProps {
  userAccount: string;
  contracts: HashRentalContract[];
  currentBlockTimestamp: number;
  setContractId: Dispatch<SetStateAction<string>>;
  editClickHandler: MouseEventHandler<HTMLButtonElement>;
  claimLmrClickHandler: MouseEventHandler<HTMLButtonElement>;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  setCreateModalOpen: Dispatch<SetStateAction<boolean>>;
}

export const MyContracts: React.FC<MyContractsProps> = ({
  userAccount,
  contracts,
  currentBlockTimestamp,
  setContractId,
  editClickHandler,
  claimLmrClickHandler,
  setSidebarOpen,
  setCreateModalOpen,
}) => {
  const [isLargeBreakpointOrGreater, setIsLargeBreakpointOrGreater] = useState<boolean>(true);
  const [isMediumBreakpointOrBelow, setIsMediumBreakpointOrBelow] = useState<boolean>(false);
  const [showSpinner, setShowSpinner] = useState<boolean>(true);

  const mediaQueryListLarge = window.matchMedia("(min-width: 1280px)");
  const mediaQueryListMedium = window.matchMedia("(max-width:1279px)");
  setMediaQueryListOnChangeHandler(mediaQueryListLarge, isLargeBreakpointOrGreater, setIsLargeBreakpointOrGreater);
  setMediaQueryListOnChangeHandler(mediaQueryListMedium, isMediumBreakpointOrBelow, setIsMediumBreakpointOrBelow);

  useEffect(() => {
    if (!mediaQueryListLarge?.matches) {
      setIsLargeBreakpointOrGreater(false);
    } else {
      setIsLargeBreakpointOrGreater(true);
    }

    if (mediaQueryListMedium?.matches) {
      setIsMediumBreakpointOrBelow(true);
    } else {
      setIsMediumBreakpointOrBelow(false);
    }
  }, [mediaQueryListLarge?.matches, mediaQueryListMedium?.matches]);

  const getTimestamp: (timestamp: string, state: string) => string = (timestamp, state) => {
    if (timestamp === "0" || state === ContractState.Available) return "_____";
    return DateTime.fromSeconds(Number.parseInt(timestamp)).toFormat("MM/dd/yyyy");
  };

  const getTableData: () => ContractData[] = () => {
    const sellerContracts = contracts.filter((contract) => contract.seller === userAccount);
    const updatedOrders = sellerContracts.map((contract) => {
      const updatedOrder = { ...contract } as ContractData;
      if (!_.isEmpty(contract)) {
        updatedOrder.id = (
          <TableIcon
            icon={null}
            isLargeBreakpointOrGreater={isLargeBreakpointOrGreater}
            text={updatedOrder.id as string}
            hasLink
            justify="start"
          />
        ) as any;
        updatedOrder.price = String(divideByDigits(Number(updatedOrder.price)));
        updatedOrder.status = getStatusDiv(updatedOrder.state as string);
        updatedOrder.progress =
          updatedOrder.state === ContractState.Available
            ? "_____"
            : getProgressDiv(
                updatedOrder.state as string,
                updatedOrder.timestamp as string,
                Number.parseInt(updatedOrder.length as string),
                currentBlockTimestamp,
              );
        updatedOrder.progressPercentage = getProgressPercentage(
          updatedOrder.state as string,
          updatedOrder.timestamp as string,
          Number.parseInt(updatedOrder.length as string),
          currentBlockTimestamp,
        );
        updatedOrder.speed = String(Number(updatedOrder.speed) / 10 ** 12);
        updatedOrder.length = String(Number.parseInt(updatedOrder.length as string) / 3600);
        //updatedOrder.length = updatedOrder.length as string;
        updatedOrder.timestamp = getTimestamp(contract.timestamp as string, updatedOrder.state as string);
        updatedOrder.editClaim = (
          <ButtonGroup
            button1={
              <EditButton
                contractId={contract.id as string}
                setContractId={setContractId}
                editClickHandler={editClickHandler}
              />
            }
            button2={
              <ClaimLmrButton
                contractId={contract.id as string}
                setContractId={setContractId}
                claimLmrClickHandler={claimLmrClickHandler}
              />
            }
          />
        );
      }
      return updatedOrder as ContractData;
    });

    return updatedOrders;
  };

  // TODO: if same as <MyOrders /> pull out into util function
  const customSort: SortByFn<CustomTableOptions> = (rowA, rowB, columnId, desc) => {
    if (_.isEmpty(rowA.original)) return desc ? 1 : -1;
    if (_.isEmpty(rowB.original)) return desc ? -1 : 1;

    switch (columnId) {
      case "status":
        return sortByNumber(rowA.values.status.key, rowB.values.status.key, SortByType.Int);
      case "price":
        return sortByNumber(rowA.values.price, rowB.values.price, SortByType.Int);
      case "length":
        return sortByNumber(rowA.values.length, rowB.values.length, SortByType.Float);
      case "started":
        return sortByNumber(rowA.values.timestamp, rowB.values.timestamp, SortByType.Int);
      case "progress":
        return sortByNumber(rowA.values.progress.key, rowB.values.progress.key, SortByType.Int);
      default:
        return 0;
    }
  };

  const sortTypes: Record<string, SortByFn<CustomTableOptions>> = {
    customSort: customSort,
  };

  const columns: Column<CustomTableOptions>[] = useMemo(() => {
    return isMediumBreakpointOrBelow
      ? [
          { Header: "CONTRACT ADDRESS", accessor: "id", disableSortBy: true },
          { Header: "STATUS", accessor: "status", sortType: "customSort" },
          { Header: "DURATION", accessor: "length", sortType: "customSort" },
          { Header: "PROGRESS", accessor: "progress", sortType: "customSort" },
          { Header: "EDIT", accessor: "editClaim", disableSortBy: true },
        ]
      : [
          { Header: "CONTRACT ADDRESS", accessor: "id", disableSortBy: true },
          { Header: "STATUS", accessor: "status", sortType: "customSort" },
          { Header: "PRICE (LMR)", accessor: "price", sortType: "customSort" },
          { Header: "DURATION (HOURS)", accessor: "length", sortType: "customSort" },
          { Header: "STARTED", accessor: "timestamp", sortType: "customSort" },
          { Header: "PROGRESS", accessor: "progress", sortType: "customSort" },
          { Header: "EDIT", accessor: "editClaim", disableSortBy: true },
        ];
  }, [isMediumBreakpointOrBelow]);

  const data = useMemo(() => getTableData(), [contracts, isLargeBreakpointOrGreater]);
  const tableInstance = useTable<CustomTableOptions>({ columns, data, sortTypes }, useSortBy);

  // Remove spinner if no contracts after 1 minute
  useInterval(() => {
    if (showSpinner) setShowSpinner(false);
  }, 7000);

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

  return (
    <>
      <SellerToolbar>
        <PrimaryButton
          className="create-button"
          onClick={() => {
            setCreateModalOpen(true);
            setSidebarOpen(false);
          }}
        >
          <AddIcon className="add-icon" /> Create Contract
        </PrimaryButton>
      </SellerToolbar>
      {data.length > 0 ? (
        <Table id="mycontracts" tableInstance={tableInstance} columnCount={6} />
      ) : (
        <>
          {showSpinner ? (
            <div className="spinner">
              <Spinner />
            </div>
          ) : (
            <div className="text-center text-2xl">You have no contracts.</div>
          )}
        </>
      )}
    </>
  );
};

MyContracts.displayName = "MyContracts";
