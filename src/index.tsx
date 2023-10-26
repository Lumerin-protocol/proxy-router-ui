import './wdyr.ts';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Redirect } from 'react-router-dom';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { App } from './App';
import { ErrorPage } from './components/ui/ErrorPage';
import reportWebVitals from './reportWebVitals';
import './index.css';
import './fonts.css';

// error handling logic
// display <ErrorPage /> with error message
const ErrorFallback: React.ComponentType<FallbackProps> = ({ error, resetErrorBoundary }) => {
	return <ErrorPage error={error} />;
};

// add reset logic if needed
const onResetHandler: () => void = () => {};

// log to local filestore or localStorage if needed
const errorHandler: (error: Error, info: { componentStack: string }) => void = (error, info) => {};

ReactDOM.render(
	<React.StrictMode>
		<BrowserRouter>
			<ErrorBoundary
				fallbackRender={ErrorFallback}
				onReset={onResetHandler}
				onError={errorHandler}
			></ErrorBoundary>
		</BrowserRouter>
	</React.StrictMode>,
	document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
