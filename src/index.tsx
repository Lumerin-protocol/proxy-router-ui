import "./wdyr";
import "./fonts.css";
import "./index.css";

import React from "react";
import { ErrorBoundary, type ErrorBoundaryPropsWithRender } from "react-error-boundary";
import { BrowserRouter } from "react-router";
import { App } from "./App";
import { ErrorPage } from "./components/ErrorPage";
import { createRoot } from "react-dom/client";

// error handling logic
// display <ErrorPage /> with error message
const ErrorFallback: ErrorBoundaryPropsWithRender["fallbackRender"] = ({ error }) => {
  return <ErrorPage error={error} />;
};

// add reset logic if needed
const onResetHandler: () => void = () => {};

// log to local filestore or localStorage if needed
const errorHandler: (error: Error, info: { componentStack: string }) => void = (error, info) => {};

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find the root element");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary fallbackRender={ErrorFallback} onReset={onResetHandler} onError={errorHandler}>
        <App />
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>,
);
