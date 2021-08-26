import React, { Suspense } from 'react';
import { Spinner } from './components/ui/Spinner';
import { RouteComponentProps, Switch } from 'react-router-dom';
import { Main } from './components/Main';
import { RouteWithErrorBoundary } from './components/RouteWithErrorBoundary';

export enum PageName {
	Marketplace = 'MARKETPLACE',
	MyOrders = 'MY_ORDERS',
}

const routes = (
	<Suspense fallback={<Spinner />}>
		<Switch>
			<RouteWithErrorBoundary path='/' render={(props: RouteComponentProps) => <Main {...props} pageName={PageName.Marketplace} />} />
		</Switch>
	</Suspense>
);

export const App: React.FC = () => {
	return routes;
};

App.displayName = 'App';
(App as any).whyDidYouRender = false;
