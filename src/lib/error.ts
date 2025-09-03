import {
  type Abi,
  BaseError,
  type ContractErrorName,
  ContractFunctionRevertedError,
  decodeErrorResult,
  type DecodeErrorResultReturnType,
  InvalidInputRpcError,
  UnknownRpcError,
} from "viem";

export function isErr<const TAbi extends Abi | readonly unknown[]>(
  err: any,
  abi: TAbi | undefined,
  error: DecodeErrorResultReturnType<TAbi>["errorName"],
): boolean {
  if (err instanceof BaseError) {
    const revertError = err.walk((err) => {
      return (
        err instanceof InvalidInputRpcError ||
        err instanceof ContractFunctionRevertedError ||
        err instanceof UnknownRpcError
      );
    });

    // support for regular provider
    if (revertError instanceof ContractFunctionRevertedError) {
      const errorName = revertError.data?.errorName ?? "";
      if (errorName === error) {
        return true;
      }
    }

    // support for hardhat node
    let data: `0x${string}` | undefined;
    if (revertError instanceof InvalidInputRpcError) {
      data = (revertError?.cause as any)?.data?.data;
    } else if (revertError instanceof UnknownRpcError) {
      data = (revertError.cause as any)?.data;
    }

    if (data) {
      try {
        const decodedError = decodeErrorResult({ abi, data });
        if (decodedError.errorName === error) {
          return true;
        }
      } catch (e) {
        console.error("Error decoding error", e);
        return false;
      }
    }
  }

  if (err) {
    console.error(err);
  }
  return false;
}

export function getErr<
  const TAbi extends Abi | readonly unknown[],
  allErrorNames extends ContractErrorName<TAbi> = ContractErrorName<TAbi>,
>(
  err: unknown,
  // abi: TAbi,
  errName: allErrorNames,
): DecodeErrorResultReturnType<TAbi, typeof errName> | undefined {
  if (err instanceof BaseError) {
    const revertError = err.walk((err) => {
      return err instanceof ContractFunctionRevertedError;
    });

    if (revertError instanceof ContractFunctionRevertedError) {
      const errorName = revertError.data?.errorName ?? "";
      if (errorName === errName) {
        return revertError.data;
      }
    }
  }

  return undefined;
}

export function isFunctionRevertedError(err: unknown): boolean {
  if (err instanceof BaseError) {
    const revertError = err.walk((err) => {
      return err instanceof ContractFunctionRevertedError;
    });

    if (revertError) {
      return true;
    }
  }
  return false;
}

export function errorToPOJO(error: any) {
  const ret = {} as Record<string, unknown>;
  for (const properyName of Object.getOwnPropertyNames(error)) {
    ret[properyName] = error[properyName];
  }
  return ret;
}
