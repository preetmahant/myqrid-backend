const express = require("express");
const controller = require("../controllers/scan.controller");
const { validate } = require("../middleware/validate");
const { asyncHandler } = require("../utils/asyncHandler");
const { trackScanSchema } = require("../validators/scan.schemas");

const router = express.Router();

router.post("/track", validate(trackScanSchema), asyncHandler(controller.track));

module.exports = router;
