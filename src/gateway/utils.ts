import { fromHex, fromBytes } from "viem";
import { secp256k1 } from "@noble/curves/secp256k1";
import { hexToBytes, bytesToHex } from "@noble/curves/abstract/utils";

export function decompressPublicKey(yParity: boolean, x: `0x${string}`): `0x${string}` {
  const xBytes = fromHex(x, "bytes");

  const rec = new Uint8Array(33);
  rec.set(hexToBytes(yParity ? "03" : "02"));
  rec.set(xBytes, 1);

  const decompressed = secp256k1.ProjectivePoint.fromHex(bytesToHex(rec));

  return fromBytes(decompressed.toRawBytes(false), "hex");
}
