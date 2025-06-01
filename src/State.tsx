import type React from "react";
import { Router } from "./Router";

// Main contains the basic layout of pages and maintains contract state needed by its children
export const State: React.FC = () => {
  return <Router />;
};
