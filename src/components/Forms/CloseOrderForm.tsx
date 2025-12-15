import { waitForAggregateBlockNumber, AGGREGATE_ORDER_BOOK_QK } from "../../hooks/data/useAggregateOrderBook";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons/faCheckCircle";
import { colors } from "../../styles/styles.config";
import { useQueryClient } from "@tanstack/react-query";
import { TransactionFormV2 as TransactionForm } from "./Shared/MultistepForm";
import type { TransactionReceipt } from "viem";
import { useCreateOrder } from "../../hooks/data/useCreateOrder";
import { useAccount } from "wagmi";
import { PARTICIPANT_QK } from "../../hooks/data/useParticipant";
import { POSITION_BOOK_QK } from "../../hooks/data/usePositionBook";
import type { FC } from "react";

export interface CloseOrderFormProps {
  isBuy: boolean;
  pricePerDay: bigint;
  deliveryAt: bigint;
  amount: number;
  closeForm: () => void;
}

export const CloseOrderForm: FC<CloseOrderFormProps> = ({ isBuy, pricePerDay, deliveryAt, amount, closeForm }) => {
  const qc = useQueryClient();
  const { address } = useAccount();
  const { createOrderAsync } = useCreateOrder();

  // Create an order with opposite sign to close the existing orders
  // If buy orders (isBuy = true), create sell order with negative quantity
  // If sell orders (isBuy = false), create buy order with positive quantity
  const oppositeQuantity = isBuy ? -amount : amount;

  const formatPrice = (price: bigint) => {
    return (Number(price) / 1e6).toFixed(2);
  };

  const formatDeliveryDate = (deliveryDate: bigint) => {
    const date = new Date(Number(deliveryDate) * 1000);
    return date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <TransactionForm
      onClose={closeForm}
      title="Close Order"
      description=""
      reviewForm={(props) => (
        <>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Order Details:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Type:</span>
                <span className="text-white">{isBuy ? "Buy" : "Sell"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Price:</span>
                <span className="text-white">{formatPrice(pricePerDay)} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Quantity:</span>
                <span className="text-white">{amount} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Delivery Date:</span>
                <span className="text-white">{formatDeliveryDate(deliveryAt)}</span>
              </div>
            </div>
          </div>
          <p className="text-gray-400 text-sm">
            You are about to close this order. An opposite order will be created to close the existing order.
          </p>
        </>
      )}
      resultForm={(props) => (
        <>
          <p className="w-6/6 text-left font-normal text-s mt-5">
            Your order has been closed and will be removed from the order book shortly.
          </p>
        </>
      )}
      transactionSteps={[
        {
          label: "Close Order",
          action: async () => {
            const txhash = await createOrderAsync({
              price: pricePerDay,
              deliveryDate: deliveryAt,
              quantity: oppositeQuantity,
              destUrl: "",
            });
            return { txhash, isSkipped: false };
          },
          postConfirmation: async (receipt: TransactionReceipt) => {
            // Wait for block number to ensure indexer has updated
            await waitForAggregateBlockNumber(receipt.blockNumber, qc, Number(deliveryAt));

            // Refetch order book, positions, and participant data
            await Promise.all([
              qc.invalidateQueries({ queryKey: [AGGREGATE_ORDER_BOOK_QK] }),
              address && qc.invalidateQueries({ queryKey: [POSITION_BOOK_QK] }),
              address && qc.invalidateQueries({ queryKey: [PARTICIPANT_QK] }),
            ]);
          },
        },
      ]}
    />
  );
};
