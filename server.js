const express = require("express");
const cors = require("cors");

const profilesRouter = require("./routes/profiles");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// Routes
app.use("/", profilesRouter);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: "Not Found", path: req.path });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error("[error]", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`myQRID backend running on port ${PORT}`);
});

module.exports = app;
