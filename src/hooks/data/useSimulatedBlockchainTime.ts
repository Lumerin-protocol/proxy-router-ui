import { useEffect, useRef } from "react";
import { useStopwatch } from "react-timer-hook";
import { useBlock } from "wagmi";

// This hook returns the current blockchain time in seconds and increments it every second
export function useSimulatedBlockchainTime(): bigint {
  const block = useBlock();
  const lastBlockTimestamp = useRef<bigint>(0n);
  const { totalSeconds, reset } = useStopwatch({ autoStart: true });

  // Reset stopwatch when new block arrives
  useEffect(() => {
    if (block.isSuccess && block.data.timestamp !== lastBlockTimestamp.current) {
      lastBlockTimestamp.current = block.data.timestamp;
      reset();
    }
  }, [block.data?.timestamp, reset]);

  const timestamp = block.isSuccess ? block.data.timestamp : lastBlockTimestamp.current;
  if (timestamp === 0n) {
    return BigInt(Math.floor(new Date().getTime() / 1000));
  }

  return timestamp + BigInt(totalSeconds);
}
