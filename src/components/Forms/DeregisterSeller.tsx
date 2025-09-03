import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { TransactionForm } from "./Shared/MultistepForm";
import { useContracts, waitForBlockNumber } from "../../hooks/data/useContracts";
import { getContractUrl } from "../../lib/indexer";
import { Link } from "react-router";
import { truncateAddress } from "../../utils/formatters";
import { AddressLength } from "../../types/types";
import { GenericCompletedContent } from "./Shared/GenericCompletedContent";
import { useQueryClient } from "@tanstack/react-query";
import { cloneFactoryAbi } from "contracts-js/dist/abi/abi";
import { isAddressEqual } from "viem";

export interface CancelFormProps {
  closeForm: () => void;
}

export const DeregisterSeller: React.FC<CancelFormProps> = ({ closeForm }) => {
  const { address: userAccount } = useAccount();
  const publicClient = usePublicClient();
  const qc = useQueryClient();
  const wc = useWalletClient();

  const contracts = useContracts({
    select: (data) => {
      return {
        ...data,
        data: data.data.filter((c) => isAddressEqual(c.seller as `0x${string}`, userAccount!) && c.isDeleted === false),
      };
    },
    enabled: !!userAccount,
  });

  return (
    <TransactionForm
      onClose={closeForm}
      title="Deregister as a Seller"
      description=""
      reviewForm={() => (
        <>
          <p>
            You are about to deregister yourself as a Seller. This will archive all your active contracts and return
            your stake to your account balance.
          </p>
          <div className="mt-4">
            {contracts.data && contracts.data.length > 0 ? (
              <>
                Following contracts will be archived:
                <ul>
                  {contracts.data?.map((c) => (
                    <li key={c.id}>
                      <Link to={getContractUrl(c.id as `0x${string}`)}>
                        {truncateAddress(c.id as `0x${string}`, AddressLength.LONG)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p>None of your contracts are active.</p>
            )}
          </div>
        </>
      )}
      resultForm={(props) => (
        <GenericCompletedContent
          title="You successfully deregistered yourself as a Seller"
          description="Your stake have been returned to your account balance."
        />
      )}
      transactionSteps={[
        {
          label: "Archive all contracts",
          action: async () => {
            if (contracts.data?.length === 0) {
              return { isSkipped: true };
            }
            const req = await publicClient!.simulateContract({
              address: process.env.REACT_APP_CLONE_FACTORY,
              abi: cloneFactoryAbi,
              functionName: "setContractsDeleted",
              args: [contracts.data!.map((c) => c.id as `0x${string}`), true],
              account: userAccount!,
            });
            const txhash = await wc.data!.writeContract(req.request);
            return {
              isSkipped: false,
              txhash: txhash,
            };
          },
          postConfirmation: async (receipt) => {
            await waitForBlockNumber(receipt.blockNumber, qc);
          },
        },
        {
          label: "Deregister yourself as a Seller",
          action: async () => {
            const req = await publicClient!.simulateContract({
              address: process.env.REACT_APP_CLONE_FACTORY,
              abi: cloneFactoryAbi,
              functionName: "sellerDeregister",
              account: userAccount!,
            });
            const txhash = await wc.data!.writeContract(req.request);
            return {
              isSkipped: false,
              txhash: txhash,
            };
          },
        },
      ]}
    />
  );
};
