import type React from "react";

interface ProgressBarProps {
  width: string;
}
export const ProgressBar: React.FC<ProgressBarProps> = ({ width }) => {
  return (
    <div className="pt-1 sm:pt-4">
      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-lumerin-dark-gray">
        <div
          style={{ width: `${width}%` }}
          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-lumerin-green"
        />
      </div>
    </div>
  );
};

ProgressBar.displayName = "ProgressBar";
