const express = require(
  "express"
);

const controller = require(
  "../controllers/emergency.controller"
);

const {
  asyncHandler
} = require(
  "../utils/asyncHandler"
);

const router =
  express.Router();

router.post(
  "/alerts",

  asyncHandler(
    controller.alert
  )
);

module.exports = router;
