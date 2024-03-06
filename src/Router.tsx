import React, { Suspense } from 'react';
import { Switch, Route, RouteComponentProps } from 'react-router';
import { Marketplace } from './pages/Marketplace';
import { MyOrders } from './pages/MyOrders';
import { HashRentalContract, PathName } from './types';
import { Spinner } from './components/ui/Spinner.styled';
import { MyContracts } from './pages/MyContracts';
import { EthereumGateway } from './gateway/ethereum';

interface RouterProps {
	web3Gateway?: EthereumGateway;
	userAccount: string;
	contracts: HashRentalContract[];
	refreshContracts: () => void;
	isMobile: boolean;
	lumerinBalance: number | null;
}

// Router component contains the routes for the application
export const Router: React.FC<RouterProps> = (p) => {
	return (
		<Suspense fallback={<Spinner />}>
			<Switch>
				<Route
					path={PathName.Marketplace}
					render={(props: RouteComponentProps) => (
						<Marketplace
							{...props}
							lumerinBalance={p.lumerinBalance}
							userAccount={p.userAccount}
							contracts={p.contracts}
							isMobile={p.isMobile}
							refreshContracts={p.refreshContracts}
						/>
					)}
				/>
				<Route
					path={PathName.MyOrders}
					exact
					render={(props: RouteComponentProps) => (
						<MyOrders
							{...props}
							web3Gateway={p.web3Gateway}
							userAccount={p.userAccount}
							contracts={p.contracts}
							refreshContracts={p.refreshContracts}
							isMobile={p.isMobile}
						/>
					)}
				/>
				<Route
					path={PathName.MyContracts}
					render={(props: RouteComponentProps) => (
						<MyContracts
							{...props}
							web3Gateway={p.web3Gateway}
							userAccount={p.userAccount}
							contracts={p.contracts}
							setSidebarOpen={() => {}}
						/>
					)}
				/>
			</Switch>
		</Suspense>
	);
};
