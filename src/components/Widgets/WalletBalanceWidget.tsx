import styled from "@emotion/styled";
import EastIcon from "@mui/icons-material/East";
import { formatUnits } from "viem";
import { useAccount, useBalance } from "wagmi";
import { useFeeTokenBalance } from "../../hooks/data/useFeeTokenBalance";
import { usePaymentTokenBalance } from "../../hooks/data/usePaymentTokenBalance";
import { useRates } from "../../hooks/data/useRates";
import { EtherIcon, LumerinIcon, UsdcIcon } from "../../images";
import { formatCurrency } from "../../web3/helpers";
import { SmallWidget } from "../Cards/Cards.styled";
import { Spinner } from "../Spinner.styled";
import { chain } from "../../config/chains";
import { ChainIcon } from "../../config/chains";

export const WalletBalanceWidget = () => {
  const { address } = useAccount();
  const paymentTokenBalance = usePaymentTokenBalance(address);
  const feeTokenBalance = useFeeTokenBalance(address);
  const ethBalance = useBalance({ address });
  const ratesQuery = useRates();

  const tokens = [
    {
      name: "USDC",
      balance: paymentTokenBalance.balance,
      rateUSD: 1,
      decimals: 6n,
      icon: <UsdcIcon style={{ width: "25px" }} />,
    },
    {
      name: "LMR",
      balance: feeTokenBalance.balance,
      rateUSD: ratesQuery.data?.LMR ?? 0,
      decimals: 8n,
      icon: <LumerinIcon />,
    },
    {
      name: "ETH",
      balance: ethBalance.data?.value,
      rateUSD: ratesQuery.data?.ETH ?? 0,
      decimals: 18n,
      icon: <EtherIcon style={{ width: "28px" }} />,
    },
  ];

  const isLoading = paymentTokenBalance.isLoading || feeTokenBalance.isLoading || ethBalance.isLoading;

  const isSuccess = !!(paymentTokenBalance.balance && feeTokenBalance.balance && ethBalance.data && address);

  return (
    <SmallWidget>
      <h3>
        <ChainIcon style={{ width: "15px", display: "inline", marginTop: "-3px" }} /> Wallet Balance ({chain.name})
      </h3>
      <Balances>
        {!address && <div>Connect your wallet to view your balance</div>}
        {isLoading && <Spinner fontSize="0.3em" />}
        {isSuccess &&
          address &&
          tokens.map((token) => {
            const balanceFloat = Number.parseFloat(formatUnits(token.balance || 0n, Number(token.decimals)));
            const rateUSD = token.rateUSD * balanceFloat;
            return (
              <TokenContainer key={token.name}>
                <TokenBalanceWrapper>
                  {token.icon}
                  <BalanceText>
                    {formatCurrency({
                      value: balanceFloat,
                      maxSignificantFractionDigits: 4,
                      currency: undefined,
                    })}
                    <TokenSymbol>{token.name}</TokenSymbol>
                  </BalanceText>
                </TokenBalanceWrapper>
                <RateWrapper>
                  {token.rateUSD && (
                    <Rate>
                      ≈ $
                      {formatCurrency({
                        value: rateUSD,
                        maxSignificantFractionDigits: 2,
                        currency: undefined,
                      })}
                    </Rate>
                  )}
                </RateWrapper>
              </TokenContainer>
            );
          })}
      </Balances>
      <div className="link">
        <a href={process.env.REACT_APP_BUY_LMR_URL} target="_blank" rel="noreferrer">
          Buy LMR tokens on Uniswap <EastIcon style={{ fontSize: "0.75rem" }} />
        </a>
      </div>
    </SmallWidget>
  );
};

const TokenContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const TokenBalanceWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BalanceText = styled.span`
  font-size: 1.1rem;
  margin-left: 0.65rem;
  color: #fff;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-left: 0.65rem;
    color: #fff;
  }
`;

const TokenSymbol = styled.span`
  font-size: 0.8em;
  line-height: 1.75rem;
  margin-left: 0.3rem;

  @media (max-width: 768px) {
    font-size: 0.8rem;
    line-height: 1.75rem;
  }
`;

const RateWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Balances = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  flex: 1;
  width: 100%;
  flex-direction: column;

  @media (min-width: 1024px) {
    flex-direction: row;
  }
`;

const Rate = styled.p`
  font-size: 0.8rem;
  text-align: center;
  color: rgb(155, 155, 155);
`;
