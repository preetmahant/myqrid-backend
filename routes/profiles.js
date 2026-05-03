// 🔥 TEST ROUTE पहले आएगा
router.get("/test-create", async (req, res) => {
  const id = "test123";

  await saveToDB("profiles", id, {
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


// 🔥 फिर username वाला route
router.get("/:username", async (req, res) => {
  const username = req.params.username;

  const mapping = await getFromDB("profiles_by_username", username);
  if (!mapping) return res.json({ error: "Profile not found" });

  const profile = await getFromDB("profiles", mapping.unique_slug);
  if (!profile) return res.json({ error: "Profile not found" });

  res.json({
    ...profile,
    whatsappLink: buildWhatsAppLink(profile.phone),
  });
});
