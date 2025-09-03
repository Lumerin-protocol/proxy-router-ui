import { fromHex, fromBytes } from "viem";
import { secp256k1 } from "@noble/curves/secp256k1";
import { hexToBytes } from "@noble/curves/abstract/utils";

export function compressPublicKey(pubKey: `0x${string}`) {
  const pubKeyBytes = fromHex(pubKey, "bytes");
  const point = secp256k1.ProjectivePoint.fromHex(pubKeyBytes);
  const compressed = point.toRawBytes(true);

  return {
    yParity: compressed[0] === hexToBytes("03")[0], // 02 - even - false - 0, 03 - odd - true - 1
    x: fromBytes(compressed.slice(1), "hex"),
  };
}
