import type React from "react";
import { classNames, getAddressDisplay } from "../../utils";

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
            <a
              href={process.env.REACT_APP_ETHERSCAN_URL + `${text}`}
              target="_blank"
              rel="noreferrer"
              className="cursor-pointer"
            >
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
