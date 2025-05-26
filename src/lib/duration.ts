import prettyMs, { type Options } from "pretty-ms";

export function formatDuration(seconds: bigint, opts?: Options): string {
  if (seconds === 0n) {
    return `0 ${opts?.verbose ? "seconds" : "s"}`;
  }
  const verbose = opts?.verbose || true;
  const compact = opts?.compact || false;
  return prettyMs(Number(seconds) * 1000, { ...opts, compact, verbose });
}
