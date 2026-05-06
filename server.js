diff --git a/server.js b/server.js
index 14055573b5a2d497ad1357d494a73228de79825a..89cbec43dadfed5195fc17189ba7c0bb6aa967b1 100644
--- a/server.js
+++ b/server.js
@@ -1,403 +1,393 @@
 const express = require("express");
+const path = require("path");
 const admin = require("firebase-admin");
 const cors = require("cors");
 
 const app = express();
 
 app.use(cors());
 app.use(express.json());
+app.use(express.static(path.join(__dirname, "public")));
 
 /* -------------------------------
    FIREBASE INIT
 -------------------------------- */
-admin.initializeApp({
-  credential: admin.credential.cert({
-    projectId: process.env.FIREBASE_PROJECT_ID,
-
-    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
+const hasFirebaseConfig =
+  process.env.FIREBASE_PROJECT_ID &&
+  process.env.FIREBASE_CLIENT_EMAIL &&
+  process.env.FIREBASE_PRIVATE_KEY;
+
+let db = null;
+
+if (hasFirebaseConfig) {
+  admin.initializeApp({
+    credential: admin.credential.cert({
+      projectId: process.env.FIREBASE_PROJECT_ID,
+      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
+      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
+    })
+  });
+
+  db = admin.firestore();
+} else {
+  console.warn(
+    "Firebase credentials missing. Static frontend preview is available, but API routes need Firebase env vars."
+  );
+}
 
-    // 🔥 PRIVATE KEY WILL COME FROM RENDER ENV
-    // Render → Environment → FIREBASE_PRIVATE_KEY
-    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
-  })
-});
+function requireDb(res) {
+  if (db) {
+    return true;
+  }
 
-const db = admin.firestore();
+  res.status(503).json({
+    error: "Firebase is not configured on this environment"
+  });
+
+  return false;
+}
+
+function cleanUsername(username) {
+  return String(username || "")
+    .trim()
+    .toLowerCase()
+    .replace(/^@/, "");
+}
+
+function createUniqueSlug() {
+  return "uid_" + Date.now() + "_" + Math.floor(Math.random() * 999999);
+}
+
+function createDefaultAnalytics() {
+  return {
+    total_views: 0,
+    total_clicks: 0,
+    last_seen: null,
+    is_online: false,
+    profile_opens: [],
+    link_clicks: {}
+  };
+}
+
+function normalizeAnalytics(analytics) {
+  const defaults = createDefaultAnalytics();
+  const safeAnalytics = analytics && typeof analytics === "object" ? analytics : {};
+
+  return {
+    ...defaults,
+    ...safeAnalytics,
+    total_views: Number(safeAnalytics.total_views || 0),
+    total_clicks: Number(safeAnalytics.total_clicks || 0),
+    profile_opens: Array.isArray(safeAnalytics.profile_opens)
+      ? safeAnalytics.profile_opens
+      : [],
+    link_clicks:
+      safeAnalytics.link_clicks && typeof safeAnalytics.link_clicks === "object"
+        ? safeAnalytics.link_clicks
+        : {}
+  };
+}
 
 /* -------------------------------
-   TEST ROOT
+   FRONTEND ROOT
 -------------------------------- */
 app.get("/", (req, res) => {
-  res.send("Server is running 🚀 Firebase Connected");
+  res.sendFile(path.join(__dirname, "public", "index.html"));
+});
+
+/* -------------------------------
+   HEALTH CHECK
+-------------------------------- */
+app.get("/health", (req, res) => {
+  res.json({
+    success: true,
+    firebase_configured: Boolean(db),
+    message: db
+      ? "Server is running 🚀 Firebase Connected"
+      : "Server is running 🚀 Firebase not configured"
+  });
 });
 
 /* -------------------------------
    CHECK USERNAME + SUGGESTIONS
 -------------------------------- */
 app.get("/check-username", async (req, res) => {
   try {
+    if (!requireDb(res)) {
+      return;
+    }
 
-    const username = req.query.username;
+    const username = cleanUsername(req.query.username);
 
     if (!username) {
       return res.json({
         error: "Username required"
       });
     }
 
-    const clean = username.toLowerCase();
-
-    const doc = await db.collection("users").doc(clean).get();
+    const doc = await db.collection("users").doc(username).get();
 
-    // ✅ available
     if (!doc.exists) {
       return res.json({
         available: true,
         suggestions: []
       });
     }
 
-    // ❌ taken
-    let suggestions = [
-      "the" + clean,
-      "my" + clean,
-      clean + "official",
-      clean + "live",
-      clean + Math.floor(Math.random() * 1000)
-    ];
-
-    suggestions = suggestions.slice(0, 5);
+    const suggestions = [
+      "the" + username,
+      "my" + username,
+      username + "official",
+      username + "live",
+      username + Math.floor(Math.random() * 1000)
+    ].slice(0, 5);
 
     return res.json({
       available: false,
       suggestions
     });
-
   } catch (err) {
-
-    return res.json({
+    return res.status(500).json({
       error: err.message
     });
-
   }
 });
 
 /* -------------------------------
    CREATE USER
 -------------------------------- */
 app.get("/create-user", async (req, res) => {
-
   try {
+    if (!requireDb(res)) {
+      return;
+    }
 
-    const username = req.query.username;
-    const display_name = req.query.display_name;
+    const username = cleanUsername(req.query.username);
+    const display_name = String(req.query.display_name || "").trim();
 
     if (!username) {
       return res.json({
         error: "Username required"
       });
     }
 
-    const cleanUsername = username.toLowerCase();
-
-    const ref = db.collection("users").doc(cleanUsername);
-
+    const ref = db.collection("users").doc(username);
     const existing = await ref.get();
 
-    // ❌ username taken
     if (existing.exists) {
-
       return res.json({
         error: "Username already taken"
       });
-
     }
 
-    // 🔥 UNIQUE INTERNAL SLUG
-    const unique_slug =
-      "uid_" +
-      Date.now() +
-      "_" +
-      Math.floor(Math.random() * 999999);
-
     const userData = {
-
-      // public
-      username: cleanUsername,
+      username,
       display_name: display_name || "New User",
-
-      // permanent internal identity
-      unique_slug: unique_slug,
-
-      // editable
+      unique_slug: createUniqueSlug(),
       phone: "",
       bio: "New profile",
-
-      // socials
+      avatar: "",
       whatsapp: "",
       email: "",
       instagram: "",
       x: "",
       snapchat: "",
       linkedin: "",
+      youtube: "",
       website: "",
-
-      // username tracking
+      links: [],
+      products: [],
+      status: "active",
       old_usernames: [],
       username_last_changed: 0,
-
-      // analytics
-      analytics: {
-        total_views: 0,
-        total_clicks: 0,
-        last_seen: null,
-        is_online: false,
-        profile_opens: []
-      },
-
-      // timestamps
+      analytics: createDefaultAnalytics(),
       created_at: new Date().toISOString()
-
     };
 
     await ref.set(userData);
 
     return res.json({
       success: true,
       user: userData
     });
-
   } catch (err) {
-
-    return res.json({
+    return res.status(500).json({
       error: err.message
     });
-
   }
-
 });
 
 /* -------------------------------
    CHANGE USERNAME (30 DAYS RULE)
 -------------------------------- */
 app.get("/change-username", async (req, res) => {
-
   try {
+    if (!requireDb(res)) {
+      return;
+    }
 
-    const current = req.query.current;
-    const newUsername = req.query.new;
+    const current = cleanUsername(req.query.current);
+    const newUsername = cleanUsername(req.query.new);
 
     if (!current || !newUsername) {
-
       return res.json({
         error: "Current & new username required"
       });
-
     }
 
-    const oldRef =
-      db.collection("users").doc(current.toLowerCase());
-
+    const oldRef = db.collection("users").doc(current);
     const oldDoc = await oldRef.get();
 
     if (!oldDoc.exists) {
-
       return res.json({
         error: "User not found"
       });
-
     }
 
     const oldUser = oldDoc.data();
-
     const now = Date.now();
+    const lastChanged = oldUser.username_last_changed || 0;
+    const diffDays = (now - lastChanged) / (1000 * 60 * 60 * 24);
 
-    const lastChanged =
-      oldUser.username_last_changed || 0;
-
-    const diffDays =
-      (now - lastChanged) / (1000 * 60 * 60 * 24);
-
-    // 🔒 30 day rule
     if (lastChanged !== 0 && diffDays < 30) {
-
       return res.json({
-        error:
-          "Username can be changed only after 30 days"
+        error: "Username can be changed only after 30 days"
       });
-
     }
 
-    const cleanNew = newUsername.toLowerCase();
-
-    const newRef =
-      db.collection("users").doc(cleanNew);
-
+    const newRef = db.collection("users").doc(newUsername);
     const newDoc = await newRef.get();
 
     if (newDoc.exists) {
-
       return res.json({
         error: "New username already taken"
       });
-
     }
 
-    // save history
-    oldUser.old_usernames.push(oldUser.username);
-
-    // update username
-    oldUser.username = cleanNew;
+    const oldUsernames = Array.isArray(oldUser.old_usernames)
+      ? oldUser.old_usernames
+      : [];
 
-    oldUser.username_last_changed = now;
-
-    // save new
-    await newRef.set(oldUser);
+    const updatedUser = {
+      ...oldUser,
+      username: newUsername,
+      old_usernames: [...oldUsernames, oldUser.username || current],
+      username_last_changed: now
+    };
 
-    // delete old
+    await newRef.set(updatedUser);
     await oldRef.delete();
 
     return res.json({
       success: true,
-      new_username: cleanNew
+      new_username: newUsername
     });
-
   } catch (err) {
-
-    return res.json({
+    return res.status(500).json({
       error: err.message
     });
-
   }
-
 });
 
 /* -------------------------------
    TRACK LINK CLICK
 -------------------------------- */
 app.get("/track-click", async (req, res) => {
-
   try {
+    if (!requireDb(res)) {
+      return;
+    }
 
-    const username = req.query.username;
-    const button = req.query.button;
+    const username = cleanUsername(req.query.username);
+    const button = String(req.query.button || "").trim();
 
     if (!username || !button) {
-
       return res.json({
         error: "username & button required"
       });
-
     }
 
-    const ref =
-      db.collection("users").doc(username.toLowerCase());
-
+    const ref = db.collection("users").doc(username);
     const doc = await ref.get();
 
     if (!doc.exists) {
-
       return res.json({
         error: "User not found"
       });
-
     }
 
     const user = doc.data();
+    const analytics = normalizeAnalytics(user.analytics);
 
-    // analytics init
-    if (!user.analytics.link_clicks) {
-      user.analytics.link_clicks = {};
-    }
-
-    if (!user.analytics.link_clicks[button]) {
-      user.analytics.link_clicks[button] = 0;
-    }
-
-    user.analytics.link_clicks[button] += 1;
-
-    user.analytics.total_clicks += 1;
+    analytics.link_clicks[button] = Number(analytics.link_clicks[button] || 0) + 1;
+    analytics.total_clicks += 1;
 
-    await ref.update({
-      analytics: user.analytics
-    });
+    await ref.update({ analytics });
 
     return res.json({
-      success: true
+      success: true,
+      analytics
     });
-
   } catch (err) {
-
-    return res.json({
+    return res.status(500).json({
       error: err.message
     });
-
   }
-
 });
 
 /* -------------------------------
    GET USER PROFILE
 -------------------------------- */
 app.get("/:username", async (req, res) => {
-
   try {
+    if (!requireDb(res)) {
+      return;
+    }
 
-    const username =
-      req.params.username.toLowerCase();
+    const username = cleanUsername(req.params.username);
 
-    const ref =
-      db.collection("users").doc(username);
+    if (!username) {
+      return res.json({
+        error: "Username required"
+      });
+    }
 
+    const ref = db.collection("users").doc(username);
     const doc = await ref.get();
 
     if (!doc.exists) {
-
       return res.json({
         error: "Profile not found"
       });
-
     }
 
     const user = doc.data();
+    const analytics = normalizeAnalytics(user.analytics);
+    const now = new Date().toISOString();
 
-    // 🔥 analytics
-    user.analytics.total_views += 1;
-
-    user.analytics.last_seen =
-      new Date().toISOString();
+    analytics.total_views += 1;
+    analytics.last_seen = now;
+    analytics.is_online = true;
+    analytics.profile_opens.push({ time: now });
 
-    user.analytics.is_online = true;
+    await ref.update({ analytics });
 
-    user.analytics.profile_opens.push({
-      time: new Date().toISOString()
-    });
-
-    await ref.update({
-      analytics: user.analytics
+    return res.json({
+      ...user,
+      analytics
     });
-
-    return res.json(user);
-
   } catch (err) {
-
-    return res.json({
+    return res.status(500).json({
       error: err.message
     });
-
   }
-
 });
 
 /* -------------------------------
    SERVER START
 -------------------------------- */
 const PORT = process.env.PORT || 3000;
 
 app.listen(PORT, () => {
-
-  console.log(
-    "Server running on port " + PORT
-  );
-
+  console.log("Server running on port " + PORT);
 });
