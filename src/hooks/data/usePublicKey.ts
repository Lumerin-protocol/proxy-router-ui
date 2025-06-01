import { useCallback } from "react";
import { hashMessage } from "viem";
import { recoverPublicKey } from "viem";
import { useAccount, useSignMessage, useWalletClient, useWriteContract } from "wagmi";

const message = "Sign this message so we can obtain your Public Key";

export const useGetPublicKey = () => {
  const wc = useSignMessage();

  const getPublicKeyAsync = useCallback(async () => {
    const signature = await wc.signMessageAsync({ message });
    const publicKey = await recoverPublicKey({ hash: hashMessage(message), signature });
    return publicKey;
  }, [wc]);

  return { getPublicKeyAsync };
};
