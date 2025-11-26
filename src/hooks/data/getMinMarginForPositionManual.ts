export function getMinMarginForPositionManual(
  entryPricePerDay: bigint,
  qty: number,
  marketPricePerDay: bigint,
  marginPercent: number,
  deliveryDurationDays: number,
) {
  const pnl = (marketPricePerDay - entryPricePerDay) * BigInt(deliveryDurationDays) * BigInt(qty);
  const maintenanceMargin =
    (entryPricePerDay * BigInt(deliveryDurationDays) * BigInt(Math.abs(qty)) * BigInt(marginPercent)) / 100n;
  const effectiveMargin = maintenanceMargin - pnl;

  return effectiveMargin;
}
