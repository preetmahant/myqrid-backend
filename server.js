const express = require("express");
const cors = require("cors");

const profilesRouter = require("./routes/profiles");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", app: "myQRID" });
});

// Routes
app.use("/", profilesRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 myQRID backend running on port ${PORT}`);
});
