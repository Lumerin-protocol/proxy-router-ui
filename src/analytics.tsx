import ReactGA from "react-ga4";

export const purchasedHashrate = (totalHashrate: number) =>
  ReactGA.event("purchase_hashrate", {
    category: "Hashrate",
    action: "Purchase",
    value: totalHashrate,
  });
