const express = require(
  "express"
);

const controller = require(
  "../controllers/tag.controller"
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
  createTagSchema
} = require(
  "../validators/tag.schemas"
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

router.post(
  "/",

  authenticate,

  requirePermission(
    "tags:create"
  ),

  validate(
    createTagSchema
  ),

  asyncHandler(
    controller.create
  )
);

router.get(
  "/:slug",

  asyncHandler(
    controller.getBySlug
  )
);

router.patch(
  "/:id/mode",

  authenticate,

  requirePermission(
    "tags:update"
  ),

  asyncHandler(
    controller.updateMode
  )
);

module.exports = router;
