const express = require("express");
const admin = require("firebase-admin");

const app = express();

/* -------------------------------
   FIREBASE INIT
-------------------------------- */
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: "myqrid-6f1ab",
    clientEmail: "firebase-adminsdk-fbsvc@myqrid-6f1ab.iam.gserviceaccount.com",
    privateKey: "\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC1fzhWw6Xg50KE\nXIE7hT2Jlumj5AbIW0Vz51DuQ8XWW3aNXWyvSJ6F0V8cWxPhDf7DJG6SvNvccmuW\ncOKBimxURtLITPTA5alsQvr+OA05UC0HcxmIURIbkd3rbgZcUM2EI4MutlqfTl10\nIFA2kmp4EUlVZ0nn+wfcpOsxW0RXlBlMOPlAB8m9R9p19deYsftmb2sDoj+P3Zw8\n01ivkiwsgA2bVYcabF2m8J8TjtNql+zZT4xsMFpDWu9UirqTwRQDsxBPrkPBNjTT\nSkGV6nVfb4S1Y8RGxWkw5i6ssGJmxSOR9IEv7sQpjUPbVPYrwMbsJwjRol8xwKJ6\nH7wC7PyZAgMBAAECggEACOn4Z6SAyWC6TttnOnfjC5amn3bD0YPQD6749dbMyOgh\nlLRVse8wX/SmRfOAMLG6BTYNGzZc2wEgoRkmusOEagg3coB7Fd1BurA4eRNiLOIv\n7/l6c8w9hi6eFmHHPLH4QgjneLwai8/yvZEXt3Jt+bspnaDuy46z9mWAKqKnouBt\nRvOCWsYn/1mDOigDCh33HDF6pLsn2x5EXnYEtKpsYcXjN4t0O9U+g15v0zfoCQOM\nh+5B4/8JLI3CAVF70nedh/X9Dec9H6ZYxhKIakgq0nkhNneSrWr3CqS1wBIgK6j1\nk4v3uiQ0fGdh/cabD9A4RuumckQWrONZ+0/c+PyYPQKBgQDcTlvzKkZ+/qNYHMtf\nhDIbxw322XU8z2gWqA7wVVKn6zom6DXZQ6iyLKTo1mDu2ZVTOeGT+Dr2HawYbYmD\ng2lFDiM2G+SwLTX0YKua3c11VK0G3FyoxAQZTvkC8YtrBG3N514XxaPD9J3gCAe3\n4zhYJC+4FwOwtSTqmU0bR/AnDQKBgQDS5yxk7TY0iMwcaX25vrjDE8BuKcEdsSis\nUN/BCcTzcp9Ra3hMKxJ14fjmzVDyeKqDPE6rEOy6dE7HEaz1IlKZXf0NIe2498xx\nAnjp0iJcRTiVs0QjZ730eC+XFF8bOzM6L9fdyN1A8FPenP4AJ2J3zAxIe+ePLA7f\nu0uJYRbIvQKBgQCWS4cDX2X0oXeCVzKPmTouJSBrtXL752tVeZWndC4NjLaBcI28\nCSJ/W2GtzwMWL65ltukj74cZ/Kg5ihD0faRFjh2LfoAHiPB0Jbcs0gCm+PuJ4K/+\nGqvJME1FKtA4VC8s95kDkrvkpW9HNXM+im8YAqfjaSAFX68ttSQbZnp5yQKBgQC7\nK3JYt7StduI+LNjpaXurlPHoUqISadFA7B1HwhXKQGVn6sq+PlOJztwIaRp3teMN\nyQ2//6s35lSrkuI+QxGvDpyvdPb2euQzPxBz4ouf+8a2BHxqN317YtZJbEjjb+yM\nrT0UlVjWcvLb09QP6uQWkT4tbdkZVO52XFAzQbjouQKBgGeGkP8ECMn280XZfv3p\nsHELYvEC/LTVp0Vj5CBuq1HNChYIgqYI1xlIhzpewIi1CFk6FSdEUVSyRF398jw/\nKuEF1PrGOZ7fBjZMgF5AQUArUNot4LgoLxKapabdVfTLXxT7ya1ilsWp0DzeOXak\nTscVPpi3vMMqjmmVS/a8gdTX\n-".replace(/\\n/g, '\n')
  })
});

