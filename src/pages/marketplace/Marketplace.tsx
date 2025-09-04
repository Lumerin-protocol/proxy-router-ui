import { type FC, useCallback, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import Skeleton from "@mui/material/Skeleton";
import { MarketplaceStatistics } from "../../components/Widgets/MarketplaceStatistics";
import { MessageWidget } from "../../components/Widgets/MessageWidget";
import { WalletBalanceWidget } from "../../components/Widgets/WalletBalanceWidget";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import type { HashRentalContract } from "../../types/types";
import { useModal } from "../../hooks/useModal";
import { Table } from "../../components/Table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { ModalItem } from "../../components/Modal";
import { BuyForm } from "../../components/Forms/BuyForm";
import { SkeletonWrap } from "../../components/Skeleton.styled";
import { createColumnHelper } from "@tanstack/react-table";
import { getSortedRowModel } from "@tanstack/react-table";
import { PrimaryButton } from "../../components/Forms/FormButtons/Buttons.styled";
import { TableIcon } from "../../components/TableIcon";
import { formatFeePrice, formatHashrateTHPS, formatPaymentPrice } from "../../lib/units";
import { formatDuration } from "../../lib/duration";
import { useAvailableContracts } from "../../hooks/data/useContracts";
import { WidgetsWrapper } from "./styled";
import { isAddressEqual } from "viem";
import { css } from "@emotion/react";
import { PieChart } from "react-minimal-pie-chart";

export const Marketplace: FC = () => {
  const { address: userAccount } = useAccount();
  const contractsQuery = useAvailableContracts();

  const isMobile = useMediaQuery("(max-width: 768px)");
  const buyModal = useModal();
  const [buyContractId, setBuyContractId] = useState<string | null>(null);
  const data = useMemo(() => contractsQuery.data || [], [contractsQuery.data]);

  const onBuyFormClose = useCallback(async () => {
    contractsQuery.refetch();
    buyModal.close();
  }, []);

  const ch = createColumnHelper<HashRentalContract>();
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
          const params = getBuyButtonParams(userAccount, r.row.original.seller as `0x${string}`);
          return (
            <div className="flex flex-row gap-2 justify-center">
              <PrimaryButton
                css={css`
                  :after {
                    max-width: 150%;
                  }
                `}
                onClick={() => {
                  setBuyContractId(r.row.original.id);
                  buyModal.open();
                }}
                disabled={params.disabled}
                disabledText={params.disabledText}
              >
                Purchase
              </PrimaryButton>
            </div>
          );
        },
      }),
    ];
  }, [userAccount]);

  const tableInstance = useReactTable<HashRentalContract>({
    columns,
    data,
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
        <BuyForm key={buyContractId} contractId={buyContractId!} closeForm={onBuyFormClose} />
      </ModalItem>

      <Table tableInstance={tableInstance} />
    </>
  );
};

function getBuyButtonParams(userAccount: `0x${string}` | undefined, seller: `0x${string}`) {
  if (!userAccount) {
    return {
      disabled: true,
      disabledText: "Connect wallet to purchase contract",
    };
  }
  if (isAddressEqual(seller, userAccount)) {
    return {
      disabled: true,
      disabledText: "Cannot purchase your own contract",
    };
  }
  return {
    disabled: false,
    disabledText: undefined,
  };
}

const StatsChart: FC<{ successCount: number; failCount: number }> = (props) => {
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
};
