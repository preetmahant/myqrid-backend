const express = require("express");

const app = express();

/* -------------------------------
   TEST ROOT
-------------------------------- */
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

/* -------------------------------
   TEMP USERS DATA (simulate DB)
-------------------------------- */
const users = {
  preetmahant: {
    username: "preetmahant",
    display_name: "Preet Mahant",
    phone: "9911684150",
    bio: "Digital Identity | myQRID",
    old_usernames: [],
    username_last_changed: 0
  },

  testuser: {
    username: "testuser",
    display_name: "Test User",
    phone: "9999999999",
    bio: "Hello world",
    old_usernames: [],
    username_last_changed: 0
  }
};

/* -------------------------------
   CHECK USERNAME + SUGGESTIONS
-------------------------------- */
app.get("/check-username", (req, res) => {
  const username = req.query.username;

  if (!username) {
    return res.json({ error: "Username required" });
  }

  const clean = username.toLowerCase();

  if (!users[clean]) {
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

  suggestions = suggestions.filter(s => !users[s]);

  res.json({
    available: false,
    suggestions: suggestions.slice(0, 5)
  });
});

/* -------------------------------
   CREATE USER
-------------------------------- */
app.get("/create-user", (req, res) => {
  const username = req.query.username;
  const display_name = req.query.display_name;

  if (!username) {
    return res.json({ error: "Username required" });
  }

  const cleanUsername = username.toLowerCase();

  if (users[cleanUsername]) {
    return res.json({
      error: "Username already taken"
    });
  }

  users[cleanUsername] = {
    username: cleanUsername,
    display_name: display_name || "New User",
    phone: "",
    bio: "New profile",
    old_usernames: [],
    username_last_changed: 0
  };

  res.json({
    success: true,
    user: users[cleanUsername]
  });
});

/* -------------------------------
   CHANGE USERNAME (30 DAYS RULE)
-------------------------------- */
app.get("/change-username", (req, res) => {
  const current = req.query.current;
  const newUsername = req.query.new;

  if (!current || !newUsername) {
    return res.json({ error: "Current & new username required" });
  }

  const oldUser = users[current.toLowerCase()];

  if (!oldUser) {
    return res.json({ error: "User not found" });
  }

  const now = Date.now();
  const lastChanged = oldUser.username_last_changed || 0;

  const diffDays = (now - lastChanged) / (1000 * 60 * 60 * 24);

  if (diffDays < 30) {
    return res.json({
      error: "Username can be changed only after 30 days"
    });
  }

  const cleanNew = newUsername.toLowerCase();

  if (users[cleanNew]) {
    return res.json({
      error: "New username already taken"
    });
  }

  // history save
  oldUser.old_usernames.push(oldUser.username);

  // remove old
  delete users[oldUser.username];

  // update
  oldUser.username = cleanNew;
  oldUser.username_last_changed = now;

  users[cleanNew] = oldUser;

  res.json({
    success: true,
    new_username: cleanNew
  });
});

/* -------------------------------
   DYNAMIC USER ROUTE (LAST)
-------------------------------- */
app.get("/:username", (req, res) => {
  const username = req.params.username.toLowerCase();

  const user = users[username];

  if (!user) {
    return res.json({ error: "Profile not found" });
  }

  res.json(user);
});

/* -------------------------------
   SERVER START
-------------------------------- */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
