import { type FC } from "react";
import { HeroHeadline, HeroWrapper } from "../landing/Landing.styled";

import { useAvailableContractsV2 } from "../../hooks/data/useContactsV2";
import { useContactsAggregation } from "../../hooks/data/useContactsAggregation";

export const Test: FC = () => {
  const { data } = useAvailableContractsV2();
  const { data: aggregationData, isLoading: aggregationLoading, error: aggregationError } = useContactsAggregation();

  return (
    <HeroWrapper>
      <div className="content-wrapper">
        <HeroHeadline>Test</HeroHeadline>

        {/* Aggregation Data Example */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-bold mb-4">Contract Aggregation Data</h3>
          {aggregationLoading && <p>Loading aggregation data...</p>}
          {aggregationError && <p className="text-red-500">Error: {aggregationError.message}</p>}
          {aggregationData && (
            <div>
              <p>
                <strong>Available Contracts:</strong> {aggregationData.data.contractAvailableCount}
              </p>
              <p>
                <strong>Resellable Contracts:</strong> {aggregationData.data.contractAvailableResellableCount}
              </p>
            </div>
          )}
        </div>
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
