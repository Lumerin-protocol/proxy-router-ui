import './wdyr.ts';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { App } from './App';
import { ErrorPage } from './components/ui/ErrorPage';
import reportWebVitals from './reportWebVitals';
import './index.css';
import './fonts.css';

const root = document.getElementById('root');
if (!root) {
	throw new Error('No root element found');
}

createRoot(root).render(
	<React.StrictMode>
		<BrowserRouter>
			<ErrorBoundary fallbackRender={ErrorPage}>
				<App />
			</ErrorBoundary>
		</BrowserRouter>
	</React.StrictMode>
);

reportWebVitals();
