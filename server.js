diff --git a/server.js b/server.js
index 14055573b5a2d497ad1357d494a73228de79825a..f2f53609d5962ac15a3d54c881ab83273ec49690 100644
--- a/server.js
+++ b/server.js
@@ -1,64 +1,94 @@
 const express = require("express");
 const admin = require("firebase-admin");
 const cors = require("cors");
 
 const app = express();
 
 app.use(cors());
 app.use(express.json());
+app.use(express.static("public"));
 
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
+
+let db = null;
+
+if (hasFirebaseConfig) {
+  admin.initializeApp({
+    credential: admin.credential.cert({
+      projectId: process.env.FIREBASE_PROJECT_ID,
+
+      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
+
+      // 🔥 PRIVATE KEY WILL COME FROM RENDER ENV
+      // Render → Environment → FIREBASE_PRIVATE_KEY
+      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
+    })
+  });
+
+  db = admin.firestore();
+} else {
+  console.warn(
+    "Firebase credentials missing. Static frontend preview is available, but API routes need Firebase env vars."
+  );
+}
 
-    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
+function requireDb(res) {
+  if (db) {
+    return true;
+  }
 
-    // 🔥 PRIVATE KEY WILL COME FROM RENDER ENV
-    // Render → Environment → FIREBASE_PRIVATE_KEY
-    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
-  })
-});
+  res.status(503).json({
+    error: "Firebase is not configured on this environment"
+  });
 
-const db = admin.firestore();
+  return false;
+}
 
 /* -------------------------------
    TEST ROOT
 -------------------------------- */
 app.get("/", (req, res) => {
-  res.send("Server is running 🚀 Firebase Connected");
+  res.sendFile(__dirname + "/public/index.html");
 });
 
 /* -------------------------------
    CHECK USERNAME + SUGGESTIONS
 -------------------------------- */
 app.get("/check-username", async (req, res) => {
   try {
 
+    if (!requireDb(res)) {
+      return;
+    }
+
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
@@ -67,50 +97,54 @@ app.get("/check-username", async (req, res) => {
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
 
+    if (!requireDb(res)) {
+      return;
+    }
+
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
@@ -162,50 +196,54 @@ app.get("/create-user", async (req, res) => {
 
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
 
+    if (!requireDb(res)) {
+      return;
+    }
+
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
@@ -257,50 +295,54 @@ app.get("/change-username", async (req, res) => {
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
 
+    if (!requireDb(res)) {
+      return;
+    }
+
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
@@ -321,50 +363,54 @@ app.get("/track-click", async (req, res) => {
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
 
+    if (!requireDb(res)) {
+      return;
+    }
+
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
