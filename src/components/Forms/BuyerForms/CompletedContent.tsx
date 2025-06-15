import { faCheckCircle } from "@fortawesome/free-solid-svg-icons/faCheckCircle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type React from "react";
import { colors } from "../../../styles/styles.config";
import { AddressLength, ContentState } from "../../../types/types";
import { truncateAddress } from "../../../utils/formatters";
import { Spinner } from "../../Spinner.styled";
import { getTxUrl } from "../../../lib/indexer";

enum buyText {
  thankYou = "Thank you for purchasing Hashpower from Lumerin!",
  view = "The hashpower you purchased will be routed shortly. Please note connection times to mining pools may vary depending on the hardware and the amount of hashpower being transmitted.",
}

enum editText {
  thankYou = "Thank you for updating your Hashpower Order.",
  view = "Your changes will be effective shortly.",
}

interface CompletedContentProps {
  contentState: ContentState;
  isEdit?: boolean;
  tx?: string;
  useLightningPayouts?: boolean;
}
export const CompletedContent: React.FC<CompletedContentProps> = ({
  contentState,
  isEdit,
  tx,
  useLightningPayouts,
}) => {
  if (contentState === ContentState.Pending) {
    return <PendingContent />;
  }
  return <CompletedContent2 isEdit={isEdit} tx={tx} useLightningPayouts={useLightningPayouts} />;
};

const PendingContent: React.FC = () => {
  return (
    <div className=" text-white flex flex-col">
      <div className="flex flex-col w-full items-center mb-4">
        <p className="w-4/6 text-center text-xl mb-8">Your transaction is pending.</p>
        <Spinner />
      </div>
    </div>
  );
};

const CompletedContent2: React.FC<{
  isEdit?: boolean;
  tx?: string;
  useLightningPayouts?: boolean;
}> = (props) => {
  const { isEdit, tx, useLightningPayouts } = props;
  return (
    <div className="flex flex-col px-8 py-2">
      <FontAwesomeIcon className="mb-8" icon={faCheckCircle} size="5x" color={colors["lumerin-aqua"]} />
      <h2 className="w-6/6 text-left font-semibold mb-3">{isEdit ? editText.thankYou : buyText.thankYou}</h2>
      <p className="w-6/6 text-left font-normal text-s">{isEdit ? editText.view : buyText.view}</p>
      <br />
      {tx && (
        <a href={getTxUrl(tx as `0x${string}`)} target="_blank" rel="noreferrer" className="font-light underline mb-4">
          View Transaction: {truncateAddress(tx, AddressLength.LONG)}
        </a>
      )}
      {useLightningPayouts && (
        <a
          href={process.env.REACT_APP_TITAN_LIGHTNING_DASHBOARD || "https://lightning.titan.io"}
          target="_blank"
          rel="noreferrer"
          style={{ cursor: "pointer" }}
          className="font-light underline mb-4"
        >
          Dashboard for Lightning users
        </a>
      )}
    </div>
  );
};
