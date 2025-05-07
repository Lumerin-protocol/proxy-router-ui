import styled from "@emotion/styled";
import EastIcon from "@mui/icons-material/East";
import { formatUnits } from "viem";
import { useAccount, useBalance } from "wagmi";
import { Rates } from "../../gateway/rates/interfaces";
import { useFeeTokenBalance } from "../../hooks/data/useFeeTokenBalance";
import { usePaymentTokenBalance } from "../../hooks/data/usePaymentTokenBalance";
import { useRates } from "../../hooks/data/useRates";
import { ArbitrumLogo, EtherIcon, LumerinIcon, UsdcIcon } from "../../images";
import { formatCurrency } from "../../web3/helpers";
import { MobileWidget, SmallWidget } from "../Cards/Cards.styled";
import { Spinner } from "../Spinner.styled";

type WalletBalanceWidgetProps = {
  tokens: {
    name: string;
    balance: bigint;
    rateUSD: number;
    icon: React.ReactNode;
  }[];
};

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

  return (
    <WalletBalanceWrapper>
      <h3>
        <ArbitrumLogo style={{ width: "15px", display: "inline", marginTop: "-3px" }} /> Wallet Balance (Arbitrum)
      </h3>
      <div className="flex items-center justify-evenly flex-1 balance-wrapper w-100 flex-col lg:flex-row ">
        {!address && <div>Connect your wallet to view your balance</div>}
        {isLoading && <Spinner />}
        {!isLoading &&
          address &&
          tokens.map((token) => (
            <div className="flex items-center justify-center flex-col" key={token.name}>
              <div className="flex items-center justify-center">
                {token.icon}
                <span className="balance">
                  {formatCurrency({
                    value: Number(formatUnits(token.balance || 0n, Number(token.decimals))),
                    maxSignificantFractionDigits: 4,
                    currency: undefined,
                  })}
                  <span className="symbol">{token.name}</span>
                </span>
              </div>
              <div className="items-center justify-center hidden">
                {token.rateUSD && <Rate>≈ ${(token.rateUSD * Number(token.balance)).toFixed(2)}</Rate>}
              </div>
            </div>
          ))}
      </div>
      <div className="link">
        <a href={process.env.REACT_APP_BUY_LMR_URL} target="_blank" rel="noreferrer">
          Buy LMR tokens on Uniswap <EastIcon style={{ fontSize: "0.75rem" }} />
        </a>
      </div>
    </WalletBalanceWrapper>
  );
};

const WalletBalanceWrapper = styled(SmallWidget)`
	.balance-wrapper {
		width: 100%;
		display: flex;
		justify-content: space-evenly;
		align-items: center;

		.balance {
			font-size: 1.5rem;
			margin-left: 0.65rem;
			color: #fff;

			.symbol {
				font-size: 1.125rem;
				line-height: 1.75rem;
				margin-left: 0.3rem;
			}
		}

		@media (max-width: 768px) {
			flex-direction: column;
			flex: 40%;
			h3 {
				color: #696969;
				font-size: 10px;
			}
			p {
				font-size: 16px;
				color: #fff;
				font-weight: 500;
			}
			.balance {
				font-size: 1rem;
				margin-left: 0.65rem;
				color: #fff;

				.symbol {
					font-size: 0.8rem;
					line-height: 1.75rem;
				}
			}
		}
	}
`;

const Rate = styled.p`
	font-size: 0.625rem;
	text-align: center;
	color: #a7a9b6;
`;
