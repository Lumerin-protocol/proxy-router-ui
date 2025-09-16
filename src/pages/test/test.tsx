import { type FC } from "react";
import { HeroHeadline, HeroWrapper } from "../landing/Landing.styled";

import { AvailableContract, useContractsForSale } from "../../hooks/data/useContractsForSale";
import { useHashrateForOracle, useValidatorsConst } from "../../hooks/data/useGetContractsConstant";
import { HashRentalContract } from "../../types/types";

export const Test: FC = () => {
  const { VALIDATOR_FEE_DECIMALS, validatorFeeRateScaled } = useValidatorsConst();
  const { data: oracle } = useHashrateForOracle();
  const { data } = useContractsForSale();

  const mapperToLegacy: HashRentalContract[] | undefined = data?.data.map((c) => {
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
      price: (price / 10n ** 6n).toString(),
      fee: (fee / 10n ** 8n).toString(),
      speed: c.speed.toString(),
      length: c.length.toString(),
      version: c.version.toString(),
      seller: seller,
      buyer: buyer,
      profitTargetPercent: c.profitTargetPercent.toString(),
      stats: {
        successCount: (c.stats.purchasesCount + c.stats.resellsCount - c.stats.earlyCloseoutsCount).toString(),
        failCount: c.stats.earlyCloseoutsCount.toString(),
      },
    } as HashRentalContract;
  });

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

    const priceInToken: bigint = (remainingTime * c.speed) / hashesForToken;
    const priceInTokenWithProfit: bigint = priceInToken + (priceInToken * BigInt(c.profitTargetPercent)) / 100n;

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

  return (
    <HeroWrapper>
      <div className="content-wrapper">
        <HeroHeadline>Test</HeroHeadline>
        {mapperToLegacy?.map((contract) => (
          <div key={contract.id} className="mb-8">
            <dt>Address</dt>
            <dd>{contract.id}</dd>
            <dt>Speed</dt>
            <dd>{contract.speed.toString()}</dd>
            <dt>Length</dt>
            <dd>{contract.length.toString()}</dd>
            <dt>Profit Target Percent</dt>
            <dd>{contract.profitTargetPercent}</dd>
            <dt>Version</dt>
            <dd>{contract.version}</dd>
            <dt>Seller</dt>
            <dd>{contract.seller}</dd>
            <dt>Success Count</dt>
            <dd>{contract.stats.successCount}</dd>
            <dt>Failed Count</dt>
            <dd>{contract.stats.failCount}</dd>
          </div>
        ))}
      </div>
    </HeroWrapper>
  );
};
