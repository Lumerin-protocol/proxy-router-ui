import type { lazy } from "react";
import { safeLazy as safeLazyBase } from "react-safe-lazy";

/** This is a type assertion to make the safeLazy function compatible with the lazy function from react. */
export const safeLazy = safeLazyBase as typeof lazy;
