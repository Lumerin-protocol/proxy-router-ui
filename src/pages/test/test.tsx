import { type FC } from "react";
import { HeroHeadline, HeroWrapper } from "../landing/Landing.styled";

import { useContractsForSale } from "../../hooks/data/useContractsForSale";

export const Test: FC = () => {
  const { data } = useContractsForSale();

  return (
    <HeroWrapper>
      <div className="content-wrapper">
        <HeroHeadline>Test</HeroHeadline>
        {data?.data.map((contract) => (
          <div key={contract._id} className="mb-8">
            <dt>Address</dt>
            <dd>{contract.address}</dd>
            <dt>Speed</dt>
            <dd>{contract.speed.toString()}</dd>
            <dt>Length</dt>
            <dd>{contract.length.toString()}</dd>
            <dt>Profit Target Percent</dt>
            <dd>{contract.profitTargetPercent}</dd>
            <dt>Version</dt>
            <dd>{contract.version}</dd>
            <dt>Owner</dt>
            <dd>{contract.owner}</dd>
            <dt>Resell Chain</dt>
            <dd>{contract.resellChain.map((rc) => rc.account).join(", ")}</dd>
            <dt>Purchases Count</dt>
            <dd>{contract.stats.purchasesCount}</dd>
            <dt>Resells Count</dt>
            <dd>{contract.stats.resellsCount}</dd>
          </div>
        ))}
      </div>
    </HeroWrapper>
  );
};
