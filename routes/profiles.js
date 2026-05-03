const express = require("express");
const router = express.Router();

const {
  getFromDB
} = require("../lib/db");

// 🔥 GET by username (public URL)
router.get("/:username", async (req, res, next) => {
  try {
    const username = req.params.username;

    // 1️⃣ username → mapping lookup
    const mapping = await getFromDB("profiles_by_username", username);

    if (!mapping) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // 2️⃣ unique_slug → actual profile
    const profile = await getFromDB("profiles", mapping.unique_slug);

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // 3️⃣ public response (leads hide)
    const { leads, ...publicProfile } = profile;

    return res.json(publicProfile);

  } catch (err) {
    next(err);
  }
});

module.exports = router;
