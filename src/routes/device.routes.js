const express = require("express");
const controller = require("../controllers/device.controller");
const { authenticate } = require("../middleware/auth");
const { requirePermission } = require("../middleware/rbac");
const { asyncHandler } = require("../utils/asyncHandler");

const router = express.Router();

router.get("/", authenticate, requirePermission("devices:read"), asyncHandler(controller.list));
router.post("/", authenticate, requirePermission("devices:write"), asyncHandler(controller.create));

module.exports = router;
