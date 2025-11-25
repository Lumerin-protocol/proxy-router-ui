import styled from "@mui/material/styles/styled";
import { useAccount } from "wagmi";
import { useMemo } from "react";
import { useGetFutureBalance } from "../../../hooks/data/useGetFutureBalance";
import { useLmrBalanceValidation } from "../../../hooks/data/useLmrBalanceValidation";
import { useModal } from "../../../hooks/useModal";
import { SmallWidget } from "../../Cards/Cards.styled";
import { Spinner } from "../../Spinner.styled";
import { formatValue, paymentToken } from "../../../lib/units";
import { UsdcIcon } from "../../../images";
import { PrimaryButton } from "../../Forms/FormButtons/Buttons.styled";
import { ModalItem } from "../../Modal";
import { DepositForm } from "../../Forms/DepositForm";
import { WithdrawalForm } from "../../Forms/WithdrawalForm";
import EastIcon from "@mui/icons-material/East";

interface FuturesBalanceWidgetProps {
  minMargin: bigint | null;
  isLoadingMinMargin: boolean;
  unrealizedPnL: bigint | null;
}

export const FuturesBalanceWidget = ({ minMargin, isLoadingMinMargin, unrealizedPnL }: FuturesBalanceWidgetProps) => {
  const { address } = useAccount();
  const futureBalance = useGetFutureBalance(address);
  const lmrBalanceValidation = useLmrBalanceValidation(address);
  const depositModal = useModal();
  const withdrawalModal = useModal();

  const handleDepositSuccess = () => {
    futureBalance.refetch();
    depositModal.close();
  };

  const handleWithdrawalSuccess = () => {
    futureBalance.refetch();
    withdrawalModal.close();
  };

  const isLoading = futureBalance.isLoading;
  const isSuccess = !!(futureBalance.isSuccess && address);
  const balanceValue = formatValue(futureBalance.data ?? 0n, paymentToken);
  const lockedBalanceValue = formatValue(minMargin ?? 0n, paymentToken);
  const unrealizedPnLValue = formatValue(unrealizedPnL ?? 0n, paymentToken);
  const pnlColor =
    unrealizedPnL && unrealizedPnL > 0 ? "#22c55e" : unrealizedPnL && unrealizedPnL < 0 ? "#ef4444" : "#fff";

  // Check if LMR balance meets minimum requirement
  const requiredLmrAmount = BigInt(process.env.REACT_APP_FUTURES_REQUIRED_LMR || "10000");
  const hasMinimumLmrBalance = lmrBalanceValidation.totalBalance >= requiredLmrAmount;
  const isLmrBalanceLoading = lmrBalanceValidation.isLoading;

  // Check if locked amount is at or above threshold percentage of balance
  const lockedBalanceThreshold = Number(process.env.REACT_APP_MARGIN_UTILIZATION_WARNING_PERCENT || "80");
  const shouldHighlight = useMemo(() => {
    if (!futureBalance.data || !minMargin || futureBalance.data === 0n) return false;
    const lockedAmount = minMargin > 0n ? minMargin : -minMargin; // Use absolute value
    const lockedPercentage = (Number(lockedAmount) / Number(futureBalance.data)) * 100;
    return lockedPercentage >= lockedBalanceThreshold;
  }, [futureBalance.data, minMargin, lockedBalanceThreshold]);

  return (
    <>
      <BalanceWidgetContainer className="lg:w-[60%]" $shouldHighlight={shouldHighlight}>
        {address && <h3>Portfolio Overview</h3>}
        <BalanceContainer $shouldHighlight={shouldHighlight}>
          {!address && <div>Connect wallet to view balance and use marketplace</div>}
          {isLoading && address && <Spinner fontSize="0.3em" />}
          {isSuccess && address && hasMinimumLmrBalance && (
            <>
              <BalanceRow>
                <BalanceDisplay>
                  <BalanceStats>
                    <div className="balance">
                      <div>
                        <UsdcIcon style={{ width: "20px", marginRight: "6px" }} />
                        <div>{Number(balanceValue?.valueRounded).toFixed(2)}</div>
                        <TokenSymbol>{paymentToken.symbol}</TokenSymbol>
                      </div>
                      <p>TOTAL</p>
                    </div>
                    <div className="balance">
                      <div>
                        {isLoadingMinMargin ? (
                          <Spinner fontSize="0.3em" />
                        ) : (
                          <>
                            <UsdcIcon style={{ width: "20px", marginRight: "6px" }} />
                            <div>{Number(lockedBalanceValue.valueRounded).toFixed(2)}</div>
                            <TokenSymbol>{paymentToken.symbol}</TokenSymbol>
                          </>
                        )}
                      </div>
                      <p>LOCKED</p>
                    </div>
                    <div className="balance">
                      <div>
                        {unrealizedPnL !== null ? (
                          <>
                            <UsdcIcon style={{ width: "20px", marginRight: "6px" }} />
                            <div style={{ color: pnlColor }}>{Number(unrealizedPnLValue.valueRounded).toFixed(2)}</div>
                            <TokenSymbol>{paymentToken.symbol}</TokenSymbol>
                          </>
                        ) : (
                          "-"
                        )}
                      </div>
                      <p>UNREALIZED PNL</p>
                    </div>
                  </BalanceStats>
                </BalanceDisplay>
                <ActionButtons>
                  <PrimaryButton
                    onClick={depositModal.open}
                    disabled={!hasMinimumLmrBalance || isLmrBalanceLoading}
                    title={
                      !hasMinimumLmrBalance ? `Insufficient LMR balance. Required: ${requiredLmrAmount} LMR` : undefined
                    }
                  >
                    Deposit
                  </PrimaryButton>
                  <PrimaryButton
                    onClick={withdrawalModal.open}
                    disabled={!hasMinimumLmrBalance || isLmrBalanceLoading}
                    title={
                      !hasMinimumLmrBalance ? `Insufficient LMR balance. Required: ${requiredLmrAmount} LMR` : undefined
                    }
                  >
                    Withdraw
                  </PrimaryButton>
                </ActionButtons>
              </BalanceRow>
            </>
          )}
          {isSuccess && address && !hasMinimumLmrBalance && (
            <p onClick={(e) => e.preventDefault()}>
              {isLmrBalanceLoading
                ? "Checking LMR balance..."
                : hasMinimumLmrBalance
                  ? `✓ LMR balance sufficient (${lmrBalanceValidation.totalBalance.toString()} LMR)`
                  : `⚠ Insufficient LMR balance (${lmrBalanceValidation.totalBalance.toString()} LMR). Required: ${process.env.REACT_APP_FUTURES_REQUIRED_LMR} LMR (Arbitrum or Ethereum)`}
            </p>
          )}
        </BalanceContainer>
        {isSuccess && address && !hasMinimumLmrBalance && (
          <div className="link">
            <a href={process.env.REACT_APP_BUY_LMR_URL} target="_blank" rel="noreferrer">
              Buy LMR tokens on Uniswap <EastIcon style={{ fontSize: "0.75rem" }} />
            </a>
          </div>
        )}

        {shouldHighlight && (
          <MarginCallWarning>⚠️ Margin Call Warning: Add Funds to Avoid Liquidation</MarginCallWarning>
        )}
      </BalanceWidgetContainer>

      <ModalItem open={depositModal.isOpen} setOpen={depositModal.setOpen}>
        <DepositForm closeForm={handleDepositSuccess} />
      </ModalItem>

      <ModalItem open={withdrawalModal.isOpen} setOpen={withdrawalModal.setOpen}>
        <WithdrawalForm
          closeForm={handleWithdrawalSuccess}
          minMargin={minMargin}
          isLoadingMinMargin={isLoadingMinMargin}
        />
      </ModalItem>
    </>
  );
};

