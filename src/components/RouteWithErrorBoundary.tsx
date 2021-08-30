import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { Route, RouteProps } from 'react-router';
import { ErrorPage } from './ui/ErrorPage';

const ErrorFallback: React.ComponentType<FallbackProps> = ({ error, resetErrorBoundary }) => {
	return <ErrorPage error={error} />;
};

// add reset logic if needed
const onResetHandler: () => void = () => {};

// log to local filestore or localStorage if needed
const errorHandler: (error: Error, info: { componentStack: string }) => void = (error, info) => {};

export const RouteWithErrorBoundary: React.FC<RouteProps> = (props) => {
	return (
		<ErrorBoundary fallbackRender={ErrorFallback} onReset={onResetHandler} onError={errorHandler} key={props.location?.pathname}>
			<Route {...props} />
		</ErrorBoundary>
	);
};
RouteWithErrorBoundary.displayName = 'RouteWithErrorBoundary';
RouteWithErrorBoundary.whyDidYouRender = false;
