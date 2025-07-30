import { useFeeTokenAddress } from "./useFeeTokenBalance";
import { useApproveERC20 } from "./useApproveERC20";

export function useApproveStaking() {
  const { data: feeTokenAddress } = useFeeTokenAddress();
  return useApproveERC20(feeTokenAddress!);
}
