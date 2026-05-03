// GET by username (public URL)
router.get("/:username", async (req, res, next) => {
  try {
    const username = req.params.username;

    // 🔥 Step 1: Firestore query
    const snapshot = await getFromDB("profiles_by_username", username);

    if (!snapshot) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // 🔥 Step 2: actual profile fetch (using unique_slug)
    const profile = await getFromDB("profiles", snapshot.unique_slug);

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // 🔥 Step 3: clean response
    const { leads, ...publicProfile } = profile;

    return res.json(publicProfile);

  } catch (err) {
    next(err);
  }
});