const db = admin.firestore();

/* -------------------------------
   TEST ROOT
-------------------------------- */
app.get("/", (req, res) => {
  res.send("Server is running 🚀 (Firebase Connected)");
});

/* -------------------------------
   CHECK USERNAME + SUGGESTIONS
-------------------------------- */
app.get("/check-username", async (req, res) => {
  const username = req.query.username;

  if (!username) {
    return res.json({ error: "Username required" });
  }

  const clean = username.toLowerCase();

  const doc = await db.collection("users").doc(clean).get();

  if (!doc.exists) {
    return res.json({
      available: true,
      suggestions: []
    });
  }

  let suggestions = [
    "the" + clean,
    "my" + clean,
    clean + "official",
    clean + "live",
    clean + Math.floor(Math.random() * 1000)
  ];

  res.json({
    available: false,
    suggestions: suggestions.slice(0, 5)
  });
});

/* -------------------------------
   CREATE USER
-------------------------------- */
app.get("/create-user", async (req, res) => {
  const username = req.query.username;
  const display_name = req.query.display_name;

  if (!username) {
    return res.json({ error: "Username required" });
  }

  const cleanUsername = username.toLowerCase();

  const ref = db.collection("users").doc(cleanUsername);
  const existing = await ref.get();

  if (existing.exists) {
    return res.json({
      error: "Username already taken"
    });
  }

  const userData = {
    username: cleanUsername,
    display_name: display_name || "New User",
    phone: "",
    bio: "New profile",
    old_usernames: [],
    username_last_changed: 0,

    analytics: {
      views: 0,
      clicks: {},
      last_seen: null,
      is_online: false
    }
  };

  await ref.set(userData);

  res.json({
    success: true,
    user: userData
  });
});

/* -------------------------------
   CHANGE USERNAME (30 DAYS RULE)
-------------------------------- */
app.get("/change-username", async (req, res) => {
  const current = req.query.current;
  const newUsername = req.query.new;

  if (!current || !newUsername) {
    return res.json({ error: "Current & new username required" });
  }

  const oldRef = db.collection("users").doc(current.toLowerCase());
  const oldDoc = await oldRef.get();

  if (!oldDoc.exists) {
    return res.json({ error: "User not found" });
  }

  const oldUser = oldDoc.data();

  const now = Date.now();
  const lastChanged = oldUser.username_last_changed || 0;

  const diffDays = (now - lastChanged) / (1000 * 60 * 60 * 24);

  if (diffDays < 30) {
    return res.json({
      error: "Username can be changed only after 30 days"
    });
  }

  const cleanNew = newUsername.toLowerCase();

  const newRef = db.collection("users").doc(cleanNew);
  const newDoc = await newRef.get();

  if (newDoc.exists) {
    return res.json({
      error: "New username already taken"
    });
  }

  // history save
  oldUser.old_usernames.push(oldUser.username);

  // update
  oldUser.username = cleanNew;
  oldUser.username_last_changed = now;

  await newRef.set(oldUser);
  await oldRef.delete();

  res.json({
    success: true,
    new_username: cleanNew
  });
});

/* -------------------------------
   DYNAMIC USER ROUTE (LAST)
-------------------------------- */
app.get("/:username", async (req, res) => {
  const username = req.params.username.toLowerCase();

  const ref = db.collection("users").doc(username);
  const doc = await ref.get();

  if (!doc.exists) {
    return res.json({ error: "Profile not found" });
  }

  const user = doc.data();

  // 🔥 analytics update
  user.analytics.views += 1;
  user.analytics.last_seen = new Date().toISOString();
  user.analytics.is_online = true;

  await ref.update({ analytics: user.analytics });

  res.json(user);
});

/* -------------------------------
   SERVER START
-------------------------------- */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
