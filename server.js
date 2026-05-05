const express = require("express");

const app = express();

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// TEST USER ROUTE
app.get("/preetmahant", (req, res) => {
  res.json({
    username: "preetmahant",
    display_name: "Preet Mahant",
    phone: "9911684150",
    bio: "Digital Identity | myQRID"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
