const express = require(
  "express"
);

const controller = require(
  "../controllers/notification.controller"
);

const {
  authenticate
} = require(
  "../middleware/authenticate"
);

const {
  asyncHandler
} = require(
  "../utils/asyncHandler"
);

const router =
  express.Router();

router.get(
  "/",

  authenticate,

  asyncHandler(
    controller.list
  )
);

module.exports = router;