const BalanceContainer = styled("div")<{ $shouldHighlight: boolean }>`
  padding: ${(props) => (props.$shouldHighlight ? "1rem 0 0 0" : "1rem 0")};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 1rem;
`;

const BalanceRow = styled("div")`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 1rem;
  overflow: auto;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const BalanceDisplay = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const BalanceStats = styled("div")`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0.75rem 0;
  gap: 1.5rem;
  width: 100%;

  @media (max-width: 1340px) {
    gap: 0.5rem;
  }

  .balance {
    flex: 1;
    div {
      font-size: 1.85rem;
      line-height: 1.75rem;
      text-align: center;
      margin-bottom: 0.15rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 1.4rem;
      font-weight: 600;
    }
    p {
      font-size: 0.625rem;
      text-align: center;
      color: #a7a9b6;
    }
  }
`;

const TokenSymbol = styled("span")`
  font-size: 1.2rem;
  font-weight: 400;
  color: #a7a9b6;
  margin-left: 0.25rem;
`;

const ActionButtons = styled("div")`
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;
  
  button {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
    min-width: 80px;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    
    button {
      flex: 1;
      max-width: 120px;
    }
  }

  @media (max-width: 1530px) {
    flex-direction: column;

    button {
      width: 100%;
    }
  }
`;

const BalanceWidgetContainer = styled(SmallWidget)<{ $shouldHighlight: boolean }>`
  border: ${(props) => (props.$shouldHighlight ? "2px solid #fbbf24" : "rgba(171, 171, 171, 1) 1px solid")};
  background: ${(props) => (props.$shouldHighlight ? "radial-gradient(circle, rgba(0, 0, 0, 0) 36%, rgba(255, 255, 0, 0.05) 100%)" : "radial-gradient(circle, rgba(0, 0, 0, 0) 36%, rgba(255, 255, 255, 0.05) 100%)")};
  transition: border-color 0.3s ease;
`;

const MarginCallWarning = styled("div")`
  padding: 0.2rem;
  background-color: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 6px;
  color: #fbbf24;
  font-size: 0.875rem;
  font-weight: 600;
  text-align: center;
  width: 100%;
`;
