import { Suspense, type FC } from "react";
import { Route, Routes } from "react-router";
import { PathName } from "./types/types";
import { safeLazy } from "./utils/safeLazy";
import { Test } from "./pages/test/test";

const Landing = safeLazy(() => import("./pages/landing/Landing").then((module) => ({ default: module.Landing })));
const Marketplace = safeLazy(() =>
  import("./pages/marketplace/Marketplace").then((module) => ({ default: module.Marketplace })),
);
const SuspenseLayoutLazy = safeLazy(() =>
  import("./components/Layouts/SuspenseLayout").then((module) => ({
    default: module.SuspenseLayout,
  })),
);

const BuyerHub = safeLazy(() => import("./pages/buyer-hub/BuyerHub").then((module) => ({ default: module.BuyerHub })));

const SellerHub = safeLazy(() =>
  import("./pages/seller-hub/SellerHub").then((module) => ({ default: module.SellerHub })),
);
const ValidatorHub = safeLazy(() =>
  import("./pages/validator-hub/ValidatorHub").then((module) => ({ default: module.ValidatorHub })),
);
const Futures = safeLazy(() => import("./pages/futures/Futures").then((module) => ({ default: module.Futures })));

export const Router: FC = () => {
  return (
    <Suspense>
      <Routes>
        <Route path={PathName.Landing} element={<Landing />} />
        <Route
          path={PathName.Marketplace}
          element={
            <SuspenseLayoutLazy pageTitle="Marketplace">
              <Marketplace />
            </SuspenseLayoutLazy>
          }
        />

        <Route
          path={PathName.SellerHub}
          element={
            <SuspenseLayoutLazy pageTitle="Seller Hub">
              <SellerHub />
            </SuspenseLayoutLazy>
          }
        />
        <Route
          path={PathName.BuyerHub}
          element={
            <SuspenseLayoutLazy pageTitle="Buyer Hub">
              <BuyerHub />
            </SuspenseLayoutLazy>
          }
        />
        <Route
          path={PathName.ValidatorHub}
          element={
            <SuspenseLayoutLazy pageTitle="Validator Hub">
              <ValidatorHub />
            </SuspenseLayoutLazy>
          }
        />
        <Route
          path={PathName.Futures}
          element={
            <SuspenseLayoutLazy pageTitle="Futures">
              <Futures />
            </SuspenseLayoutLazy>
          }
        />
        <Route
          path={"/test"}
          element={
            <SuspenseLayoutLazy pageTitle="Futures">
              <Test />
            </SuspenseLayoutLazy>
          }
        />
      </Routes>
    </Suspense>
  );
};
