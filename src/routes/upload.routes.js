const express = require("express");
const controller = require("../controllers/upload.controller");
const { authenticate } = require("../middleware/auth");
const { asyncHandler } = require("../utils/asyncHandler");

const router = express.Router();

router.post("/files", authenticate, asyncHandler(controller.createFileRecord));

module.exports = router;
