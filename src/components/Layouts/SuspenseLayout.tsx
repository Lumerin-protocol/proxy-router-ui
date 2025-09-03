import { type PropsWithChildren, Suspense, type FC } from "react";
import { DefaultLayout } from "./DefaultLayout";
import { Spinner } from "../Spinner.styled";
import { safeLazy } from "react-safe-lazy";

const Web3ProviderLazy = safeLazy(() =>
  //@ts-ignore
  import("../../Web3Provider").then((module) => ({ default: module.Web3Provider })),
);

export const SuspenseLayout: FC<PropsWithChildren<{ pageTitle: string }>> = (props) => {
  return (
    <DefaultLayout pageTitle={props.pageTitle}>
      <Suspense fallback={<Spinner />}>
        <Web3ProviderLazy>{props.children}</Web3ProviderLazy>
      </Suspense>
    </DefaultLayout>
  );
};
