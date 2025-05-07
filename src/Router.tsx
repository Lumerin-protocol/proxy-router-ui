/* eslint-disable react-hooks/exhaustive-deps */
import type React from "react";
import { Suspense } from "react";
import { Route, Routes } from "react-router";
import { Spinner } from "./components/Spinner.styled";
import type { EthereumGateway } from "./gateway/ethereum";
import { BuyerHub } from "./pages/buyer-hub/BuyerHub";
import { Landing } from "./pages/landing/Landing";
import { Marketplace } from "./pages/marketplace/Marketplace";
import { PathName } from "./types/types";

type Props = {
  web3Gateway: EthereumGateway;
};

export const Router: React.FC<Props> = ({ web3Gateway }) => {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path={PathName.Landing} element={<Landing />} />
        <Route path={PathName.BuyerHub} element={<BuyerHub web3Gateway={web3Gateway} />} />
        <Route path={PathName.Marketplace} element={<Marketplace web3Gateway={web3Gateway} />} />
      </Routes>
    </Suspense>
  );
};
