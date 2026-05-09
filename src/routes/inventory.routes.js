const express = require("express");
const controller = require("../controllers/inventory.controller");
const { authenticate } = require("../middleware/auth");
const { requirePermission } = require("../middleware/rbac");
const { validate } = require("../middleware/validate");
const { asyncHandler } = require("../utils/asyncHandler");
const { manufactureSchema } = require("../validators/tag.schemas");

const router = express.Router();

router.get("/", authenticate, requirePermission("inventory:read"), asyncHandler(controller.list));
router.post("/manufacture", authenticate, requirePermission("inventory:write"), validate(manufactureSchema), asyncHandler(controller.manufacture));

module.exports = router;
