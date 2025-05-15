import { type FC, useState } from "react";
import { useAccount } from "wagmi";
import type { EthereumGateway } from "../../../gateway/ethereum";
import { AddressLength, ContentState } from "../../../types/types";
import { printError, truncateAddress } from "../../../utils/utils";
import { Spinner } from "../../Spinner.styled";
import { Link } from "react-router";
import { getTxUrl } from "../../../lib/indexer";

interface Props {
  contractId: string;
  web3Gateway?: EthereumGateway;
  isArchived: boolean;
  closeForm: () => void;
}

export const ArchiveUnarchiveForm: FC<Props> = ({ contractId, web3Gateway, isArchived, closeForm }) => {
  const { address: userAccount } = useAccount();
  const [contentState, setContentState] = useState<string>(ContentState.Review);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

  const action: () => void = async () => {
    setContentState(ContentState.Pending);

    try {
      const receipt = await web3Gateway!.setContractDeleted(contractId, !isArchived, userAccount!);
      if (receipt.status) {
        setContentState(ContentState.Complete);
        setTxHash(receipt.transactionHash);
      }
    } catch (error) {
      const typedError = error as Error;
      printError(typedError.message, typedError.stack as string);
      closeForm();
    }
  };

  return (
    <>
      <div className="flex flex-col justify-center w-full min-w-21 max-w-32 sm:min-w-26">
        {contentState === ContentState.Review ? (
          <>
            <div className="flex justify-center modal-input-spacing pb-4 border-transparent rounded-t-5">
              <div>
                <p className="text-3xl">Archive Contract</p>
              </div>
            </div>
            <div className="modal-input-spacing text-center">
              You are about to {isArchived ? "unarchive" : "archive"} this contract.
            </div>
            <div className="flex gap-6  modal-input-spacing pb-8 rounded-b-5">
              <button
                type="submit"
                className="h-16 w-full py-2 px-4 btn-modal border-lumerin-aqua text-sm font-medium text-lumerin-aqua focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lumerin-aqua"
                onClick={action}
              >
                Continue
              </button>
            </div>
          </>
        ) : null}
        {contentState === ContentState.Pending ? (
          <div className="flex flex-col items-center modal-input-spacing pb-8 border-transparent rounded-5">
            <div className="flex justify-center">
              <p className=" modal-input-spacing border-transparent pt-0 mb-8 text-xl text-center">
                Your transaction is pending.
              </p>
            </div>
            <Spinner />
          </div>
        ) : null}
        {contentState === ContentState.Complete ? (
          <div className="flex-col text-lumerin-aqua modal-input-spacing pb-8 border-transparent rounded-5">
            <p className="mb-1">Contract has been {isArchived ? "unarchived" : "archived"} successfully.</p>
            <p>
              Tx hash: <Link to={getTxUrl(txHash!)}>{truncateAddress(txHash!, AddressLength.MEDIUM)}</Link>
            </p>
          </div>
        ) : null}
      </div>
    </>
  );
};
