/** Stock pieces received: invoice qty × pieces per pack (use 1 for PCS invoices). */
export function stockQty(qty, qtyPerPack) {
  const q = Number(qty) || 0;
  const per = Number(qtyPerPack) || 1;
  return q * (per > 0 ? per : 1);
}

/** Line cost = stock pieces × unit price × (1 − discount%). */
export function lineSubtotal(qty, qtyPerPack, unitPrice, discountPct = 0) {
  const pieces = stockQty(qty, qtyPerPack);
  const price = Number(unitPrice) || 0;
  const disc = Math.min(100, Math.max(0, Number(discountPct) || 0));
  return pieces * price * (1 - disc / 100);
}

export function invoiceTotal(lines) {
  if (!Array.isArray(lines)) return 0;
  return lines.reduce(
    (sum, l) =>
      sum +
      lineSubtotal(
        l.qty,
        l.qtyPerPcs ?? l.qty_per_pack ?? 1,
        l.costPrice ?? l.unit_cost,
        l.discountPct ?? l.discount_pct ?? 0
      ),
    0
  );
}