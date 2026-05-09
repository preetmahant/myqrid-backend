const express = require(
  "express"
);

const controller = require(
  "../controllers/order.controller"
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
  validate
} = require(
  "../middleware/validate"
);

const {
  asyncHandler
} = require(
  "../utils/asyncHandler"
);

const {
  createOrderSchema
} = require(
  "../validators/order.schemas"
);

const router =
  express.Router();

router.get(
  "/",

  authenticate,

  requirePermission(
    "orders:read"
  ),

  asyncHandler(
    controller.list
  )
);

router.post(
  "/",

  authenticate,

  requirePermission(
    "orders:create"
  ),

  validate(
    createOrderSchema
  ),

  asyncHandler(
    controller.create
  )
);

module.exports = router;
