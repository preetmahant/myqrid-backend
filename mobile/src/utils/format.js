export function formatINR(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}
