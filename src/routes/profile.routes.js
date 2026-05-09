const express = require("express");
const controller = require("../controllers/profile.controller");
const { asyncHandler } = require("../utils/asyncHandler");

const router = express.Router();

router.get("/:slug", asyncHandler(controller.getPublicProfile));

module.exports = router;
