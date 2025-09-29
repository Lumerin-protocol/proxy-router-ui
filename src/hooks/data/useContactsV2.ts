import { HashRentalContractV2 } from "../../types/types";
import { useContractsForSale, AvailableContract } from "./useContractsForSale";
import { useValidatorsConst, useHashrateForOracle } from "./useGetContractsConstant";

export const useAvailableContractsV2 = () => {
  const { VALIDATOR_FEE_DECIMALS, validatorFeeRateScaled, isSuccess: isConstRequestSuccess } = useValidatorsConst();
  const { data: oracle, isSuccess: isOracleRequestSuccess } = useHashrateForOracle();
  const contractsQuery = useContractsForSale();

  const mapperToLegacy: HashRentalContractV2[] | undefined =
    isConstRequestSuccess && isOracleRequestSuccess
      ? contractsQuery.data?.data.map((c) => {
          // Ensure oracle is a valid bigint before using it
          const price = calculatePrice(c, oracle!);
          const fee = (price * BigInt(validatorFeeRateScaled ?? 0)) / BigInt(10 ** (VALIDATOR_FEE_DECIMALS ?? 0));
          const lastRc = c.resellChain[c.resellChain.length - 1];

          // show on UI both producer and seller.
          const producer = c.owner;
          const seller = lastRc.seller;
          const buyer = lastRc.account;

          return {
            id: c.address,
            isDeleted: false,
            state: "0",
            price: price.toString(),
            fee: fee.toString(),
            speed: c.speed.toString(),
            length: c.length.toString(),
            version: c.version.toString(),
            seller: seller,
            isResellable: c.isResellable, // Used to identify if that contract can be purchased, not about type (direct or resell)
            producer: producer,
            buyer: buyer,
            profitTargetPercent: c.profitTargetPercent.toString(),
            isDirect: c.resellChain.length == 1, // if there only one item in rc then it is direct purchase
            stats: {
              successCount: (c.stats.purchasesCount + c.stats.resellsCount - c.stats.earlyCloseoutsCount).toString(),
              failCount: c.stats.earlyCloseoutsCount.toString(),
            },
          } as HashRentalContractV2;
        })
      : undefined;

  return {
    data: mapperToLegacy,
    isLoading: contractsQuery.isLoading,
    refetch: contractsQuery.refetch,
  };
};

function calculatePrice(c: AvailableContract, hashesForToken: bigint): bigint {
  // Current epoch time in seconds
  const currentTime: bigint = BigInt(Math.floor(Date.now() / 1000));

  // if endDate less that current time - then this contract is Available
  // else endDate bigger then now - then it is purchased.

  const endTime = getEndTime(c);
  let remainingTime: bigint;
  if (endTime < currentTime) {
    remainingTime = c.length;
  } else {
    remainingTime = endTime - currentTime;
  }

  // Ensure all operations are with BigInt types
  const priceInToken: bigint = (remainingTime * c.speed) / hashesForToken;
  const priceInTokenWithProfit: bigint =
    priceInToken + (priceInToken * BigInt(Math.floor(c.profitTargetPercent))) / 100n;

  return priceInTokenWithProfit < 0n ? 0n : priceInTokenWithProfit;
}

function getStartTime(c: AvailableContract): bigint {
  if (c.resellChain.length <= 1) {
    return 0n;
  }
  return c.resellChain[1].startTime;
}

function getEndTime(c: AvailableContract): bigint {
  const startTime = getStartTime(c);

  if (startTime == 0n) {
    return 0n;
  }

  return startTime + c.length;
}
