const express = require(
  "express"
);

const authRoutes = require(
  "./auth.routes"
);

const tagRoutes = require(
  "./tag.routes"
);

const profileRoutes = require(
  "./profile.routes"
);

const inventoryRoutes = require(
  "./inventory.routes"
);

const orderRoutes = require(
  "./order.routes"
);

const productRoutes = require(
  "./product.routes"
);

const subscriptionRoutes = require(
  "./subscription.routes"
);

const scanRoutes = require(
  "./scan.routes"
);

const adminRoutes = require(
  "./admin.routes"
);

const deviceRoutes = require(
  "./device.routes"
);

const notificationRoutes = require(
  "./notification.routes"
);

const lostRoutes = require(
  "./lost.routes"
);

const emergencyRoutes = require(
  "./emergency.routes"
);

const uploadRoutes = require(
  "./upload.routes"
);

const router =
  express.Router();

router.use(
  "/auth",
  authRoutes
);

router.use(
  "/tags",
  tagRoutes
);

router.use(
  "/profiles",
  profileRoutes
);

router.use(
  "/inventory",
  inventoryRoutes
);

router.use(
  "/orders",
  orderRoutes
);

router.use(
  "/products",
  productRoutes
);

router.use(
  "/subscriptions",
  subscriptionRoutes
);

router.use(
  "/scans",
  scanRoutes
);

router.use(
  "/admin",
  adminRoutes
);

router.use(
  "/devices",
  deviceRoutes
);

router.use(
  "/notifications",
  notificationRoutes
);

router.use(
  "/lost",
  lostRoutes
);

router.use(
  "/emergency",
  emergencyRoutes
);

router.use(
  "/uploads",
  uploadRoutes
);

module.exports = router;
