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
router.post("/create", async (req, res) => {
  const { name, phone, username } = req.body || {};

  if (!name || !phone || !username) {
    return res.json({ error: "name, phone, username required" });
  }

  const id = generateId();
  const unique_slug = `${username}-${id.toLowerCase()}`;

  const profile = {
    id,
    username,
    unique_slug,
    display_name: name,
    phone,
    mode: "identity",
    leads: [],
  };

  await saveToDB(PROFILES, unique_slug, profile);
  await saveToDB("profiles_by_username", username, { unique_slug });

  const profileUrl = `${req.protocol}://${req.get("host")}/${username}`;
  const qrDataUrl = await generateQrDataUrl(profileUrl);

  res.json({
    username,
    unique_slug,
    profileUrl,
    qrDataUrl,
    whatsappLink: buildWhatsAppLink(phone),
  });
});

// 🔥 GET PROFILE
router.get("/:username", async (req, res) => {
  const username = req.params.username;

  const mapping = await getFromDB("profiles_by_username", username);
  if (!mapping) return res.json({ error: "Profile not found" });

  const profile = await getFromDB(PROFILES, mapping.unique_slug);
  if (!profile) return res.json({ error: "Profile not found" });

  res.json({
    ...profile,
    whatsappLink: buildWhatsAppLink(profile.phone),
  });
});

// 🔥 TEST ROUTE
router.get("/test-create", async (req, res) => {
  const id = "test123";

  await saveToDB(PROFILES, id, {
    id,
    username: "test",
    display_name: "Test User",
    phone: "9999999999",
  });

  await saveToDB("profiles_by_username", "test", {
    unique_slug: id,
  });

  res.json({ message: "Test created" });
});

module.exports = router;
