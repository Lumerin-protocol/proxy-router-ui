import { useAccount, usePublicClient, useReadContract, useWalletClient } from "wagmi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { colors } from "../../styles/styles.config";
import { TransactionForm } from "./Shared/MultistepForm";
import { abi } from "contracts-js";
import { useContracts, waitForBlockNumber } from "../../hooks/data/useContracts";
import { getContractUrl } from "../../lib/indexer";
import { Link } from "react-router";
import { truncateAddress } from "../../utils/utils";
import { AddressLength } from "../../types/types";
import { GenericCompletedContent } from "./Shared/GenericCompletedContent";
import { useQueryClient } from "@tanstack/react-query";

const { cloneFactoryAbi } = abi;

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
        data: data.data.filter((c) => c.seller === userAccount && c.isDeleted === false),
      };
    },
  });

  return (
    <TransactionForm
      onCancel={closeForm}
      client={publicClient!}
      title="Deregister yourself as a Seller"
      description="You are about to deregister yourself as a Seller."
      reviewForm={(props) => (
        <>
          <div className="mt-2">
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
              return undefined;
            }
            const req = await publicClient!.simulateContract({
              address: process.env.REACT_APP_CLONE_FACTORY,
              abi: cloneFactoryAbi,
              functionName: "setContractsDeleted",
              args: [contracts.data!.map((c) => c.id as `0x${string}`), true],
            });
            return await wc.data!.writeContract(req.request);
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
            return await wc.data!.writeContract(req.request);
          },
        },
      ]}
    />
  );
};
