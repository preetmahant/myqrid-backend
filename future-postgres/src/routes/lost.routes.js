const express = require(
  "express"
);

const controller = require(
  "../controllers/lost-found.controller"
);

const {
  asyncHandler
} = require(
  "../utils/asyncHandler"
);

const router =
  express.Router();

router.post(
  "/report",

  asyncHandler(
    controller.report
  )
);

module.exports = router;
