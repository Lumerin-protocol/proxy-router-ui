import { type FC } from "react";
import { HeroHeadline, HeroWrapper } from "../landing/Landing.styled";

import { useAvailableContractsV2 } from "../../hooks/data/useContactsV2";

export const Test: FC = () => {
  const { data } = useAvailableContractsV2();

  return (
    <HeroWrapper>
      <div className="content-wrapper">
        <HeroHeadline>Test</HeroHeadline>
        {data?.map((contract) => (
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
            <dt>Seller / Producer</dt>
            <dd>
              {contract.seller} / {(contract as any).producer}
            </dd>
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
