import { type FC, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import Skeleton from "@mui/material/Skeleton";
import { DefaultLayout } from "../../components/Layouts/DefaultLayout";
import { MarketplaceStatistics } from "../../components/Widgets/MarketplaceStatistics";
import { MessageWidget } from "../../components/Widgets/MessageWidget";
import { WalletBalanceWidget } from "../../components/Widgets/WalletBalanceWidget";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import type { HashRentalContract } from "../../types/types";
import { useModal } from "../../hooks/useModal";
import { Table } from "../../components/Table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { ModalItem } from "../../components/Modal";
import { BuyForm2 } from "../../components/Forms/BuyForm";
import { SkeletonWrap } from "../../components/Skeleton.styled";
import { createColumnHelper } from "@tanstack/react-table";
import { getSortedRowModel } from "@tanstack/react-table";
import { PrimaryButton } from "../../components/Forms/FormButtons/Buttons.styled";
import { TableIcon } from "../../components/TableIcon";
import { formatFeePrice, formatHashrateTHPS, formatPaymentPrice } from "../../lib/units";
import { formatDuration } from "../../lib/duration";
import { useAvailableContracts } from "../../hooks/data/useContracts";
import { WidgetsWrapper } from "./styled";
import { isAddressEqual, zeroAddress } from "viem";

export const Marketplace: FC = () => {
  const { address: userAccount } = useAccount();
  const contractsQuery = useAvailableContracts();

  const isMobile = useMediaQuery("(max-width: 768px)");
  const buyModal = useModal();
  const [buyContractId, setBuyContractId] = useState<string | null>(null);
  const data = useMemo(() => contractsQuery.data || [], [contractsQuery.data]);

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
      ch.display({
        header: "Actions",
        enableSorting: false,
        meta: {
          hideTitleMobile: true,
        },
        cell: (r) => (
          <div className="flex flex-row gap-2 justify-center">
            <PrimaryButton
              onClick={() => {
                setBuyContractId(r.row.original.id);
                buyModal.open();
              }}
              $disabledText="You cannot purchase your own contract"
              disabled={isAddressEqual(r.row.original.seller, userAccount || zeroAddress)}
            >
              Purchase
            </PrimaryButton>
          </div>
        ),
      }),
    ];
  }, []);

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
    <DefaultLayout pageTitle="Marketplace">
      <WidgetsWrapper>
        <MessageWidget isMobile={isMobile} />
        <WalletBalanceWidget />
        <MarketplaceStatistics />
      </WidgetsWrapper>
      <ModalItem open={buyModal.isOpen} setOpen={buyModal.setOpen}>
        <BuyForm2 key={buyContractId} contractId={buyContractId!} setOpen={buyModal.setOpen} />
      </ModalItem>
      <Table tableInstance={tableInstance} />
    </DefaultLayout>
  );
};
