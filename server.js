diff --git a/server.js b/server.js
index 14055573b5a2d497ad1357d494a73228de79825a..6970019fe6bc1368dad95c8b8d889bf6fcd8f8ad 100644
--- a/server.js
+++ b/server.js
@@ -1,403 +1,648 @@
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
+const hasFirebaseConfig =
+  process.env.FIREBASE_PROJECT_ID &&
+  process.env.FIREBASE_CLIENT_EMAIL &&
+  process.env.FIREBASE_PRIVATE_KEY;
 
-    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
+let db = null;
+let firebaseInitError = null;
 
-    // 🔥 PRIVATE KEY WILL COME FROM RENDER ENV
-    // Render → Environment → FIREBASE_PRIVATE_KEY
-    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
-  })
-});
+function normalizePrivateKey(privateKey) {
+  return String(privateKey || "")
+    .replace(/^"|"$/g, "")
+    .replace(/\\n/g, "\n");
+}
+
+if (hasFirebaseConfig) {
+  try {
+    admin.initializeApp({
+      credential: admin.credential.cert({
+        projectId: process.env.FIREBASE_PROJECT_ID,
+        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
+        privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY)
+      })
+    });
+
+    db = admin.firestore();
+  } catch (err) {
+    firebaseInitError = err.message;
+    console.error("Firebase init failed:", err.message);
+    console.error(
+      "Server will keep running for / and /health. Fix Firebase env vars on Render for API routes."
+    );
+  }
+} else {
+  console.warn(
+    "Firebase credentials missing. Static frontend preview is available, but API routes need Firebase env vars."
+  );
+}
+
+function requireDb(res) {
+  if (db) {
+    return true;
+  }
+
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
+function isValidUsername(username) {
+  return /^[a-z0-9_]{3,30}$/.test(username) && !username.startsWith("_") && !username.endsWith("_");
+}
+
+function usernameValidationError(username) {
+  if (!username) {
+    return "Username required";
+  }
+
+  if (!isValidUsername(username)) {
+    return "Username can use only letters, numbers and underscore. No dots or special characters. Length must be 3-30 characters.";
+  }
+
+  return null;
+}
+
+function buildSuggestionSeeds(username) {
+  const currentYear = new Date().getFullYear();
+  return [
+    "the" + username,
+    username + "live",
+    username + "_official",
+    username + "_now",
+    "my" + username,
+    username + "hq",
+    username + "online",
+    username + "india",
+    username + currentYear,
+    username + Math.floor(100 + Math.random() * 900)
+  ];
+}
+
+async function getUsernameSuggestions(username, limit = 5) {
+  const suggestions = [];
+  const seen = new Set([username]);
+
+  for (const seed of buildSuggestionSeeds(username)) {
+    const suggestion = cleanUsername(seed);
+
+    if (!isValidUsername(suggestion) || seen.has(suggestion)) {
+      continue;
+    }
 
-const db = admin.firestore();
+    seen.add(suggestion);
+
+    const doc = await db.collection("users").doc(suggestion).get();
+    if (!doc.exists) {
+      suggestions.push(suggestion);
+    }
+
+    if (suggestions.length >= limit) {
+      break;
+    }
+  }
+
+  return suggestions;
+}
+
+const TAG_CATEGORIES = {
+  I: "Identity",
+  P: "Pet",
+  A: "Asset",
+  B: "Business",
+  S: "Safety",
+  G: "Group"
+};
+
+function normalizeCategory(category) {
+  const cleanCategory = String(category || "I").trim().toUpperCase();
+  return TAG_CATEGORIES[cleanCategory] ? cleanCategory : "I";
+}
+
+function formatSerial(serial) {
+  return String(serial).padStart(6, "0");
+}
+
+function createTagSlug(category, serial) {
+  return `${normalizeCategory(category)}-${formatSerial(serial)}`;
+}
+
+function createClaimCode(serial) {
+  return "MQ-" + formatSerial(serial);
+}
+
+function buildTagData({ serial, slug, category, username, accountNo, now, status = "active" }) {
+  return {
+    serial_no: serial,
+    slug,
+    category,
+    category_name: TAG_CATEGORIES[category],
+    owner_username: username,
+    owner_account_no: accountNo,
+    status,
+    privacy: "public",
+    claim_code: createClaimCode(serial),
+    created_at: now,
+    activated_at: now,
+    total_scans: 0,
+    last_scan_at: null
+  };
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
+    firebase_error: firebaseInitError,
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
 
-    if (!username) {
+    const validationError = usernameValidationError(username);
+
+    if (validationError) {
       return res.json({
-        error: "Username required"
+        available: false,
+        error: validationError,
+        suggestions: []
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
+    const suggestions = await getUsernameSuggestions(username);
 
     return res.json({
       available: false,
+      error: "Username already taken",
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
+    const category = normalizeCategory(req.query.category || "I");
 
-    if (!username) {
+    const validationError = usernameValidationError(username);
+
+    if (validationError) {
       return res.json({
-        error: "Username required"
+        error: validationError,
+        suggestions: []
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
+      const suggestions = await getUsernameSuggestions(username);
 
       return res.json({
-        error: "Username already taken"
+        available: false,
+        error: "Username already taken",
+        suggestions
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
-    const userData = {
-
-      // public
-      username: cleanUsername,
-      display_name: display_name || "New User",
-
-      // permanent internal identity
-      unique_slug: unique_slug,
-
-      // editable
-      phone: "",
-      bio: "New profile",
-
-      // socials
-      whatsapp: "",
-      email: "",
-      instagram: "",
-      x: "",
-      snapchat: "",
-      linkedin: "",
-      website: "",
-
-      // username tracking
-      old_usernames: [],
-      username_last_changed: 0,
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
-      created_at: new Date().toISOString()
-
-    };
+    const now = new Date().toISOString();
+    const counterRef = db.collection("counters").doc("global");
+    let userData = null;
+    let tagData = null;
+
+    await db.runTransaction(async transaction => {
+      const counterDoc = await transaction.get(counterRef);
+      const counters = counterDoc.exists ? counterDoc.data() : {};
+      const accountNo = Number(counters.last_account_no || 0) + 1;
+      const tagSerial = Number(counters.last_tag_serial || 0) + 1;
+      const slug = createTagSlug(category, tagSerial);
+      const tagRef = db.collection("tags").doc(slug);
+
+      userData = {
+        account_no: accountNo,
+        username,
+        display_name: display_name || "New User",
+        unique_slug: slug,
+        primary_tag_slug: slug,
+        phone: "",
+        bio: "New profile",
+        avatar: "",
+        whatsapp: "",
+        email: "",
+        instagram: "",
+        x: "",
+        snapchat: "",
+        linkedin: "",
+        youtube: "",
+        website: "",
+        links: [],
+        products: [],
+        status: "active",
+        tag_count: 1,
+        tags: [slug],
+        old_usernames: [],
+        username_last_changed: 0,
+        analytics: createDefaultAnalytics(),
+        created_at: now
+      };
+
+      tagData = buildTagData({
+        serial: tagSerial,
+        slug,
+        category,
+        username,
+        accountNo,
+        now
+      });
 
-    await ref.set(userData);
+      transaction.set(counterRef, {
+        last_account_no: accountNo,
+        last_tag_serial: tagSerial,
+        last_order_no: Number(counters.last_order_no || 0),
+        updated_at: now
+      }, { merge: true });
+      transaction.set(ref, userData);
+      transaction.set(tagRef, tagData);
+    });
 
     return res.json({
       success: true,
-      user: userData
+      user: userData,
+      tag: tagData
     });
-
   } catch (err) {
+    return res.status(500).json({
+      error: err.message
+    });
+  }
+});
+
+/* -------------------------------
+   CREATE TAG FOR USER
+-------------------------------- */
+app.get("/create-tag", async (req, res) => {
+  try {
+    if (!requireDb(res)) {
+      return;
+    }
+
+    const username = cleanUsername(req.query.username);
+    const category = normalizeCategory(req.query.category || "I");
+
+    const validationError = usernameValidationError(username);
+
+    if (validationError) {
+      return res.json({
+        error: validationError
+      });
+    }
+
+    const userRef = db.collection("users").doc(username);
+    const userDoc = await userRef.get();
+
+    if (!userDoc.exists) {
+      return res.json({
+        error: "User not found"
+      });
+    }
+
+    const now = new Date().toISOString();
+    const counterRef = db.collection("counters").doc("global");
+    let tagData = null;
+
+    await db.runTransaction(async transaction => {
+      const counterDoc = await transaction.get(counterRef);
+      const transactionUserDoc = await transaction.get(userRef);
+
+      if (!transactionUserDoc.exists) {
+        throw new Error("User not found");
+      }
+
+      const counters = counterDoc.exists ? counterDoc.data() : {};
+      const user = transactionUserDoc.data();
+      const hasAccountNo = Number(user.account_no || 0) > 0;
+      const accountNo = hasAccountNo
+        ? Number(user.account_no)
+        : Number(counters.last_account_no || 0) + 1;
+      const tagSerial = Number(counters.last_tag_serial || 0) + 1;
+      const slug = createTagSlug(category, tagSerial);
+      const tagRef = db.collection("tags").doc(slug);
+
+      tagData = buildTagData({
+        serial: tagSerial,
+        slug,
+        category,
+        username,
+        accountNo,
+        now
+      });
+
+      transaction.set(counterRef, {
+        last_account_no: Math.max(Number(counters.last_account_no || 0), accountNo),
+        last_tag_serial: tagSerial,
+        last_order_no: Number(counters.last_order_no || 0),
+        updated_at: now
+      }, { merge: true });
+      transaction.set(tagRef, tagData);
+      transaction.update(userRef, {
+        account_no: accountNo,
+        tag_count: Number(user.tag_count || 0) + 1,
+        tags: admin.firestore.FieldValue.arrayUnion(slug),
+        updated_at: now
+      });
+    });
 
     return res.json({
+      success: true,
+      tag: tagData
+    });
+  } catch (err) {
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
+    const validationError = usernameValidationError(newUsername);
+
+    if (validationError) {
+      return res.json({
+        error: validationError,
+        suggestions: []
+      });
+    }
 
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
+      const suggestions = await getUsernameSuggestions(newUsername);
 
       return res.json({
-        error: "New username already taken"
+        available: false,
+        error: "New username already taken",
+        suggestions
       });
-
     }
 
-    // save history
-    oldUser.old_usernames.push(oldUser.username);
-
-    // update username
-    oldUser.username = cleanNew;
-
-    oldUser.username_last_changed = now;
+    const oldUsernames = Array.isArray(oldUser.old_usernames)
+      ? oldUser.old_usernames
+      : [];
 
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
+    analytics.link_clicks[button] = Number(analytics.link_clicks[button] || 0) + 1;
+    analytics.total_clicks += 1;
 
-    user.analytics.total_clicks += 1;
-
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
