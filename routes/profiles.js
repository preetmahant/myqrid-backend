const express = require("express");

const { generateId } = require("../lib/id");
const { generateQrDataUrl } = require("../lib/qr");
const { buildWhatsAppLink } = require("../lib/whatsapp");
const {
  saveToDB,
  getFromDB,
  updateInDB,
  pushToDB,
} = require("../lib/db");

const router = express.Router();

const PROFILES = "profiles";

// 🔥 CREATE PROFILE
router.post("/create", async (req, res, next) => {
  try {
    const { name, phone, username } = req.body || {};

    if (!name || !phone || !username) {
      return res.status(400).json({ error: "name, phone, username required" });
    }

    const id = generateId();
    const unique_slug = `${username}-${id.toLowerCase()}`;
    const now = new Date().toISOString();

    const profile = {
      id,
      username,
      unique_slug,
      display_name: name,
      phone,
      mode: "identity",
      leads: [],
      created_at: now,
      updated_at: now,
    };

    // save main profile
    await saveToDB(PROFILES, unique_slug, profile);

    // save username mapping
    await saveToDB("profiles_by_username", username, {
      unique_slug,
    });

    const profileUrl = buildProfileUrl(req, username);
    const qrDataUrl = await generateQrDataUrl(profileUrl);

    return res.status(201).json({
      username,
      unique_slug,
      profileUrl,
      qrDataUrl,
      whatsappLink: buildWhatsAppLink(phone),
    });
  } catch (err) {
    next(err);
  }
});

// 🔥 GET PROFILE BY USERNAME (MAIN LOGIC)
router.get("/:username", async (req, res, next) => {
  try {
    const username = req.params.username;

    // 1. find mapping
    const mapping = await getFromDB("profiles_by_username", username);
    if (!mapping) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // 2. fetch actual profile
    const profile = await getFromDB(PROFILES, mapping.unique_slug);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const { leads, ...publicProfile } = profile;

    return res.json({
      ...publicProfile,
      whatsappLink: buildWhatsAppLink(profile.phone),
    });
  } catch (err) {
    next(err);
  }
});

// 🔥 UPDATE MODE (identity / lost)
router.put("/mode/:username", async (req, res, next) => {
  try {
    const username = req.params.username;
    const { mode } = req.body;

    if (!["identity", "lost"].includes(mode)) {
      return res.status(400).json({ error: "invalid mode" });
    }

    const mapping = await getFromDB("profiles_by_username", username);
    if (!mapping) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const updated = await updateInDB(PROFILES, mapping.unique_slug, {
      mode,
      updated_at: new Date().toISOString(),
    });

    return res.json({ username, mode: updated.mode });
  } catch (err) {
    next(err);
  }
});

// 🔥 LEAD CAPTURE
router.post("/lead/:username", async (req, res, next) => {
  try {
    const username = req.params.username;

    const mapping = await getFromDB("profiles_by_username", username);
    if (!mapping) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const lead = {
      at: new Date().toISOString(),
      source: req.body?.source || "qr",
      message: req.body?.message || "",
      contact: req.body?.contact || "",
      ip: req.ip,
    };

    await pushToDB(PROFILES, mapping.unique_slug, "leads", lead);

    return res.status(201).json({ username, lead });
  } catch (err) {
    next(err);
  }
});

// helper
function buildProfileUrl(req, username) {
  const base =
    process.env.PUBLIC_BASE_URL ||
    `${req.protocol}://${req.get("host")}`;
  return `${base}/${username}`;
}

module.exports = router;
