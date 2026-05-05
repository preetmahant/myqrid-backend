router.get("/:username", (req, res) => {
  try {
    const username = req.params.username;

    // 🔥 TEMP STATIC DATA (for testing)
    if (username === "preetmahant") {
      return res.json({
        username: "preetmahant",
        display_name: "Preet Mahant",
        phone: "9911684150",
        bio: "Digital Identity | myQRID",
        avatar: "",
        links: [],
        items: [],
        products: []
      });
    }

    return res.json({ error: "Profile not found" });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
