import { faCheckCircle } from "@fortawesome/free-solid-svg-icons/faCheckCircle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { colors } from "../../../styles/styles.config";
import type { FC, ReactNode } from "react";

interface Props {
  title: string;
  description?: ReactNode;
}

export const GenericCompletedContent: FC<Props> = ({ title, description }) => {
  return (
    <div className="flex flex-col items-center font-Inter">
      <div className="flex flex-col items-center">
        <FontAwesomeIcon className="my-8" icon={faCheckCircle} size="5x" color="#11B4BF" />
        <h1 className="w-4/6 text-center text-2xl mb-4">{title}</h1>
        {description && <div className="w-5/6 text-center text-sm mb-4">{description}</div>}
      </div>
    </div>
  );
};
