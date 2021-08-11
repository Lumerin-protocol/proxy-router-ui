import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { Route, RouteProps } from 'react-router';
import { ErrorPage } from './ui/ErrorPage';
import ReactGA from '../reactGA';

const ErrorFallback: React.ComponentType<FallbackProps> = ({ error, resetErrorBoundary }) => {
	return <ErrorPage error={error} />;
};

// add reset logic if needed
const onResetHandler: () => void = () => {};

const errorHandler: (error: Error, info: { componentStack: string }) => void = (error, info) => {
	ReactGA.exception({
		description: `Error message: ${error.message}`,
		fatal: true,
	});
};

export const RouteWithErrorBoundary: React.FC<RouteProps> = (props) => {
	return (
		<ErrorBoundary fallbackRender={ErrorFallback} onReset={() => {}} onError={errorHandler} key={props.location?.pathname}>
			<Route {...props} />
		</ErrorBoundary>
	);
};
RouteWithErrorBoundary.displayName = 'RouteWithErrorBoundary';
(RouteWithErrorBoundary as any).whyDidYouRender = false;
