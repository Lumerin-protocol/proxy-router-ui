import { useApproveERC20 } from "./useApproveERC20";
import { usePaymentTokenAddress } from "./usePaymentTokenBalance";

export function useApprovePayment() {
  const { data: paymentTokenAddress } = usePaymentTokenAddress();
  return useApproveERC20(paymentTokenAddress!);
}
