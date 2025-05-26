import { useAccount, usePublicClient, useReadContract, useWalletClient } from "wagmi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { colors } from "../../styles/styles.config";
import { TransactionForm } from "./MultistepForm";
import { abi } from "contracts-js";
import { useContracts } from "../../hooks/data/useContracts";
import { getContractUrl } from "../../lib/indexer";
import { Link } from "react-router";
import { truncateAddress } from "../../utils/utils";
import { AddressLength } from "../../types/types";

const { cloneFactoryAbi } = abi;

export interface CancelFormProps {
  closeForm: () => void;
}

export const DeregisterSeller: React.FC<CancelFormProps> = ({ closeForm }) => {
  const { address: userAccount } = useAccount();
  const publicClient = usePublicClient();
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
      description="You are about to deregister yourself as a Seller. Make sure all of your contracts are archived. Your stake will be returned to your account."
      reviewForm={(props) => (
        <>
          <p className="mb-2">Make sure you want to deregister yourself as a Seller.</p>
          <div>
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
          </div>
        </>
      )}
      resultForm={(props) => (
        <>
          <FontAwesomeIcon className="mb-8" icon={faCheckCircle} size="5x" color={colors["lumerin-aqua"]} />
          <h2 className="w-6/6 text-left font-semibold mb-3">The order has been cancelled successfully.</h2>
          <p className="w-6/6 text-left font-normal text-s">The status of the order will update shortly.</p>
          <br />
          {/* {txHash && (
            <a
              href={getTxUrl(txHash as `0x${string}`)}
              target="_blank"
              rel="noreferrer"
              className="font-light underline mb-4"
            >
              View Transaction: {truncateAddress(txHash, AddressLength.LONG)}
            </a>
          )} */}
        </>
      )}
      transactionSteps={[
        {
          label: "Archive all contracts",
          action: async () => {
            const req = await publicClient!.simulateContract({
              address: process.env.REACT_APP_CLONE_FACTORY,
              abi: cloneFactoryAbi,
              functionName: "setContractsDeleted",
              args: [contracts.data!.map((c) => c.id as `0x${string}`), true],
            });
            return await wc.data!.writeContract(req.request);
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
