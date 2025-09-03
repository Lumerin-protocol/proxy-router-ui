import styled from "@mui/material/styles/styled";
import EastIcon from "@mui/icons-material/East";
import { useAccount } from "wagmi";
import { useFeeTokenBalance } from "../../hooks/data/useFeeTokenBalance";
import { usePaymentTokenBalance } from "../../hooks/data/usePaymentTokenBalance";
import { useRates } from "../../hooks/data/useRates";
import { EtherIcon, LumerinIcon, UsdcIcon } from "../../images";
import { SmallWidget } from "../Cards/Cards.styled";
import { Spinner } from "../Spinner.styled";
import { chain } from "../../config/chains";
import { ChainIcon } from "../../config/chains";
import { useEthBalance } from "../../hooks/data/useEthBalance";
import { feeToken, formatCurrency, formatValue, gasToken, paymentToken } from "../../lib/units";

export const WalletBalanceWidget = () => {
  const { address } = useAccount();
  const paymentTokenBalance = usePaymentTokenBalance(address);
  const feeTokenBalance = useFeeTokenBalance(address);
  const ethBalance = useEthBalance({ address });
  const ratesQuery = useRates();

  const tokens = [
    {
      name: paymentToken.name,
      symbol: paymentToken.symbol,
      balance: paymentTokenBalance.data,
      rateUSD: 1,
      decimals: paymentToken.decimals,
      icon: <UsdcIcon style={{ width: "25px" }} />,
    },
    {
      name: feeToken.name,
      symbol: feeToken.symbol,
      balance: feeTokenBalance.data,
      rateUSD: ratesQuery.data?.LMR ?? 0,
      decimals: feeToken.decimals,
      icon: <LumerinIcon />,
    },
    {
      name: gasToken.name,
      symbol: gasToken.symbol,
      balance: ethBalance.data?.value,
      rateUSD: ratesQuery.data?.ETH ?? 0,
      decimals: gasToken.decimals,
      icon: <EtherIcon style={{ width: "28px" }} />,
    },
  ];

  const isLoading = paymentTokenBalance.isLoading || feeTokenBalance.isLoading || ethBalance.isLoading;

  const isSuccess = !!(paymentTokenBalance.isSuccess && feeTokenBalance.isSuccess && ethBalance.isSuccess && address);

  return (
    <SmallWidget>
      <h3>
        <ChainIcon style={{ width: "15px", display: "inline", marginTop: "-3px" }} /> Wallet Balance ({chain.name})
      </h3>
      <Balances>
        {!address && <div>Connect wallet to purchase hashrate</div>}
        {isLoading && <Spinner fontSize="0.3em" />}
        {isSuccess &&
          address &&
          tokens.map((token) => {
            const balanceValue = formatValue(token.balance || 0n, token);
            const rateUSD = token.rateUSD * Number(balanceValue.value);
            return (
              <TokenContainer key={token.symbol}>
                <TokenBalanceWrapper>
                  {token.icon}
                  <BalanceText>
                    {balanceValue.valueRounded}
                    <TokenSymbol>{token.symbol}</TokenSymbol>
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

const TokenContainer = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  @media (max-width: 1024px) {
    flex-direction: row;
    gap: 0rem 0.5rem;
  }
`;

const TokenBalanceWrapper = styled("div")`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BalanceText = styled("span")`
  font-size: 1.1rem;
  margin-left: 0.3rem;
  color: #fff;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-left: 0.65rem;
    color: #fff;
  }
`;

const TokenSymbol = styled("span")`
  font-size: 0.8em;
  line-height: 1.75rem;
  margin-left: 0.3rem;

  @media (max-width: 768px) {
    font-size: 0.8rem;
    line-height: 1.75rem;
  }
`;

const RateWrapper = styled("div")`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Balances = styled("div")`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  flex: 1;
  width: 100%;
  flex-direction: column;
  padding: 0.4rem 0;
  gap: 0.6rem;

  @media (min-width: 1024px) {
    flex-direction: row;
  }
`;

const Rate = styled("p")`
  font-size: 0.8rem;
  text-align: center;
  color: rgb(155, 155, 155);
`;
