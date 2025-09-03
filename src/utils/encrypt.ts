import { encrypt } from "ecies-geth/dist/lib/src/typescript/browser";

// Buffer polyfill for encrypt library
import { Buffer } from "buffer/";

declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
}

window.Buffer = Buffer;

//encrypts a string passed into it
export const encryptMessage = async (pubKey: string, msg: string) => {
  // Remove 0x prefix and ensure 04 prefix is present
  let key = pubKey.startsWith("0x") ? pubKey.slice(2) : pubKey;
  key = key.startsWith("04") ? key.slice(2) : key;
  const normalizedKey = `04${key}`;
  //@ts-ignore
  return await encrypt(Buffer.from(normalizedKey, "hex"), Buffer.from(msg));
};
