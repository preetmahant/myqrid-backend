const express = require("express");
const router = express.Router();

const { customAlphabet } = require("nanoid");
const { saveToDB, getFromDB } = require("../lib/db");

const PROFILES = "profiles";

// 🔥 generators
const idGen = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);
const claimGen = customAlphabet("0123456789", 6);

// =============================
// ✅ CREATE TEST PROFILE
// =============================
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

      // 🔥 NEW FIELDS
      bio: "Digital Identity | myQRID",
      avatar: "",

      links: [
        { title: "WhatsApp", type: "whatsapp" },
        { title: "Call", type: "call" }
      ],

      items: [],

      products: [
        { name: "ReturnMe Tag" },
        { name: "HelpMe Band" },
        { name: "Pet Tag" },
        { name: "Smart Pet Tag" },
        { name: "Wallet QR Card" }
      ],

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

// =============================
// ✅ ADD LINK
// =============================
router.get("/add-link", async (req, res) => {
  try {
    const { username, title, type } = req.query;

    const mapping = await getFromDB("profiles_by_username", username);
    const profile = await getFromDB(PROFILES, mapping.unique_code);

    profile.links.push({ title, type });

    await saveToDB(PROFILES, mapping.unique_code, profile);

    res.json({ message: "Link added" });

  } catch (err) {
    res.json({ error: "Error adding link" });
  }
});

// =============================
// ✅ ADD ITEM
// =============================
router.get("/add-item", async (req, res) => {
  try {
    const { username, name } = req.query;

    const mapping = await getFromDB("profiles_by_username", username);
    const profile = await getFromDB(PROFILES, mapping.unique_code);

    profile.items.push({
      id: Date.now(),
      name,
      status: "safe"
    });

    await saveToDB(PROFILES, mapping.unique_code, profile);

    res.json({ message: "Item added" });

  } catch (err) {
    res.json({ error: "Error adding item" });
  }
});

// =============================
// ✅ MARK LOST
// =============================
router.get("/mark-lost", async (req, res) => {
  try {
    const { username, itemId } = req.query;

    const mapping = await getFromDB("profiles_by_username", username);
    const profile = await getFromDB(PROFILES, mapping.unique_code);

    profile.items = profile.items.map(i => {
      if (i.id == itemId) {
        i.status = "lost";
      }
      return i;
    });

    await saveToDB(PROFILES, mapping.unique_code, profile);

    res.json({ message: "Item marked lost" });

  } catch (err) {
    res.json({ error: "Error marking lost" });
  }
});

// =============================
// ✅ GET PROFILE
// =============================
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
