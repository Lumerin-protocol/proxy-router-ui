import { faCheckCircle } from "@fortawesome/free-solid-svg-icons/faCheckCircle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { colors } from "../../../styles/styles.config";
import { AddressLength, ContentState } from "../../../types/types";
import { Spinner } from "../../Spinner.styled";
import { getTxUrl } from "../../../lib/indexer";
import { truncateAddress } from "../../../utils/formatters";

const createText = {
  thankYou: "Thank you for creating a Hashpower Contract on Lumerin!",
  view: "The hashpower contract is already available.",
};

const editText = {
  thankYou: "Thank you for using the Lumerin Hashpower Marketplace!",
  view: "Your changes will will be available shortly.",
};

interface CompletedContentProps {
  contentState: ContentState;
  isEdit?: boolean;
  txHash?: `0x${string}`;
}

export const CompletedContent: React.FC<CompletedContentProps> = ({ contentState, isEdit, txHash }) => {
  return (
    <div className="flex flex-col items-center font-Inter">
      {contentState === ContentState.Pending ? null : (
        <div className="flex flex-col items-center">
          <FontAwesomeIcon className="my-8" icon={faCheckCircle} size="5x" color={colors["lumerin-aqua"]} />
          <p className="w-4/6 text-center text-xl mb-8">{isEdit ? editText.thankYou : createText.thankYou}</p>
          <p className="w-5/6 text-center text-sm">{isEdit ? editText.view : createText.view}</p>
          {txHash && (
            <p className="w-5/6 text-center text-sm">
              Tx hash:{" "}
              <a href={getTxUrl(txHash)} target="_blank" rel="noreferrer">
                {truncateAddress(txHash, AddressLength.MEDIUM)}
              </a>
            </p>
          )}
        </div>
      )}
      {contentState === ContentState.Pending ? (
        <div className="flex flex-col w-full items-center mb-4">
          <p className="w-4/6 text-center text-xl mb-8">Your transaction is pending.</p>
        </div>
      ) : null}
      {contentState === ContentState.Pending ? <Spinner /> : null}
    </div>
  );
};

CompletedContent.displayName = "CreateCompletedContent";
