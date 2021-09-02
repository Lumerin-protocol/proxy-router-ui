import React from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { Main } from './components/Main';
import { ErrorPage } from './components/ui/ErrorPage';

// error handling logic
// display <ErrorPage /> with error message
const ErrorFallback: React.ComponentType<FallbackProps> = ({ error, resetErrorBoundary }) => {
	return <ErrorPage error={error} />;
};

// add reset logic if needed
const onResetHandler: () => void = () => {};

// log to local filestore or localStorage if needed
const errorHandler: (error: Error, info: { componentStack: string }) => void = (error, info) => {};

export const App: React.FC = () => (
	<ErrorBoundary fallbackRender={ErrorFallback} onReset={onResetHandler} onError={errorHandler}>
		<Main />
	</ErrorBoundary>
);
App.displayName = 'App';
(App as any).whyDidYouRender = false;
