import { type FC, Suspense, lazy } from "react";
import { Route, Routes } from "react-router";
import { Spinner } from "./components/Spinner.styled";
import { PathName } from "./types/types";
// import { Test } from "./pages/test/test";

// Lazy loaded components
const BuyerHub = lazy(() => import("./pages/buyer-hub/BuyerHub").then((module) => ({ default: module.BuyerHub })));
const Landing = lazy(() => import("./pages/landing/Landing").then((module) => ({ default: module.Landing })));
const Marketplace = lazy(() =>
  import("./pages/marketplace/Marketplace").then((module) => ({ default: module.Marketplace })),
);
const SellerHub = lazy(() => import("./pages/seller-hub/SellerHub").then((module) => ({ default: module.SellerHub })));
const ValidatorHub = lazy(() =>
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
