require("dotenv").config();

const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const QRCode = require("qrcode");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;

/* ---------------- FIREBASE ---------------- */

const hasFirebaseConfig =
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY;

let db = null;

if (hasFirebaseConfig) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });

    db = admin.firestore();

    console.log("✅ Firebase connected");
  } catch (error) {
    console.error("❌ Firebase init error:", error.message);
  }
} else {
  console.log("⚠ Firebase ENV variables missing");
}

/* ---------------- ROUTES ---------------- */

app.get("/health", (req, res) => {
  res.json({
    success: true,
    firebase: !!db,
    message: "Server running",
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    firebase_configured: !!db,
    storage: db ? "firebase" : "memory",
    message: "Server running with Firebase",
  });
});

app.get("/api/qr", async (req, res) => {
  try {
    const data = req.query.data || "myQRID";

    const qr = await QRCode.toDataURL(data);

    const img = Buffer.from(
      qr.replace(/^data:image\/png;base64,/, ""),
      "base64"
    );

    res.writeHead(200, {
      "Content-Type": "image/png",
      "Content-Length": img.length,
    });

    res.end(img);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.post("/api/profiles", async (req, res) => {
  try {
    const body = req.body;

    const username =
      body.username ||
      `user${Date.now().toString().slice(-6)}`;

    const profile = {
      username,
      name: body.name || "",
      phone: body.phone || "",
      whatsapp: body.whatsapp || "",
      email: body.email || "",
      bio: body.bio || "",
      created_at: new Date().toISOString(),
    };

    if (db) {
      await db.collection("profiles").doc(username).set(profile);
    }

    res.json({
      success: true,
      profile,
      profile_url: `/u/${username}`,
      qr_url: `/api/qr?data=${encodeURIComponent(
        `/u/${username}`
      )}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.get("/api/profiles/:username", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({
        success: false,
        error: "Firebase not configured",
      });
    }

    const doc = await db
      .collection("profiles")
      .doc(req.params.username)
      .get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: "Profile not found",
      });
    }

    res.json({
      success: true,
      profile: doc.data(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.put("/api/profiles/:username", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ success: false, error: "Firebase not configured" });
    }
    const updates = req.body;
    delete updates.username;
    delete updates.created_at;
    await db.collection("profiles").doc(req.params.username).set(updates, { merge: true });
    res.json({ success: true, message: "Profile updated" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* ---------------- FRONTEND ---------------- */

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages", "dashboard.html"));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "web-mvp.html"));
});

/* ---------------- START ---------------- */

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

/* ── AUTH ROUTES ── */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const users = new Map();

app.post('/auth/signup', async (req, res) => {
  try {
    const { name, username, email, password, phone } = req.body;
    if (!name || !username || !email || !password) return res.json({ success: false, error: 'Missing fields' });
    if (users.has(email)) return res.json({ success: false, error: 'Email already exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = { id: Date.now(), name, username, email, phone, password: hash, created: new Date() };
    users.set(email, user);
    const token = jwt.sign({ id: user.id, email, username }, process.env.JWT_ACCESS_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user.id, name, username, email, phone } });
  } catch(e) { res.json({ success: false, error: e.message }); }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.get(email);
    if (!user) return res.json({ success: false, error: 'Invalid email or password' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ success: false, error: 'Invalid email or password' });
    const token = jwt.sign({ id: user.id, email, username: user.username }, process.env.JWT_ACCESS_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user.id, name: user.name, username: user.username, email } });
  } catch(e) { res.json({ success: false, error: e.message }); }
});

app.get('/check-username/:username', (req, res) => {
  const taken = [...users.values()].some(u => u.username === req.params.username);
  res.json({ available: !taken });
});

app.get('/profile/:username', (req, res) => {
  const user = [...users.values()].find(u => u.username === req.params.username);
  if (!user) return res.json({ success: false, error: 'Not found', claimed: false });
  res.json({ success: true, claimed: true, username: user.username, display_name: user.name, phone: user.phone });
});

app.get('/dashboard', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.json({ success: false, error: 'Unauthorized' });
  try {
    const token = auth.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'secret');
    const user = [...users.values()].find(u => u.id === decoded.id);
    if (!user) return res.json({ success: false, error: 'User not found' });
    res.json({ success: true, profile: { username: user.username, display_name: user.name, email: user.email, phone: user.phone }, links: [], stats: { total: 0, today: 0, week: 0 } });
  } catch(e) { res.json({ success: false, error: 'Invalid token' }); }
});
