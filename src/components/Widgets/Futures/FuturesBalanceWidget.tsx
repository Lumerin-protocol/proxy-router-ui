import styled from "@mui/material/styles/styled";
import { useAccount } from "wagmi";
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

export const FuturesBalanceWidget = () => {
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

  // Check if LMR balance meets minimum requirement
  const requiredLmrAmount = BigInt(process.env.REACT_APP_FUTURES_REQUIRED_LMR || "10000");
  const hasMinimumLmrBalance = lmrBalanceValidation.totalBalance >= requiredLmrAmount;
  const isLmrBalanceLoading = lmrBalanceValidation.isLoading;

  return (
    <>
      <SmallWidget>
        <h3>Futures Balance</h3>
        <BalanceContainer>
          {!address && <div>Connect wallet to view balance</div>}
          {isLoading && <Spinner fontSize="0.3em" />}
          {isSuccess && address && (
            <BalanceRow>
              <BalanceDisplay>
                <BalanceAmount>
                  <UsdcIcon style={{ width: "25px", marginRight: "8px" }} />
                  {balanceValue?.valueRounded}
                  <TokenSymbol>{paymentToken.symbol}</TokenSymbol>
                </BalanceAmount>
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
          )}
        </BalanceContainer>
        <div className="link">
          <p onClick={(e) => e.preventDefault()}>
            {isLmrBalanceLoading
              ? "Checking LMR balance..."
              : hasMinimumLmrBalance
                ? `✓ LMR balance sufficient (${lmrBalanceValidation.totalBalance.toString()} LMR)`
                : `⚠ Insufficient LMR balance. Required: ${process.env.REACT_APP_FUTURES_REQUIRED_LMR} LMR (Arbitrum or Ethereum)`}
          </p>
        </div>
      </SmallWidget>

      <ModalItem open={depositModal.isOpen} setOpen={depositModal.setOpen}>
        <DepositForm closeForm={handleDepositSuccess} />
      </ModalItem>

      <ModalItem open={withdrawalModal.isOpen} setOpen={withdrawalModal.setOpen}>
        <WithdrawalForm closeForm={handleWithdrawalSuccess} />
      </ModalItem>
    </>
  );
};

const BalanceContainer = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  width: 100%;
  padding: 1rem 0;
  gap: 1rem;
`;

const BalanceRow = styled("div")`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 1rem;
  
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

const BalanceAmount = styled("div")`
  font-size: 2rem;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
`;

const TokenSymbol = styled("span")`
  font-size: 1.2rem;
  font-weight: 400;
  color: #a7a9b6;
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
`;
