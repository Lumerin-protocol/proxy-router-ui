import { type FC } from "react";
import { HeroHeadline, HeroWrapper } from "../landing/Landing.styled";

import { useContractsForSale } from "../../hooks/data/useContractsForSale";

export const Test: FC = () => {
  const { data } = useContractsForSale();

    // _id: string; // ID
    // address: string; // ID


    // price: string; // Calculate
    // fee: string; // Calculate

    // stats: {
    //   successCount: string; // FROM request
    //   failCount: string; // From request
    // };

    // speed: string; // From request
    // length: string; // From request
    // profitTargetPercent: string;  // From request
    // version: // From request

    // state: string; // By Request Query (Available by now)
    // isDeleted: boolean; // By Request Query (False by now)
  

    // buyer: string; // last.rc.account (Not final)
    // seller: string; // last.rc.seller
    // Owner: from request


    // timestamp: string;
    // balance: string;
    // validator: string;
    // feeBalance: string;

    // encryptedPoolData: string; // NO need
    // history?: ContractHistory[]; // No need for now

  console.log("🚀 ~ Test ~ data:", data)

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
