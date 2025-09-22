import { type FC, useCallback, useMemo, useState, useEffect } from "react";
import { useAccount } from "wagmi";
import Skeleton from "@mui/material/Skeleton";
import { MarketplaceStatistics } from "../../components/Widgets/MarketplaceStatistics";
import { MessageWidget } from "../../components/Widgets/MessageWidget";
import { WalletBalanceWidget } from "../../components/Widgets/WalletBalanceWidget";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import type { HashRentalContractV2 } from "../../types/types";
import { useModal } from "../../hooks/useModal";
import { Table } from "../../components/Table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { ModalItem } from "../../components/Modal";
import { BuyForm } from "../../components/Forms/BuyForm";
import { SkeletonWrap } from "../../components/Skeleton.styled";
import { createColumnHelper } from "@tanstack/react-table";
import { getSortedRowModel } from "@tanstack/react-table";
import { TableIcon } from "../../components/TableIcon";
import { formatFeePrice, formatHashrateTHPS, formatPaymentPrice } from "../../lib/units";
import { formatDuration } from "../../lib/duration";
import { useAvailableContractsV2 } from "../../hooks/data/useContactsV2";
import { WidgetsWrapper } from "./styled";
import { css } from "@emotion/react";
import { PieChart } from "react-minimal-pie-chart";
import { MarketplaceCard } from "../../components/Cards/MarketplaceContracts";
import { MarketplaceCards } from "../../components/Cards/MarketplaceContracts.styled";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewListIcon from "@mui/icons-material/ViewList";
import { IconButton } from "@mui/material";
import { PurchaseDropdown } from "../../components/PurchaseDropdown";
import { TabSwitch } from "../../components/TabSwitch";
import { SortTypes } from "../../types/types";
import { sortContracts } from "../../utils/sortContracts";
import { SortToolbar } from "../../components/SortToolbar";

type ViewMode = "table" | "cards";
type PurchaseType = "purchase" | "purchase-and-resell";
type ContractType = "direct" | "resellable";

