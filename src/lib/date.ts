export function formatDate(epochSeconds: bigint | number): string {
  return new Date(Number(epochSeconds) * 1000).toLocaleString("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(epochSeconds: bigint | number): string {
  return new Date(Number(epochSeconds) * 1000).toLocaleString("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
