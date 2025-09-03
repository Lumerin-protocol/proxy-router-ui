import { hashMessage } from "viem";
import { recoverPublicKey } from "viem";
import { useSignMessage } from "wagmi";

const message = "Sign this message so we can obtain your Public Key";

export const useGetPublicKey = () => {
  const wc = useSignMessage();

  // const getPublicKeyAsync = useCallback(async () => {
  //   const signature = await wc.signMessageAsync({ message });
  //   const publicKey = await recoverPublicKey({ hash: hashMessage(message), signature });
  //   return publicKey;
  // }, [wc]);

  const getPublicKeyAsync = async () => {
    const signature = await wc.signMessageAsync({ message });
    const publicKey = await recoverPublicKey({ hash: hashMessage(message), signature });
    return publicKey;
  };

  return { getPublicKeyAsync };
};
