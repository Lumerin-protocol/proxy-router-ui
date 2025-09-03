import type React from "react";
import { classNames } from "../utils/classNames";
import { getAddressDisplay } from "../utils/formatters";
import { getContractUrl } from "../lib/indexer";

interface TableIconProps {
  icon: JSX.Element | null;
  text: string;
  justify: string;
  isLargeBreakpointOrGreater?: boolean;
  hasLink?: boolean;
}

export const TableIcon: React.FC<TableIconProps> = ({ icon, text, isLargeBreakpointOrGreater, justify, hasLink }) => {
  let updatedJustify = justify ?? "center";
  updatedJustify = `justify-${updatedJustify}`;

  return (
    <div className={classNames("flex", updatedJustify)}>
      <div className="flex items-center">
        <span className={icon ? "mr-2" : ""}>{icon}</span>
        <span className="font-semibold text-left">
          {hasLink ? (
            <a href={getContractUrl(text as `0x${string}`)} target="_blank" rel="noreferrer" className="cursor-pointer">
              {getAddressDisplay(isLargeBreakpointOrGreater as boolean, text)}
            </a>
          ) : (
            text
          )}
        </span>
      </div>
    </div>
  );
};

TableIcon.displayName = "Icon";
