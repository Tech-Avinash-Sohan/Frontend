const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const inr2 = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 });

/** 245000 -> "₹2,45,000" */
export const formatCurrency = (n, decimals = false) => (n === null || n === undefined || n === "" ? "—" : (decimals ? inr2 : inr).format(Number(n)));

/** 245000 -> "₹2.45 L" for stat cards */
export function formatCompact(n) {
  const v = Number(n || 0);
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)} Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(2)} L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)} K`;
  return formatCurrency(v);
}

/** Rupees in words for receipts: 12500 -> "Twelve thousand five hundred rupees only" */
export function amountInWords(n) {
  const a = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const b = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  const two = (x) => (x < 20 ? a[x] : `${b[Math.floor(x / 10)]}${x % 10 ? ` ${a[x % 10]}` : ""}`);
  const three = (x) => `${x >= 100 ? `${a[Math.floor(x / 100)]} hundred${x % 100 ? " " : ""}` : ""}${x % 100 ? two(x % 100) : ""}`;
  let v = Math.floor(Number(n || 0));
  if (v === 0) return "Zero rupees only";
  const parts = [];
  const crore = Math.floor(v / 10000000); v %= 10000000;
  const lakh = Math.floor(v / 100000); v %= 100000;
  const thousand = Math.floor(v / 1000); v %= 1000;
  if (crore) parts.push(`${two(crore)} crore`);
  if (lakh) parts.push(`${two(lakh)} lakh`);
  if (thousand) parts.push(`${two(thousand)} thousand`);
  if (v) parts.push(three(v));
  const s = parts.join(" ");
  return `${s.charAt(0).toUpperCase()}${s.slice(1)} rupees only`;
}
