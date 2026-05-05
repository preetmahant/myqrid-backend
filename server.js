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
    bio: "Digital Identity | myQRID"
  },

  testuser: {
    username: "testuser",
    display_name: "Test User",
    phone: "9999999999",
    bio: "Hello world"
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

  // ✅ available
  if (!users[clean]) {
    return res.json({
      available: true,
      suggestions: []
    });
  }

  // ❌ taken → suggestions
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
   CREATE USER (STRICT - NO AUTO)
-------------------------------- */
app.get("/create-user", (req, res) => {
  const username = req.query.username;
  const display_name = req.query.display_name;

  if (!username) {
    return res.json({ error: "Username required" });
  }

  const cleanUsername = username.toLowerCase();

  // ❌ अगर already है
  if (users[cleanUsername]) {
    return res.json({
      error: "Username already taken"
    });
  }

  // ✅ create
  users[cleanUsername] = {
    username: cleanUsername,
    display_name: display_name || "New User",
    phone: "",
    bio: "New profile"
  };

  res.json({
    success: true,
    user: users[cleanUsername]
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
