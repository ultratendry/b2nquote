// app/utils/pricing.js
export function getBulkDiscountForQty(qty) {
  if (!(Number.isInteger(qty) && qty >= 0)) return 0; // guard [0+] [10]
  if (qty >= 100) return 12;                           // 100+ → 12% [10]
  if (qty >= 75)  return 9;                            // 75–99 → 9% [10]
  if (qty >= 50)  return 6;                            // 50–74 → 6% [10]
  if (qty >= 30)  return 4;                            // 30–49 → 4% [10]
  if (qty >= 10)  return 2;                            // 10–29 → 2% [10]
  return 0;                                            // 0–9 → 0% [10]
}

export function safeParseNumber(s) {
  if (typeof s !== "string") return undefined;         // guard [10]
  const cleaned = s.replace(/[^0-9.]/g, "");           // strip symbols/commas [17]
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : undefined;           // robust parse [10]
}
