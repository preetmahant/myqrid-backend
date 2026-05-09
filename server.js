const express = require("express");
const path = require("path");
const admin = require("firebase-admin");
const cors = require("cors");
const QRCode = require("qrcode");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public"), { index: false }));

const hasFirebaseConfig =
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY;

let db = null;
let firebaseInitError = null;

function normalizePrivateKey(privateKey) {
  return String(privateKey || "")
    .replace(/^"|"$/g, "")
    .replace(/\\n/g, "\n");
}

if (hasFirebaseConfig) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY)
      })
    });
    db = admin.firestore();
    console.log("Firebase connected");
  } catch (err) {
    firebaseInitError = err.message;
    console.error("Firebase init failed:", err.message);
    console.error("Temporary in-memory fallback is active. Fix Firebase env vars on Render for production persistence.");
  }
} else {
  console.warn("Firebase credentials missing. Temporary in-memory fallback is active for local UI testing.");
}

const memoryStore = {
  profiles: new Map(),
  tags: new Map(),
  events: []
};

function storeMode() {
  return db ? "firebase" : "memory_fallback";
}

function publicBaseUrl(req) {
  return process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;
}

function cleanText(value, fallback = "") {
  return String(value || fallback).trim().slice(0, 500);
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
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
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
  return cleanText(phone).replace(/[^+\d\s()-]/g, "").slice(0, 30);
}

