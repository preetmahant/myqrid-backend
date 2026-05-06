const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/* -------------------------------
   FIREBASE INIT
-------------------------------- */
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,

    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,

    // 🔥 PRIVATE KEY WILL COME FROM RENDER ENV
    // Render → Environment → FIREBASE_PRIVATE_KEY
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  })
});

const db = admin.firestore();

/* -------------------------------
   TEST ROOT
-------------------------------- */
app.get("/", (req, res) => {
  res.send("Server is running 🚀 Firebase Connected");
});

/* -------------------------------
   CHECK USERNAME + SUGGESTIONS
-------------------------------- */
app.get("/check-username", async (req, res) => {
  try {

    const username = req.query.username;

    if (!username) {
      return res.json({
        error: "Username required"
      });
    }

    const clean = username.toLowerCase();

    const doc = await db.collection("users").doc(clean).get();

    // ✅ available
    if (!doc.exists) {
      return res.json({
        available: true,
        suggestions: []
      });
    }

    // ❌ taken
    let suggestions = [
      "the" + clean,
      "my" + clean,
      clean + "official",
      clean + "live",
      clean + Math.floor(Math.random() * 1000)
    ];

    suggestions = suggestions.slice(0, 5);

    return res.json({
      available: false,
      suggestions
    });

  } catch (err) {

    return res.json({
      error: err.message
    });

  }
});

/* -------------------------------
   CREATE USER
-------------------------------- */
app.get("/create-user", async (req, res) => {

  try {

    const username = req.query.username;
    const display_name = req.query.display_name;

    if (!username) {
      return res.json({
        error: "Username required"
      });
    }

    const cleanUsername = username.toLowerCase();

    const ref = db.collection("users").doc(cleanUsername);

    const existing = await ref.get();

    // ❌ username taken
    if (existing.exists) {

      return res.json({
        error: "Username already taken"
      });

    }

    // 🔥 UNIQUE INTERNAL SLUG
    const unique_slug =
      "uid_" +
      Date.now() +
      "_" +
      Math.floor(Math.random() * 999999);

    const userData = {

      // public
      username: cleanUsername,
      display_name: display_name || "New User",

      // permanent internal identity
      unique_slug: unique_slug,

      // editable
      phone: "",
      bio: "New profile",

      // socials
      whatsapp: "",
      email: "",
      instagram: "",
      x: "",
      snapchat: "",
      linkedin: "",
      website: "",

      // username tracking
      old_usernames: [],
      username_last_changed: 0,

      // analytics
      analytics: {
        total_views: 0,
        total_clicks: 0,
        last_seen: null,
        is_online: false,
        profile_opens: []
      },

      // timestamps
      created_at: new Date().toISOString()

    };

    await ref.set(userData);

    return res.json({
      success: true,
      user: userData
    });

  } catch (err) {

    return res.json({
      error: err.message
    });

  }

});

/* -------------------------------
   CHANGE USERNAME (30 DAYS RULE)
-------------------------------- */
app.get("/change-username", async (req, res) => {

  try {

    const current = req.query.current;
    const newUsername = req.query.new;

    if (!current || !newUsername) {

      return res.json({
        error: "Current & new username required"
      });

    }

    const oldRef =
      db.collection("users").doc(current.toLowerCase());

    const oldDoc = await oldRef.get();

    if (!oldDoc.exists) {

      return res.json({
        error: "User not found"
      });

    }

    const oldUser = oldDoc.data();

    const now = Date.now();

    const lastChanged =
      oldUser.username_last_changed || 0;

    const diffDays =
      (now - lastChanged) / (1000 * 60 * 60 * 24);

    // 🔒 30 day rule
    if (lastChanged !== 0 && diffDays < 30) {

      return res.json({
        error:
          "Username can be changed only after 30 days"
      });

    }

    const cleanNew = newUsername.toLowerCase();

    const newRef =
      db.collection("users").doc(cleanNew);

    const newDoc = await newRef.get();

    if (newDoc.exists) {

      return res.json({
        error: "New username already taken"
      });

    }

    // save history
    oldUser.old_usernames.push(oldUser.username);

    // update username
    oldUser.username = cleanNew;

    oldUser.username_last_changed = now;

    // save new
    await newRef.set(oldUser);

    // delete old
    await oldRef.delete();

    return res.json({
      success: true,
      new_username: cleanNew
    });

  } catch (err) {

    return res.json({
      error: err.message
    });

  }

});

/* -------------------------------
   TRACK LINK CLICK
-------------------------------- */
app.get("/track-click", async (req, res) => {

  try {

    const username = req.query.username;
    const button = req.query.button;

    if (!username || !button) {

      return res.json({
        error: "username & button required"
      });

    }

    const ref =
      db.collection("users").doc(username.toLowerCase());

    const doc = await ref.get();

    if (!doc.exists) {

      return res.json({
        error: "User not found"
      });

    }

    const user = doc.data();

    // analytics init
    if (!user.analytics.link_clicks) {
      user.analytics.link_clicks = {};
    }

    if (!user.analytics.link_clicks[button]) {
      user.analytics.link_clicks[button] = 0;
    }

    user.analytics.link_clicks[button] += 1;

    user.analytics.total_clicks += 1;

    await ref.update({
      analytics: user.analytics
    });

    return res.json({
      success: true
    });

  } catch (err) {

    return res.json({
      error: err.message
    });

  }

});

/* -------------------------------
   GET USER PROFILE
-------------------------------- */
app.get("/:username", async (req, res) => {

  try {

    const username =
      req.params.username.toLowerCase();

    const ref =
      db.collection("users").doc(username);

    const doc = await ref.get();

    if (!doc.exists) {

      return res.json({
        error: "Profile not found"
      });

    }

    const user = doc.data();

    // 🔥 analytics
    user.analytics.total_views += 1;

    user.analytics.last_seen =
      new Date().toISOString();

    user.analytics.is_online = true;

    user.analytics.profile_opens.push({
      time: new Date().toISOString()
    });

    await ref.update({
      analytics: user.analytics
    });

    return res.json(user);

  } catch (err) {

    return res.json({
      error: err.message
    });

  }

});

/* -------------------------------
   SERVER START
-------------------------------- */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    "Server running on port " + PORT
  );

});
