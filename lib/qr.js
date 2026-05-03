const QRCode = require("qrcode");

const DEFAULT_OPTIONS = {
  errorCorrectionLevel: "H",
  margin: 2,
  width: 320,
  color: { dark: "#000000", light: "#ffffff" },
};

async function generateQrDataUrl(text, options = {}) {
  return QRCode.toDataURL(text, { ...DEFAULT_OPTIONS, ...options });
}

async function generateQrBuffer(text, options = {}) {
  return QRCode.toBuffer(text, { ...DEFAULT_OPTIONS, ...options });
}

module.exports = { generateQrDataUrl, generateQrBuffer };
