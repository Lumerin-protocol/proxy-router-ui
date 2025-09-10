import { useState, useRef, useEffect, type FC } from "react";
import { PrimaryButton } from "./Forms/FormButtons/Buttons.styled";
import { css } from "@emotion/react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { isAddressEqual } from "viem";

type PurchaseType = "purchase" | "purchase-and-resell";

interface PurchaseDropdownProps {
  userAccount?: `0x${string}`;
  seller: string;
  onPurchase: (contractId: string, purchaseType: PurchaseType) => void;
  contractId: string;
}

const getBuyButtonParams = (userAccount: `0x${string}` | undefined, seller: `0x${string}`) => {
  if (!userAccount) {
    return {
      disabled: true,
      disabledText: "Connect wallet to purchase contract",
    };
  }
  if (isAddressEqual(seller, userAccount)) {
    return {
      disabled: true,
      disabledText: "Cannot purchase your own contract",
    };
  }
  return {
    disabled: false,
    disabledText: undefined,
  };
};

export const PurchaseDropdown: FC<PurchaseDropdownProps> = ({ userAccount, seller, onPurchase, contractId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buyParams = getBuyButtonParams(userAccount, seller as `0x${string}`);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOptionClick = (purchaseType: PurchaseType) => {
    onPurchase(contractId, purchaseType);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <PrimaryButton
        css={css`
          :after {
            max-width: 150%;
          }
        `}
        onClick={() => setIsOpen(!isOpen)}
        disabled={buyParams.disabled}
        disabledText={buyParams.disabledText}
      >
        Purchase
        <KeyboardArrowDownIcon
          sx={{
            marginLeft: "0.5rem",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease-in-out",
          }}
        />
      </PrimaryButton>

      {isOpen && (
        <div
          css={css`
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: #1a1a1a;
            border: 1px solid rgba(171, 171, 171, 0.5);
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            margin-top: 4px;
          `}
        >
          <button
            onClick={() => handleOptionClick("purchase")}
            css={css`
              width: 100%;
              padding: 12px 16px;
              background: transparent;
              border: none;
              color: #fff;
              text-align: left;
              cursor: pointer;
              font-size: 14px;
              font-weight: 500;
              transition: background-color 0.2s ease;

              &:hover {
                background: rgba(255, 255, 255, 0.1);
              }

              &:first-of-type {
                border-radius: 8px 8px 0 0;
              }

              &:last-of-type {
                border-radius: 0 0 8px 8px;
              }
            `}
          >
            Purchase
          </button>
          <div
            css={css`
              height: 1px;
              background: rgba(171, 171, 171, 0.3);
              margin: 0 8px;
            `}
          />
          <button
            onClick={() => handleOptionClick("purchase-and-resell")}
            css={css`
              width: 100%;
              padding: 12px 16px;
              background: transparent;
              border: none;
              color: #fff;
              text-align: left;
              cursor: pointer;
              font-size: 14px;
              font-weight: 500;
              transition: background-color 0.2s ease;

              &:hover {
                background: rgba(255, 255, 255, 0.1);
              }

              &:first-of-type {
                border-radius: 8px 8px 0 0;
              }

              &:last-of-type {
                border-radius: 0 0 8px 8px;
              }
            `}
          >
            Purchase & Resell
          </button>
        </div>
      )}
    </div>
  );
};
