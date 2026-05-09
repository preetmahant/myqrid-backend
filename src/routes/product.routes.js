const express = require("express");
const controller = require("../controllers/product.controller");
const { authenticate } = require("../middleware/auth");
const { requirePermission } = require("../middleware/rbac");
const { asyncHandler } = require("../utils/asyncHandler");

const router = express.Router();

router.get("/", asyncHandler(controller.list));
router.post("/", authenticate, requirePermission("products:write"), asyncHandler(controller.create));

module.exports = router;
