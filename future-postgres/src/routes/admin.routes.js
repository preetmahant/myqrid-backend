const express = require(
  "express"
);

const controller = require(
  "../controllers/admin.controller"
);

const {
  authenticate
} = require(
  "../middleware/authenticate"
);

const {
  requireRole
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
  "/dashboard",

  authenticate,

  requireRole(
    "super_admin",
    "admin",
    "support",
    "franchise",
    "enterprise"
  ),

  asyncHandler(
    controller.dashboard
  )
);

module.exports = router;
