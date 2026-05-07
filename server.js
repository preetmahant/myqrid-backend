const express = require("express");
const path = require("path");
const admin = require("firebase-admin");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

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
  } catch (err) {
    firebaseInitError = err.message;
    console.error("Firebase init failed:", err.message);
    console.error(
      "Server will keep running for / and /health. Fix Firebase env vars on Render for API routes."
    );
  }
} else {
  console.warn(
    "Firebase credentials missing. Static frontend preview is available, but API routes need Firebase env vars."
  );
}

function requireDb(res) {
  if (db) {
    return true;
  }

  res.status(503).json({
    error: "Firebase is not configured on this environment"
  });

  return false;
}

function cleanUsername(username) {
  return String(username || "")
    .trim()
    .toLowerCase()
    .replace(/^@/, "");
}

function createUniqueSlug() {
  return "uid_" + Date.now() + "_" + Math.floor(Math.random() * 999999);
}

function createDefaultAnalytics() {
  return {
    total_views: 0,
    total_clicks: 0,
    last_seen: null,
    is_online: false,
    profile_opens: [],
    link_clicks: {}
  };
}

function normalizeAnalytics(analytics) {
  const defaults = createDefaultAnalytics();
  const safeAnalytics = analytics && typeof analytics === "object" ? analytics : {};

  return {
    ...defaults,
    ...safeAnalytics,
    total_views: Number(safeAnalytics.total_views || 0),
    total_clicks: Number(safeAnalytics.total_clicks || 0),
    profile_opens: Array.isArray(safeAnalytics.profile_opens)
      ? safeAnalytics.profile_opens
      : [],
    link_clicks:
      safeAnalytics.link_clicks && typeof safeAnalytics.link_clicks === "object"
        ? safeAnalytics.link_clicks
        : {}
  };
}

/* -------------------------------
   FRONTEND ROOT
-------------------------------- */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* -------------------------------
   HEALTH CHECK
-------------------------------- */
app.get("/health", (req, res) => {
  res.json({
    success: true,
    firebase_configured: Boolean(db),
    firebase_error: firebaseInitError,
    message: db
      ? "Server is running 🚀 Firebase Connected"
      : "Server is running 🚀 Firebase not configured"
  });
});

/* -------------------------------
   CHECK USERNAME + SUGGESTIONS
-------------------------------- */
app.get("/check-username", async (req, res) => {
  try {
    if (!requireDb(res)) {
      return;
    }

    const username = cleanUsername(req.query.username);

    if (!username) {
      return res.json({
        error: "Username required"
      });
    }

    const doc = await db.collection("users").doc(username).get();

    if (!doc.exists) {
      return res.json({
        available: true,
        suggestions: []
      });
    }

    const suggestions = [
      "the" + username,
      "my" + username,
      username + "official",
      username + "live",
      username + Math.floor(Math.random() * 1000)
    ].slice(0, 5);

    return res.json({
      available: false,
      suggestions
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
});

/* -------------------------------
   CREATE USER
-------------------------------- */
app.get("/create-user", async (req, res) => {
  try {
    if (!requireDb(res)) {
      return;
    }

    const username = cleanUsername(req.query.username);
    const display_name = String(req.query.display_name || "").trim();

    if (!username) {
      return res.json({
        error: "Username required"
      });
    }

    const ref = db.collection("users").doc(username);
    const existing = await ref.get();

    if (existing.exists) {
      return res.json({
        error: "Username already taken"
      });
    }

    const userData = {
      username,
      display_name: display_name || "New User",
      unique_slug: createUniqueSlug(),
      phone: "",
      bio: "New profile",
      avatar: "",
      whatsapp: "",
      email: "",
      instagram: "",
      x: "",
      snapchat: "",
      linkedin: "",
      youtube: "",
      website: "",
      links: [],
      products: [],
      status: "active",
      old_usernames: [],
      username_last_changed: 0,
      analytics: createDefaultAnalytics(),
      created_at: new Date().toISOString()
    };

    await ref.set(userData);

    return res.json({
      success: true,
      user: userData
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
});

/* -------------------------------
   CHANGE USERNAME (30 DAYS RULE)
-------------------------------- */
app.get("/change-username", async (req, res) => {
  try {
    if (!requireDb(res)) {
      return;
    }

    const current = cleanUsername(req.query.current);
    const newUsername = cleanUsername(req.query.new);

    if (!current || !newUsername) {
      return res.json({
        error: "Current & new username required"
      });
    }

    const oldRef = db.collection("users").doc(current);
    const oldDoc = await oldRef.get();

    if (!oldDoc.exists) {
      return res.json({
        error: "User not found"
      });
    }

    const oldUser = oldDoc.data();
    const now = Date.now();
    const lastChanged = oldUser.username_last_changed || 0;
    const diffDays = (now - lastChanged) / (1000 * 60 * 60 * 24);

    if (lastChanged !== 0 && diffDays < 30) {
      return res.json({
        error: "Username can be changed only after 30 days"
      });
    }

    const newRef = db.collection("users").doc(newUsername);
    const newDoc = await newRef.get();

    if (newDoc.exists) {
      return res.json({
        error: "New username already taken"
      });
    }

    const oldUsernames = Array.isArray(oldUser.old_usernames)
      ? oldUser.old_usernames
      : [];

    const updatedUser = {
      ...oldUser,
      username: newUsername,
      old_usernames: [...oldUsernames, oldUser.username || current],
      username_last_changed: now
    };

    await newRef.set(updatedUser);
    await oldRef.delete();

    return res.json({
      success: true,
      new_username: newUsername
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
});

/* -------------------------------
   TRACK LINK CLICK
-------------------------------- */
app.get("/track-click", async (req, res) => {
  try {
    if (!requireDb(res)) {
      return;
    }

    const username = cleanUsername(req.query.username);
    const button = String(req.query.button || "").trim();

    if (!username || !button) {
      return res.json({
        error: "username & button required"
      });
    }

    const ref = db.collection("users").doc(username);
    const doc = await ref.get();

    if (!doc.exists) {
      return res.json({
        error: "User not found"
      });
    }

    const user = doc.data();
    const analytics = normalizeAnalytics(user.analytics);

    analytics.link_clicks[button] = Number(analytics.link_clicks[button] || 0) + 1;
    analytics.total_clicks += 1;

    await ref.update({ analytics });

    return res.json({
      success: true,
      analytics
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
});

/* -------------------------------
   GET USER PROFILE
-------------------------------- */
app.get("/:username", async (req, res) => {
  try {
    if (!requireDb(res)) {
      return;
    }

    const username = cleanUsername(req.params.username);

    if (!username) {
      return res.json({
        error: "Username required"
      });
    }

    const ref = db.collection("users").doc(username);
    const doc = await ref.get();

    if (!doc.exists) {
      return res.json({
        error: "Profile not found"
      });
    }

    const user = doc.data();
    const analytics = normalizeAnalytics(user.analytics);
    const now = new Date().toISOString();

    analytics.total_views += 1;
    analytics.last_seen = now;
    analytics.is_online = true;
    analytics.profile_opens.push({ time: now });

    await ref.update({ analytics });

    return res.json({
      ...user,
      analytics
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
});

/* -------------------------------
   SERVER START
-------------------------------- */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
