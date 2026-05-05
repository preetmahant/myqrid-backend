app.get("/:username", async (req, res) => {
  try {
    const username = req.params.username.toLowerCase();

    const mapping = await getFromDB("profiles_by_username", username);

    if (!mapping) {
      return res.json({ error: "Profile not found" });
    }

    const profile = await getFromDB("profiles", mapping.unique_code);

    if (!profile) {
      return res.json({ error: "Profile not found" });
    }

    // 🔥 analytics (view count)
    if (!profile.views) profile.views = 0;
    profile.views += 1;

    await saveToDB("profiles", mapping.unique_code, profile);

    const { claim_code, ...publicData } = profile;

    res.json(publicData);

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
