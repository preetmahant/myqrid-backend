const express = require("express");
const path = require("path");
const admin = require("firebase-admin");
const cors = require("cors");
const QRCode = require("qrcode");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public"), { index: false }));

/* -------------------------------
FIREBASE INIT
-------------------------------- */

const hasFirebaseConfig =
process.env.FIREBASE_PROJECT_ID &&
process.env.FIREBASE_CLIENT_EMAIL &&
process.env.FIREBASE_PRIVATE_KEY;

let db = null;
let firebaseInitError = null;

function normalizePrivateKey(privateKey) {
return String(privateKey || "")
.replace(/^"|"$/g, "")
.replace(/\n/g, "\n");
}

if (hasFirebaseConfig) {
try {
admin.initializeApp({
credential: admin.credential.cert({
projectId: process.env.FIREBASE_PROJECT_ID,
clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
privateKey: normalizePrivateKey(
process.env.FIREBASE_PRIVATE_KEY
)
})
});

```
db = admin.firestore();

console.log("Firebase connected");
```

} catch (err) {
firebaseInitError = err.message;

```
console.error(
  "Firebase init failed:",
  err.message
);

console.error(
  "Temporary memory fallback is active."
);
```

}
} else {
console.warn(
"Firebase credentials missing."
);
}

/* -------------------------------
MEMORY FALLBACK
-------------------------------- */

const memoryStore = {
profiles: new Map(),
tags: new Map(),
events: []
};

function storeMode() {
return db ? "firebase" : "memory_fallback";
}

function publicBaseUrl(req) {
return (
process.env.PUBLIC_BASE_URL ||
`${req.protocol}://${req.get("host")}`
);
}

function cleanText(value, fallback = "") {
return String(value || fallback)
.trim()
.slice(0, 500);
}

function cleanUsername(username) {
return String(username || "")
.trim()
.toLowerCase()
.replace(/^@/, "")
.replace(/[^a-z0-9_]/g, "");
}

function cleanUrl(value) {
const raw = cleanText(value);

if (!raw) {
return "";
}

if (/^https?:///i.test(raw)) {
return raw;
}

return `https://${raw}`;
}

function slugify(value, fallback = "myqrid") {
const slug = String(value || fallback)
.toLowerCase()
.trim()
.replace(/[^a-z0-9]+/g, "-")
.replace(/^-+|-+$/g, "")
.slice(0, 36);

return slug || fallback;
}

function normalizeEmail(email) {
return cleanText(email).toLowerCase();
}

function normalizePhone(phone) {
return cleanText(phone)
.replace(/[^+\d\s()-]/g, "")
.slice(0, 30);
}

function phoneDigits(phone) {
return String(phone || "")
.replace(/\D/g, "");
}

function isValidEmail(email) {
return (
!email ||
/^[^\s@]+@[^\s@]+.[^\s@]+$/.test(email)
);
}

function createDefaultAnalytics() {
return {
total_views: 0,
total_clicks: 0,
link_clicks: {},
created_from: "web_mvp",
last_seen: null
};
}

function normalizeAnalytics(analytics) {
const safe =
analytics && typeof analytics === "object"
? analytics
: {};

return {
...createDefaultAnalytics(),
...safe,
total_views: Number(
safe.total_views || 0
),
total_clicks: Number(
safe.total_clicks || 0
),
link_clicks:
safe.link_clicks &&
typeof safe.link_clicks === "object"
? safe.link_clicks
: {}
};
}

function buildVCard(profile) {
const phone = cleanText(profile.phone);

const whatsapp = cleanText(
profile.whatsapp || profile.phone
);

return [
"BEGIN:VCARD",
"VERSION:3.0",
`FN:${cleanText(
      profile.name ||
      profile.username ||
      "myQRID User"
    )}`,
phone
? `TEL;TYPE=CELL:${phone}`
: "",
profile.email
? `EMAIL:${cleanText(profile.email)}`
: "",
profile.profile_url
? `URL:${profile.profile_url}`
: "",
whatsapp
? `NOTE:WhatsApp ${whatsapp}`
: "",
"END:VCARD"
]
.filter(Boolean)
.join("\n");
}

/* -------------------------------
ROUTES
-------------------------------- */

function sendMvp(req, res) {
res.sendFile(
path.join(
__dirname,
"public",
"web-mvp.html"
)
);
}

app.get(
[
"/",
"/web-mvp",
"/admin",
"/u/:username",
"/t/:slug"
],
sendMvp
);

app.get("/health", (req, res) => {
res.json({
success: true,
firebase_configured: Boolean(db),
storage: storeMode(),
firebase_error: firebaseInitError,
message: db
? "Server running with Firebase"
: "Server running with memory fallback"
});
});

app.get("/api/status", (req, res) => {
res.json({
success: true,
firebase_configured: Boolean(db),
storage: storeMode(),
firebase_error: firebaseInitError
});
});

/* -------------------------------
QR API
-------------------------------- */

app.get("/api/qr", async (req, res) => {
try {
const data =
req.query.data ||
publicBaseUrl(req);

```
const png = await QRCode.toBuffer(data, {
  type: "png",
  width: 720,
  margin: 2,
  errorCorrectionLevel: "H"
});

res.setHeader(
  "Content-Type",
  "image/png"
);

return res.send(png);
```

} catch (err) {

```
return res.status(500).json({
  success: false,
  error: err.message
});
```

}
});

/* -------------------------------
SERVER START
-------------------------------- */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
console.log(
`myQRID MVP running on port ${PORT}`
);
});
