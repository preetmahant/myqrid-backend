const express = require(
  "express"
);

const controller = require(
  "../controllers/subscription.controller"
);

const {
  authenticate
} = require(
  "../middleware/authenticate"
);

const {
  requirePermission
} = require(
  "../middleware/rbac"
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

  requirePermission(
    "subscriptions:read"
  ),

  asyncHandler(
    controller.list
  )
);

router.post(
  "/",

  authenticate,

  requirePermission(
    "subscriptions:write"
  ),

  asyncHandler(
    controller.create
  )
);

module.exports = router;