function phoneDigits(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function isValidEmail(email) {
  return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
  const safe = analytics && typeof analytics === "object" ? analytics : {};
  return {
    ...createDefaultAnalytics(),
    ...safe,
    total_views: Number(safe.total_views || 0),
    total_clicks: Number(safe.total_clicks || 0),
    link_clicks: safe.link_clicks && typeof safe.link_clicks === "object" ? safe.link_clicks : {}
  };
}

function buildVCard(profile) {
  const phone = cleanText(profile.phone);
  const whatsapp = cleanText(profile.whatsapp || profile.phone);
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${cleanText(profile.name || profile.username || "myQRID User")}`,
    phone ? `TEL;TYPE=CELL:${phone}` : "",
    profile.email ? `EMAIL:${cleanText(profile.email)}` : "",
    profile.profile_url ? `URL:${profile.profile_url}` : "",
    whatsapp ? `NOTE:WhatsApp ${whatsapp} | myQRID ${profile.profile_url || ""}` : "",
    "END:VCARD"
  ].filter(Boolean).join("\n");
}

function validateProfileInput(body) {
  const name = cleanText(body.name || body.display_name);
  const phone = normalizePhone(body.phone);
  const whatsapp = normalizePhone(body.whatsapp || body.phone);
  const email = normalizeEmail(body.email);
  const bio = cleanText(body.bio, "Welcome to my myQRID profile.");
  const imageUrl = cleanUrl(body.image_url || body.avatar || body.profile_image_url);

  if (name.length < 2) return { error: "Name must be at least 2 characters." };
  if (!phoneDigits(phone)) return { error: "Phone is required." };
  if (!phoneDigits(whatsapp)) return { error: "WhatsApp number is required." };
  if (!isValidEmail(email)) return { error: "Enter a valid email address." };
  if (imageUrl && !/^https?:\/\//i.test(imageUrl)) return { error: "Profile image URL must start with http:// or https://." };

  return { value: { name, phone, whatsapp, email, bio, image_url: imageUrl } };
}

async function profileExists(username) {
  if (db) {
    const doc = await db.collection("profiles").doc(username).get();
    return doc.exists;
  }
  return memoryStore.profiles.has(username);
}

async function uniqueUsername(name) {
  const base = slugify(name, "user").replace(/-/g, "").slice(0, 24) || "user";
  for (let index = 0; index < 50; index += 1) {
    const username = index === 0 ? base : `${base}${index + 1}`;
    if (!(await profileExists(username))) return username;
  }
  return `${base}${Date.now().toString(36).slice(-5)}`;
}

async function saveProfile(profile) {
  const tag = {
    slug: profile.tag_slug,
    username: profile.username,
    profile_url: profile.profile_url,
    tag_url: profile.tag_url,
    status: "active",
    updated_at: profile.updated_at
  };

  if (db) {
    await db.collection("profiles").doc(profile.username).set(profile, { merge: true });
    await db.collection("tags").doc(profile.tag_slug).set(tag, { merge: true });
    return;
  }

  memoryStore.profiles.set(profile.username, profile);
  memoryStore.tags.set(profile.tag_slug, tag);
}

async function getProfile(username) {
  const clean = cleanUsername(username);
  if (db) {
    const doc = await db.collection("profiles").doc(clean).get();
    return doc.exists ? doc.data() : null;
  }
  return memoryStore.profiles.get(clean) || null;
}

async function getTag(slug) {
  const clean = slugify(slug).toLowerCase();
  if (db) {
    const doc = await db.collection("tags").doc(clean).get();
    return doc.exists ? doc.data() : null;
  }
  return memoryStore.tags.get(clean) || null;
}

async function updateProfile(username, patch) {
  if (db) {
    await db.collection("profiles").doc(username).set(patch, { merge: true });
    return;
  }

  const existing = memoryStore.profiles.get(username);
  if (existing) memoryStore.profiles.set(username, { ...existing, ...patch });
}

async function listProfiles() {
  if (db) {
    const snapshot = await db.collection("profiles").orderBy("created_at", "desc").limit(200).get();
    return snapshot.docs.map(doc => doc.data());
  }

  return Array.from(memoryStore.profiles.values()).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}

async function deleteProfile(username) {
  const profile = await getProfile(username);
  if (!profile) return false;

  if (db) {
    await db.collection("profiles").doc(profile.username).delete();
    await db.collection("tags").doc(profile.tag_slug).delete();
    return true;
  }

  memoryStore.profiles.delete(profile.username);
  memoryStore.tags.delete(profile.tag_slug);
  return true;
}

async function logEvent(event) {
  const payload = { ...event, created_at: new Date().toISOString() };
  if (db) {
    await db.collection("scan_logs").add(payload);
    return;
  }
  memoryStore.events.push(payload);
}

function requireAdminPassword(req, res) {
  const expected = process.env.ADMIN_PASSWORD || process.env.SETUP_SECRET;
  const provided = req.get("x-admin-password") || req.query.password || req.body?.password;

  if (!expected) {
    res.status(503).json({
      success: false,
      error: "ADMIN_PASSWORD or SETUP_SECRET is not configured on this environment."
    });
    return false;
  }

  if (provided !== expected) {
    res.status(401).json({ success: false, error: "Invalid admin password." });
    return false;
  }

  return true;
}

function sendMvp(req, res) {
  res.sendFile(path.join(__dirname, "public", "web-mvp.html"));
}

app.get(["/", "/web-mvp", "/admin", "/u/:username", "/t/:slug"], sendMvp);

app.get("/health", (req, res) => {
  res.json({
    success: true,
    firebase_configured: Boolean(db),
    storage: storeMode(),
    admin_password_configured: Boolean(process.env.ADMIN_PASSWORD || process.env.SETUP_SECRET),
    firebase_error: firebaseInitError,
    message: db
      ? "Server is running 🚀 Firebase Connected"
      : "Server is running 🚀 Firebase not configured; temporary memory fallback is active"
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    firebase_configured: Boolean(db),
    storage: storeMode(),
    fallback: db ? null : "Firebase env vars are missing or invalid, so this process uses temporary in-memory storage for local UI testing.",
    firebase_error: firebaseInitError
  });
});

app.post(["/api/profiles", "/api/mvp/profile"], async (req, res) => {
  try {
    const validation = validateProfileInput(req.body);
    if (validation.error) return res.status(422).json({ success: false, error: validation.error });

    const now = new Date().toISOString();
    const username = await uniqueUsername(validation.value.name);
    const tagSlug = `tag-${username}-${Date.now().toString(36).slice(-4)}`.toLowerCase();
    const baseUrl = publicBaseUrl(req);
    const profile = {
      ...validation.value,
      username,
      tag_slug: tagSlug,
      profile_url: `${baseUrl}/u/${username}`,
      tag_url: `${baseUrl}/t/${tagSlug}`,
      qr_url: `${baseUrl}/api/qr?data=${encodeURIComponent(`${baseUrl}/u/${username}`)}`,
      tag_qr_url: `${baseUrl}/api/qr?data=${encodeURIComponent(`${baseUrl}/t/${tagSlug}`)}`,
      analytics: createDefaultAnalytics(),
      created_at: now,
      updated_at: now
    };

    await saveProfile(profile);
    await logEvent({ username, tag_slug: tagSlug, action: "profile_created", storage: storeMode() });
    return res.status(201).json({ success: true, storage: storeMode(), profile, vcard: buildVCard(profile) });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get(["/api/profiles/:username", "/api/mvp/profile/:username"], async (req, res) => {
  try {
    const username = cleanUsername(req.params.username);
    const profile = await getProfile(username);
    if (!profile) return res.status(404).json({ success: false, error: "Profile not found." });

    const analytics = normalizeAnalytics(profile.analytics);
    analytics.total_views += 1;
    analytics.last_seen = new Date().toISOString();
    await updateProfile(username, { analytics, updated_at: new Date().toISOString() });
    const updatedProfile = { ...profile, analytics };
    await logEvent({ username, tag_slug: profile.tag_slug, action: "profile_view", storage: storeMode(), user_agent: req.get("user-agent") || "" });
    return res.json({ success: true, storage: storeMode(), profile: updatedProfile, vcard: buildVCard(updatedProfile) });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get(["/api/tags/:slug", "/api/mvp/tag/:slug"], async (req, res) => {
  try {
    const tag = await getTag(req.params.slug);
    if (!tag) return res.status(404).json({ success: false, error: "Tag not found." });
    const profile = await getProfile(tag.username);
    if (!profile) return res.status(404).json({ success: false, error: "Profile for this tag was not found." });

    await logEvent({ username: profile.username, tag_slug: tag.slug, action: "tag_scan", storage: storeMode(), user_agent: req.get("user-agent") || "" });
    return res.json({ success: true, storage: storeMode(), tag, profile, vcard: buildVCard(profile) });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/track", async (req, res) => {
  try {
    const username = cleanUsername(req.body.username);
    const action = cleanText(req.body.action, "click").slice(0, 80);
    const profile = username ? await getProfile(username) : null;

    if (profile) {
      const analytics = normalizeAnalytics(profile.analytics);
      analytics.total_clicks += 1;
      analytics.link_clicks[action] = Number(analytics.link_clicks[action] || 0) + 1;
      await updateProfile(username, { analytics, updated_at: new Date().toISOString() });
    }

    await logEvent({ username, action, storage: storeMode(), metadata: req.body.metadata || {} });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/admin/profiles", async (req, res) => {
  try {
    if (!requireAdminPassword(req, res)) return;
    return res.json({ success: true, storage: storeMode(), profiles: await listProfiles() });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.delete("/api/admin/profiles/:username", async (req, res) => {
  try {
    if (!requireAdminPassword(req, res)) return;
    const deleted = await deleteProfile(req.params.username);
    if (!deleted) return res.status(404).json({ success: false, error: "Profile not found." });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/qr", async (req, res) => {
  try {
    const data = cleanText(req.query.data, publicBaseUrl(req));
    const png = await QRCode.toBuffer(data, { type: "png", width: 720, margin: 2, errorCorrectionLevel: "H" });
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.send(png);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: "Not found" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`myQRID MVP running on port ${PORT}`);
});
