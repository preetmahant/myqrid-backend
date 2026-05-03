const DEFAULT_MESSAGE = "Hi, connecting via your myQRID profile.";

function normalizePhone(phone) {
  return String(phone || "").replace(/[^\d]/g, "");
}

function buildWhatsAppLink(phone, message = DEFAULT_MESSAGE) {
  const digits = normalizePhone(phone);
  if (!digits) return "";
  const text = encodeURIComponent(message);
  return `https://wa.me/${digits}?text=${text}`;
}

module.exports = { buildWhatsAppLink, normalizePhone };
