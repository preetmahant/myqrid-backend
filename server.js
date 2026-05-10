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