export const Marketplace: FC = () => {
  const { address: userAccount } = useAccount();
  const contractsQuery = useAvailableContractsV2();
  //const contractsQuery = useAvailableContracts();

  const isMobile = useMediaQuery("(max-width: 768px)");
  const buyModal = useModal();
  const [buyContract, setBuyContract] = useState<HashRentalContractV2 | null>(null);
  const [purchaseType, setPurchaseType] = useState<PurchaseType | null>();
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [contractType, setContractType] = useState<ContractType>("direct");
  const [sortType, setSortType] = useState<SortTypes>(SortTypes.None);
  const data = useMemo(() => contractsQuery.data || [], [contractsQuery.data]);

  // Calculate counts for each contract type
  const contractCounts = useMemo(() => {
    const directCount = data.filter((contract) => !contract.isResellable).length;
    const resellableCount = data.filter((contract) => contract.isResellable).length;
    return { directCount, resellableCount };
  }, [data]);

  useEffect(() => {
    if (purchaseType) return;
    if (data.length > 0) {
      const { directCount, resellableCount } = contractCounts;
      if (directCount > 0) {
        setContractType("direct");
      } else if (resellableCount > 0) {
        setContractType("resellable");
      }
    }
  }, [data.length, purchaseType]);

  const onBuyFormClose = useCallback(async () => {
    contractsQuery.refetch();
    buyModal.close();
  }, [contractsQuery.refetch, buyModal]);

  const onPurchase = useCallback(
    (contract: HashRentalContractV2, purchaseType: PurchaseType) => {
      setBuyContract(contract);
      setPurchaseType(purchaseType);
      buyModal.open();
    },
    [buyModal],
  );

  // Apply sorting to filtered data
  const sortedData: HashRentalContractV2[] = useMemo(() => {
    var filteredByContractType = [];
    if (contractType === "direct") {
      filteredByContractType = data.filter((contract) => !contract.isResellable);
    } else {
      filteredByContractType = data.filter((contract) => contract.isResellable);
    }

    // Apply sorting if not "None"
    if (sortType === SortTypes.None) {
      return filteredByContractType;
    }

    return sortContracts(sortType, filteredByContractType);
  }, [data, contractType, sortType]);

  // Helper functions

  const StatsChart: FC<{ successCount: number; failCount: number }> = useCallback((props) => {
    const stats = props;
    const total = props.successCount + props.failCount;

    return (
      <div
        css={css`
          width: 3em;
          height: 3em;
          position: relative;
          display: flex;
          :after {
            position: absolute;
            bottom: 100%;
            opacity: 0;
            visibility: hidden;
            width: max-content;
            transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
            content: "Success: ${stats.successCount} / Fail: ${stats.failCount}";
            background-color: rgba(0, 0, 0, 0.5);
            color: #fff;
            font-size: 0.75rem;
            padding: 0.5rem;
            border-radius: 8px;
            transform: translateX(-25%);
          }
          :hover:after {
            opacity: 1;
            visibility: visible;
          }
        `}
      >
        <PieChart
          data={[
            {
              label: "Success",
              value: Number(stats.successCount),
              color: "rgb(80, 158, 186)",
            },
            { label: "Fail", value: Number(stats.failCount), color: "rgb(42, 42, 42)" },
            { label: "Total", value: total === 0 ? 1 : 0, color: "rgb(42, 42, 42)" },
          ]}
          lineWidth={30}
          rounded={false}
          startAngle={-90}
        />
        <div
          css={css`
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 0.75rem;
            color: rgba(255, 255, 255, 0.7);
          `}
        >
          {total === 0 ? "n/a" : total}
        </div>
      </div>
    );
  }, []);

  // Table logic
  const ch = createColumnHelper<HashRentalContractV2>();
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const columns = useMemo(() => {
    return [
      ch.accessor("id", {
        header: "Address",
        sortingFn: "text",
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
        cell: (r) => formatDuration(BigInt(r.getValue())),
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
      ch.accessor(
        (r) => {
          const stats = r.stats;
          const total = Number(stats.successCount) + Number(stats.failCount);
          return Number(stats.successCount) / total;
        },
        {
          header: "Stats",
          sortingFn: "basic",
          cell: (r) => {
            const { successCount, failCount } = r.row.original.stats;
            return <StatsChart successCount={Number(successCount)} failCount={Number(failCount)} />;
          },
        },
      ),
      ch.accessor((d) => d, {
        header: "Actions",
        enableSorting: false,
        meta: {
          hideTitleMobile: true,
        },
        cell: (r) => {
          return (
            <div className="flex flex-row gap-2 justify-center">
              <PurchaseDropdown
                userAccount={userAccount}
                seller={r.row.original.seller}
                onPurchase={onPurchase}
                contract={r.row.original}
              />
            </div>
          );
        },
      }),
    ];
  }, [userAccount, onPurchase]);

  const tableInstance = useReactTable<HashRentalContractV2>({
    columns,
    data: sortedData,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (contractsQuery.isLoading) {
    return (
      <>
        {[...Array(10)].map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: this list is a placeholder
          <SkeletonWrap key={index}>
            <Skeleton variant="rectangular" width={"100%"} height={100} />
          </SkeletonWrap>
        ))}
      </>
    );
  }

  return (
    <>
      <WidgetsWrapper>
        <MessageWidget isMobile={isMobile} />
        <WalletBalanceWidget />
        <MarketplaceStatistics />
      </WidgetsWrapper>
      <ModalItem open={buyModal.isOpen} setOpen={buyModal.setOpen}>
        <BuyForm
          key={buyContract?.id}
          contract={buyContract!}
          closeForm={onBuyFormClose}
          purchaseType={purchaseType!}
        />
      </ModalItem>

      <div
        css={css`
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        `}
      >
        <TabSwitch
          values={[
            {
              text: "Direct",
              value: "direct",
              count: contractCounts.directCount,
            },
            { text: "Resellable", value: "resellable", count: contractCounts.resellableCount },
          ]}
          value={contractType}
          setValue={setContractType}
        />
        <div
          css={css`
            display: flex;
            align-items: center;
            gap: 1rem;
          `}
        >
          {viewMode === "cards" && <SortToolbar pageTitle="" sortType={sortType} setSortType={setSortType} />}
          <div
            css={css`
              display: flex;
              background-color: rgba(79, 126, 145, 0.04);
              background: radial-gradient(circle, rgba(0, 0, 0, 0) 36%, rgba(255, 255, 255, 0.05) 100%);
              border: rgba(171, 171, 171, 1) 1px solid;
              border-radius: 9px;
              padding: 0.5rem;
              gap: 0.25rem;
            `}
          >
            <IconButton
              onClick={() => setViewMode("cards")}
              sx={{
                color: viewMode === "cards" ? "#fff" : "#999",
                backgroundColor: viewMode === "cards" ? "rgba(80, 158, 186, 0.2)" : "transparent",
                borderRadius: "6px",
                padding: "8px",
                "&:hover": {
                  backgroundColor: viewMode === "cards" ? "rgba(80, 158, 186, 0.3)" : "rgba(255, 255, 255, 0.05)",
                },
                transition: "all 0.2s ease",
              }}
            >
              <ViewModuleIcon />
            </IconButton>
            <IconButton
              onClick={() => setViewMode("table")}
              sx={{
                color: viewMode === "table" ? "#fff" : "#999",
                backgroundColor: viewMode === "table" ? "rgba(80, 158, 186, 0.2)" : "transparent",
                borderRadius: "6px",
                padding: "8px",
                "&:hover": {
                  backgroundColor: viewMode === "table" ? "rgba(80, 158, 186, 0.3)" : "rgba(255, 255, 255, 0.05)",
                },
                transition: "all 0.2s ease",
              }}
            >
              <ViewListIcon />
            </IconButton>
          </div>
        </div>
      </div>

      {viewMode === "cards" ? (
        <MarketplaceCards>
          {sortedData.map((contract) => (
            <MarketplaceCard key={contract.id} contract={contract} userAccount={userAccount} onPurchase={onPurchase} />
          ))}
        </MarketplaceCards>
      ) : (
        <Table tableInstance={tableInstance} />
      )}
    </>
  );
};
