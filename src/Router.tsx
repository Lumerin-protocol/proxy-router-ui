import { type FC, Suspense, lazy } from "react";
import { Route, Routes } from "react-router";
import { Spinner } from "./components/Spinner.styled";
import { PathName } from "./types/types";
import { safeLazy } from "react-safe-lazy";

// biome-ignore lint/complexity/noBannedTypes: invalid typings for safeLazy
type Empty = {};

// Lazy loaded components
// SafeLazy is a wrapper around lazy that will reload the html page if the component fails to load
// the chunks, likely due to changed js asset filename
const BuyerHub = safeLazy<Empty>(() =>
  import("./pages/buyer-hub/BuyerHub").then((module) => ({ default: module.BuyerHub })),
);
const Landing = safeLazy<Empty>(() =>
  import("./pages/landing/Landing").then((module) => ({ default: module.Landing })),
);
const Marketplace = safeLazy<Empty>(() =>
  import("./pages/marketplace/Marketplace").then((module) => ({ default: module.Marketplace })),
);
const SellerHub = safeLazy<Empty>(() =>
  import("./pages/seller-hub/SellerHub").then((module) => ({ default: module.SellerHub })),
);
const ValidatorHub = safeLazy<Empty>(() =>
  import("./pages/validator-hub/ValidatorHub").then((module) => ({ default: module.ValidatorHub })),
);

export const Router: FC = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path={PathName.Landing} element={<Landing />} />
        <Route path={PathName.Marketplace} element={<Marketplace />} />
        <Route path={PathName.SellerHub} element={<SellerHub />} />
        <Route path={PathName.BuyerHub} element={<BuyerHub />} />
        <Route path={PathName.ValidatorHub} element={<ValidatorHub />} />
        {/* <Route path={"test"} element={<Test />} /> */}
      </Routes>
    </Suspense>
  );
};
