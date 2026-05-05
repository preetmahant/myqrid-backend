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
   DYNAMIC USER ROUTE
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
