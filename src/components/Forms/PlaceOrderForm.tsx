import { memo, type FC } from "react";
import { waitForBlockNumber } from "../../hooks/data/useOrderBook";
import { TransactionForm } from "./Shared/MultistepForm";
import type { TransactionReceipt } from "viem";
import { useCreateOrder } from "../../hooks/data/useCreateOrder";
import { ORDER_BOOK_QK } from "../../hooks/data/useOrderBook";
import { PARTICIPANT_QK } from "../../hooks/data/useParticipant";
import { POSITION_BOOK_QK } from "../../hooks/data/usePositionBook";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";

interface Props {
  price: bigint;
  deliveryDate: bigint;
  quantity: number;
  isBuy: boolean;
  closeForm: () => void;
}

export const PlaceOrderForm: FC<Props> = memo(
  ({ price, deliveryDate, quantity, isBuy, closeForm }) => {
    const { createOrderAsync } = useCreateOrder();
    const qc = useQueryClient();
    const { address } = useAccount();

    return (
      <TransactionForm
        onClose={closeForm}
        title={isBuy ? "Place Buy Order" : "Place Sell Order"}
        description={""}
        reviewForm={(props) => (
          <>
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Order Details:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Type:</span>
                  <span className="text-white">{isBuy ? "Buy / Long" : "Sell / Short"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Price:</span>
                  <span className="text-white">${Number(price) / 1e6}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Quantity:</span>
                  <span className="text-white">{quantity} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Delivery Date:</span>
                  <span className="text-white">{new Date(Number(deliveryDate) * 1000).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Value:</span>
                  <span className="text-white">${((Number(price) / 1e6) * quantity).toFixed(2)}</span>
                </div>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              You are about to place a {isBuy ? "buy" : "sell"} order. Please review the details above.
            </p>
          </>
        )}
        resultForm={(props) => (
          <>
            <h2 className="w-6/6 text-left font-semibold mb-3">Order created successfully!</h2>
            <p className="w-6/6 text-left font-normal text-s">
              Your order has been placed and will appear in the order book shortly.
            </p>
          </>
        )}
        transactionSteps={[
          {
            label: `Place ${isBuy ? "Buy" : "Sell"} Order`,
            action: async () => {
              const txhash = await createOrderAsync({
                price,
                deliveryDate,
                quantity,
                isBuy,
              });
              return {
                isSkipped: false,
                txhash: txhash,
              };
            },
            postConfirmation: async (receipt: TransactionReceipt) => {
              debugger;
              // Wait for block number to ensure indexer has updated
              await waitForBlockNumber(receipt.blockNumber, qc);

              // Refetch order book, positions, and participant data
              await Promise.all([
                qc.invalidateQueries({ queryKey: [ORDER_BOOK_QK] }),
                address && qc.invalidateQueries({ queryKey: [POSITION_BOOK_QK] }),
                address && qc.invalidateQueries({ queryKey: [PARTICIPANT_QK] }),
              ]);
            },
          },
        ]}
      />
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.price === nextProps.price &&
      prevProps.deliveryDate === nextProps.deliveryDate &&
      prevProps.quantity === nextProps.quantity &&
      prevProps.isBuy === nextProps.isBuy
    );
  },
);
