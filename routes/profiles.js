const express = require("express");
const router = express.Router();

const { customAlphabet } = require("nanoid");
const { saveToDB, getFromDB } = require("../lib/db");

const PROFILES = "profiles";

// 🔥 generators
const idGen = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);
const claimGen = customAlphabet("0123456789", 6);

// 🔥 CREATE TEST (FIRST)
router.get("/create-test", async (req, res) => {
  try {
    const username = "preetmahant";

    const unique_code = idGen();
    const claim_code = claimGen();

    const profile = {
      username,
      unique_code,
      claim_code,
      display_name: "Preet Mahant",
      phone: "9911684150",
      created_at: new Date().toISOString()
    };

    await saveToDB(PROFILES, unique_code, profile);

    await saveToDB("profiles_by_username", username, {
      unique_code
    });

    res.json({
      message: "Profile created",
      username,
      unique_code,
      claim_code
    });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 🔥 GET PROFILE (ALWAYS LAST)
router.get("/:username", async (req, res) => {
  try {
    const username = req.params.username;

    const mapping = await getFromDB("profiles_by_username", username);
    if (!mapping) return res.json({ error: "Profile not found" });

    const profile = await getFromDB(PROFILES, mapping.unique_code);
    if (!profile) return res.json({ error: "Profile not found" });

    const { claim_code, ...publicData } = profile;

    res.json(publicData);

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
