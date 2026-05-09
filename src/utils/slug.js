function cleanSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function serialCode(prefix, number, width = 6) {
  return `${prefix}-${String(number).padStart(width, "0")}`;
}

module.exports = { cleanSlug, serialCode };
