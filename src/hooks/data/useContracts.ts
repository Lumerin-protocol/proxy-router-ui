import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getContractsV2 } from "../../gateway/indexer";
import type { HashRentalContract } from "../../types/types";

interface Props {
  userAccount: string | undefined;
}

export const useContracts = ({ userAccount }: Props) => {
  const queryClient = useQueryClient();
  const [currentBlockTimestamp, setCurrentBlockTimestamp] = useState<number>(0);

  const fetchContractsAsync = async (): Promise<HashRentalContract[]> => {
    const data = await getContractsV2(userAccount);

    return data.map((e) => {
      const { hasFutureTerms, futureTerms, state } = e;
      let { version, speed, length, price, fee } = e;
      if (hasFutureTerms && futureTerms && state === "0") {
        speed = futureTerms.speed;
        length = futureTerms.length;
        price = futureTerms.price;
        version = futureTerms.version;
      }
      return {
        id: e.id,
        price,
        fee,
        speed,
        length,
        buyer: e.buyer,
        seller: e.seller,
        timestamp: e.startingBlockTimestamp,
        state: e.state,
        encryptedPoolData: e.encrValidatorUrl,
        version,
        isDeleted: e.isDeleted,
        history: e.history.map((h) => {
          return {
            id: e.id,
            goodCloseout: h.isGoodCloseout,
            buyer: h.buyer,
            endTime: h.endTime,
            purchaseTime: h.purchaseTime,
            price: h.price,
            speed: h.speed,
            length: h.length,
          };
        }),
      };
    });
  };

  const query = useQuery({
    queryKey: ["contracts", userAccount],
    queryFn: fetchContractsAsync,
    refetchInterval: 30000, // 30 seconds
    select: (data) => data.filter((c) => !c.isDeleted),
  });

  // Optionally update timestamp on refetch
  useEffect(() => {
    if (query.isFetching) {
      setCurrentBlockTimestamp(Math.floor(new Date().getTime() / 1000));
    }
  }, [query.isFetching]);

  // Manual force refetch/invalidate method
  const forceRefetch = () => {
    queryClient.invalidateQueries({ queryKey: ["contracts", userAccount] });
  };

  return {
    ...query,
    currentBlockTimestamp,
    forceRefetch,
  };
};
