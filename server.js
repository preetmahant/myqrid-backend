const express = require("express");
const path = require("path");
const admin = require("firebase-admin");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"), { index: false }));

/* -------------------------------
   FIREBASE INIT
-------------------------------- */
const hasFirebaseConfig =
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY;

let db = null;
let firebaseInitError = null;

function normalizePrivateKey(privateKey) {
  return String(privateKey || "")
    .replace(/^"|"$/g, "")
    .replace(/\\n/g, "\n");
}

if (hasFirebaseConfig) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY)
      })
    });

    db = admin.firestore();
  } catch (err) {
    firebaseInitError = err.message;
    console.error("Firebase init failed:", err.message);
    console.error(
      "Server will keep running for / and /health. Fix Firebase env vars on Render for API routes."
    );
  }
} else {
  console.warn(
    "Firebase credentials missing. Static frontend preview is available, but API routes need Firebase env vars."
  );
}

function requireDb(res) {
  if (db) {
    return true;
  }

  res.status(503).json({
    error: "Firebase is not configured on this environment"
  });

  return false;
}

function requireSetupAccess(req, res) {
  const setupSecret = process.env.SETUP_SECRET;
  const providedSecret = req.query.key || req.get("x-setup-key");

  if (!setupSecret) {
    res.status(503).json({
      error: "SETUP_SECRET is not configured. Add it to Render before using admin setup URLs."
    });
    return false;
  }

  if (providedSecret !== setupSecret) {
    res.status(403).json({
      error: "Invalid setup key"
    });
    return false;
  }

  return true;
}

function cleanUsername(username) {
  return String(username || "")
    .trim()
    .toLowerCase()
    .replace(/^@/, "");
}

function isValidUsername(username) {
  return /^[a-z0-9_]{3,30}$/.test(username) && !username.startsWith("_") && !username.endsWith("_");
}

function usernameValidationError(username) {
  if (!username) {
    return "Username required";
  }

  if (!isValidUsername(username)) {
    return "Username can use only letters, numbers and underscore. No dots or special characters. Length must be 3-30 characters.";
  }

  return null;
}

function buildSuggestionSeeds(username) {
  const currentYear = new Date().getFullYear();
  return [
    "the" + username,
    username + "live",
    username + "_official",
    username + "_now",
    "my" + username,
    username + "hq",
    username + "online",
    username + "india",
    username + currentYear,
    username + Math.floor(100 + Math.random() * 900)
  ];
}

async function getUsernameSuggestions(username, limit = 5) {
  const suggestions = [];
  const seen = new Set([username]);

  for (const seed of buildSuggestionSeeds(username)) {
    const suggestion = cleanUsername(seed);

    if (!isValidUsername(suggestion) || seen.has(suggestion)) {
      continue;
    }

    seen.add(suggestion);

    const doc = await db.collection("users").doc(suggestion).get();
    if (!doc.exists) {
      suggestions.push(suggestion);
    }

    if (suggestions.length >= limit) {
      break;
    }
  }

  return suggestions;
}

const TAG_CATEGORIES = {
  I: "Identity",
  P: "Pet",
  A: "Asset",
  B: "Business",
  S: "Safety",
  G: "Group"
};

function normalizeCategory(category) {
  const cleanCategory = String(category || "I").trim().toUpperCase();
  return TAG_CATEGORIES[cleanCategory] ? cleanCategory : "I";
}

function formatSerial(serial) {
  return String(serial).padStart(6, "0");
}

function createTagSlug(category, serial) {
  return `${normalizeCategory(category)}-${formatSerial(serial)}`;
}

function createClaimCode(serial) {
  return "MQ-" + formatSerial(serial);
}

function buildTagData({ serial, slug, category, username, accountNo, now, status = "active" }) {
  return {
    serial_no: serial,
    slug,
    category,
    category_name: TAG_CATEGORIES[category],
    owner_username: username,
    owner_account_no: accountNo,
    status,
    privacy: "public",
    claim_code: createClaimCode(serial),
    created_at: now,
    activated_at: now,
    total_scans: 0,
    last_scan_at: null
  };
}

function createDefaultAnalytics() {
  return {
    total_views: 0,
    total_clicks: 0,
    last_seen: null,
    is_online: false,
    profile_opens: [],
    link_clicks: {}
  };
}

function normalizeAnalytics(analytics) {
  const defaults = createDefaultAnalytics();
  const safeAnalytics = analytics && typeof analytics === "object" ? analytics : {};

  return {
    ...defaults,
    ...safeAnalytics,
    total_views: Number(safeAnalytics.total_views || 0),
    total_clicks: Number(safeAnalytics.total_clicks || 0),
    profile_opens: Array.isArray(safeAnalytics.profile_opens)
      ? safeAnalytics.profile_opens
      : [],
    link_clicks:
      safeAnalytics.link_clicks && typeof safeAnalytics.link_clicks === "object"
        ? safeAnalytics.link_clicks
        : {}
  };
}

/* -------------------------------
   FRONTEND ROOT
-------------------------------- */
app.get(["/", "/web-mvp"], (req, res) => {
  res.sendFile(path.join(__dirname, "public", "web-mvp.html"));
});

app.get(["/u/:username", "/t/:slug"], (req, res) => {
  res.sendFile(path.join(__dirname, "public", "web-mvp.html"));
});

app.get("/profile-demo", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* -------------------------------
   HEALTH CHECK
-------------------------------- */
app.get("/health", (req, res) => {
  res.json({
    success: true,
    firebase_configured: Boolean(db),
    firebase_error: firebaseInitError,
    message: db
      ? "Server is running 🚀 Firebase Connected"
      : "Server is running 🚀 Firebase not configured"
  });
});

/* -------------------------------
   SIMPLE OWNER DB EXPLAINER
-------------------------------- */
app.get("/admin/db-help", (req, res) => {
  res.json({
    question: "What did this update do?",
    short_answer: "It added safe URLs to check and prepare your Firestore database for myQRID accounts, QR tags, plans and future business features.",
    should_i_update_code: "Yes. Deploy this backend code first, then add SETUP_SECRET in Render, then open the setup/status URLs.",
    what_you_get_now: [
      "A health check at /health",
      "A protected DB status check at /admin/db-status?key=YOUR_SETUP_SECRET",
      "A protected one-click DB setup URL at /admin/setup-db?key=YOUR_SETUP_SECRET",
      "A protected manufactured tag generator at /admin/create-manufactured-tags?key=YOUR_SETUP_SECRET",
      "A protected tag inventory table API at /admin/tag-inventory?key=YOUR_SETUP_SECRET",
      "User/profile creation with /create-user",
      "Extra QR/tag creation with /create-tag",
      "Basic profile views, geo/device/conversion-ready analytics schemas"
    ],
    db_status_meaning: {
      ready_true: "Your core Firestore documents exist and the MVP database setup is ready.",
      ready_false: "Some core documents are missing. Open /admin/setup-db with your setup key.",
      ready_score: "Percentage of required core documents found in Firestore.",
      missing_required: "Exact document paths that still need to be created."
    },
    core_db_documents: [
      "counters/global: serial numbers for accounts, QR tags and orders",
      "users/{username}: profile, links, products, tags and summary analytics",
      "tags/{slug}: every QR tag and its owner/status",
      "settings/business: brand, support, currency and public URL",
      "plans/free, plans/pro, plans/business: package limits and features",
      "pages/activate: activation page content",
      "tag_inventory/{tag_number}: manufactured tags, activation status and warehouse stock",
      "catalog_categories/{category}: mini store, helmet catalog, NFC products and affiliate marketplace",
      "settings/analytics: geo, scan location, device and conversion analytics modules",
      "settings/frontend: modular, reusable and category-driven rendering config"
    ],
    what_db_can_power_next: [
      "Tag number inventory and warehouse stock",
      "Mini store, helmet catalog, NFC products and affiliate marketplace",
      "Orders and payments",
      "Subscriptions and renewals",
      "Lead capture and CRM export",
      "Geo, scan location, device and conversion analytics",
      "Bulk QR tags for business accounts",
      "Coupons, referrals and campaign tracking"
    ],
    easiest_steps: [
      "Deploy this code.",
      "In Render, add SETUP_SECRET as a long private password.",
      "Open /admin/db-help to read this guide anytime.",
      "Open /admin/db-status?key=YOUR_SETUP_SECRET to check status.",
      "If ready is false, open /admin/setup-db?key=YOUR_SETUP_SECRET once.",
      "Open /admin/db-status?key=YOUR_SETUP_SECRET again and confirm ready is true."
    ]
  });
});

/* -------------------------------
   DATABASE STATUS + SAFE SETUP
-------------------------------- */
const REQUIRED_DOCS = [
  { collection: "counters", id: "global", purpose: "Keeps account, tag and order serial numbers unique." },
  { collection: "settings", id: "business", purpose: "Stores public business configuration for myQRID." },
  { collection: "plans", id: "free", purpose: "Starter profile plan." },
  { collection: "plans", id: "pro", purpose: "Paid creator/business plan." },
  { collection: "plans", id: "business", purpose: "Team and shop-ready plan." },
  { collection: "pages", id: "activate", purpose: "Configuration for the QR activation page." },
  { collection: "settings", id: "frontend", purpose: "Modular, reusable and category-driven frontend rendering config." },
  { collection: "settings", id: "analytics", purpose: "Geo, scan location, device and conversion analytics config." },
  { collection: "warehouses", id: "main", purpose: "Default warehouse stock location." },
  { collection: "inventory_views", id: "tag-inventory-table", purpose: "Dynamic table columns for tag inventory." },
  { collection: "catalog_categories", id: "mini_store", purpose: "Mini store category." },
  { collection: "catalog_categories", id: "helmet_catalog", purpose: "Helmet catalog category." },
  { collection: "catalog_categories", id: "nfc_products", purpose: "NFC products category." },
  { collection: "catalog_categories", id: "affiliate_marketplace", purpose: "Affiliate marketplace category." }
];

const OPTIONAL_COLLECTIONS = [
  { collection: "tag_inventory", purpose: "Manufactured tag numbers, activation status and warehouse stock." },
  { collection: "catalog_items", purpose: "Mini store, helmet catalog, NFC products and affiliate products." },
  { collection: "affiliate_partners", purpose: "Affiliate marketplace sellers, commission rates and payout status." },
  { collection: "orders", purpose: "Payments, QR purchases and fulfillment tracking." },
  { collection: "leads", purpose: "Lead capture from forms and scan actions." },
  { collection: "subscriptions", purpose: "Plan status, renewal and billing provider data." },
  { collection: "events", purpose: "Audit trail for scans, clicks, edits and admin actions." },
  { collection: "scan_events", purpose: "Raw scan records with location, device and conversion context." },
  { collection: "geo_analytics", purpose: "Aggregated country, region and city scan analytics." },
  { collection: "device_analytics", purpose: "Aggregated browser, OS, device type and referrer analytics." },
  { collection: "conversion_analytics", purpose: "Funnel analytics from scan to click, lead, checkout and purchase." },
  { collection: "short_links", purpose: "Reusable redirects for campaigns and printed QR batches." }
];

const CATALOG_CATEGORIES = {
  mini_store: {
    title: "Mini Store",
    slug: "mini-store",
    route: "/shop",
    product_type: "store_item",
    description: "Small myQRID store products and add-ons.",
    sort_order: 10
  },
  helmet_catalog: {
    title: "Helmet Catalog",
    slug: "helmet-catalog",
    route: "/helmets",
    product_type: "helmet",
    description: "Helmet QR, safety and rider products.",
    sort_order: 20
  },
  nfc_products: {
    title: "NFC Products",
    slug: "nfc-products",
    route: "/nfc",
    product_type: "nfc",
    description: "NFC cards, stickers, tags and smart tap products.",
    sort_order: 30
  },
  affiliate_marketplace: {
    title: "Affiliate Marketplace",
    slug: "affiliate-marketplace",
    route: "/marketplace",
    product_type: "affiliate",
    description: "Partner products with affiliate tracking and commission data.",
    sort_order: 40
  }
};

const TAG_INVENTORY_COLUMNS = [
  { key: "tag_number", label: "Tag No", type: "text", visible: true },
  { key: "product_category", label: "Category", type: "category", visible: true },
  { key: "sku", label: "SKU", type: "text", visible: true },
  { key: "manufacturing_status", label: "Manufacturing", type: "status", visible: true },
  { key: "activation_status", label: "Activation", type: "status", visible: true },
  { key: "warehouse_status", label: "Warehouse", type: "status", visible: true },
  { key: "warehouse_location", label: "Stock Location", type: "text", visible: true },
  { key: "owner_username", label: "Owner", type: "text", visible: true },
  { key: "created_at", label: "Created", type: "datetime", visible: true }
];

const ANALYTICS_MODULES = {
  geo: {
    title: "Geo Analytics",
    event_collection: "scan_events",
    aggregate_collection: "geo_analytics",
    dimensions: ["country", "region", "city", "postal_code", "lat_lng_precision"]
  },
  scan_location: {
    title: "Scan Location",
    event_collection: "scan_events",
    aggregate_collection: "geo_analytics",
    dimensions: ["tag_number", "scan_lat", "scan_lng", "city", "map_bucket"]
  },
  device: {
    title: "Device Analytics",
    event_collection: "scan_events",
    aggregate_collection: "device_analytics",
    dimensions: ["device_type", "browser", "os", "referrer", "utm_source"]
  },
  conversion: {
    title: "Conversion Analytics",
    event_collection: "events",
    aggregate_collection: "conversion_analytics",
    dimensions: ["scan", "profile_view", "link_click", "lead", "checkout", "purchase"]
  }
};

function buildBusinessSettings(now) {
  return {
    brand_name: "myQRID",
    support_email: "support@myqrid.com",
    default_country: "IN",
    currency: "INR",
    profile_base_url: process.env.PUBLIC_BASE_URL || "https://myqrid-backend.onrender.com",
    setup_version: 1,
    updated_at: now
  };
}

function buildDefaultPlans(now) {
  return {
    free: {
      name: "Free",
      price_monthly: 0,
      currency: "INR",
      max_tags: 1,
      max_products: 3,
      analytics_retention_days: 30,
      features: ["profile", "basic_links", "basic_analytics"],
      status: "active",
      updated_at: now
    },
    pro: {
      name: "Pro",
      price_monthly: 199,
      currency: "INR",
      max_tags: 10,
      max_products: 50,
      analytics_retention_days: 365,
      features: ["profile", "products", "lead_capture", "advanced_analytics", "custom_theme"],
      status: "active",
      updated_at: now
    },
    business: {
      name: "Business",
      price_monthly: 999,
      currency: "INR",
      max_tags: 100,
      max_products: 500,
      analytics_retention_days: 730,
      features: ["team", "bulk_tags", "orders", "crm_export", "priority_support"],
      status: "active",
      updated_at: now
    }
  };
}

function buildActivatePage(now) {
  return {
    title: "Activate your myQRID",
    instructions: [
      "Scan or open your QR URL.",
      "Create your username.",
      "Attach the QR tag to your identity, pet, asset or product."
    ],
    status: "draft",
    updated_at: now
  };
}

function buildFrontendSettings(now) {
  return {
    rendering_mode: "category_driven",
    component_style: "modular_reusable",
    catalog_sections: Object.keys(CATALOG_CATEGORIES),
    tag_inventory_table: {
      title: "Tag Inventory",
      collection: "tag_inventory",
      columns: TAG_INVENTORY_COLUMNS,
      filters: ["product_category", "manufacturing_status", "activation_status", "warehouse_status", "warehouse_location"],
      default_sort: "created_at_desc"
    },
    updated_at: now
  };
}

function buildAnalyticsSettings(now) {
  return {
    modules: ANALYTICS_MODULES,
    scan_event_collection: "scan_events",
    privacy_note: "Store approximate location unless exact user consent is collected.",
    conversion_steps: ["scan", "profile_view", "link_click", "lead", "checkout", "purchase"],
    updated_at: now
  };
}

function buildDefaultWarehouse(now) {
  return {
    name: "Main Warehouse",
    code: "MAIN",
    status: "active",
    stock_counts: {
      manufactured: 0,
      in_warehouse: 0,
      assigned: 0,
      activated: 0,
      damaged: 0
    },
    updated_at: now
  };
}

function buildCatalogCategoryData(categoryId, now) {
  return {
    id: categoryId,
    ...CATALOG_CATEGORIES[categoryId],
    status: "active",
    item_count: 0,
    updated_at: now
  };
}

function normalizeCatalogCategory(category) {
  const cleanCategory = String(category || "nfc_products")
    .trim()
    .toLowerCase()
    .replace(/-/g, "_");

  return CATALOG_CATEGORIES[cleanCategory] ? cleanCategory : "nfc_products";
}

function normalizeSku(sku, category) {
  return String(sku || category || "tag")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "tag";
}

function createManufacturedTagNumber(serial) {
  return `MQTAG-${formatSerial(serial)}`;
}

function buildTagInventoryData({ serial, tagNumber, productCategory, sku, warehouse, batchId, now }) {
  const baseUrl = process.env.PUBLIC_BASE_URL || "https://myqrid-backend.onrender.com";

  return {
    serial_no: serial,
    tag_number: tagNumber,
    product_category: productCategory,
    category_title: CATALOG_CATEGORIES[productCategory].title,
    sku,
    batch_id: batchId,
    manufacturing_status: "manufactured",
    activation_status: "not_activated",
    warehouse_status: "in_stock",
    warehouse_location: warehouse,
    owner_username: null,
    tag_slug: null,
    nfc_uid: "",
    qr_url: `${baseUrl}/activate?tag=${encodeURIComponent(tagNumber)}`,
    scan_count: 0,
    conversion_count: 0,
    manufactured_at: now,
    activated_at: null,
    created_at: now,
    updated_at: now
  };
}

async function documentExists(collection, id) {
  const doc = await db.collection(collection).doc(id).get();
  return doc.exists;
}

async function collectionHasDocuments(collection) {
  const snapshot = await db.collection(collection).limit(1).get();
  return !snapshot.empty;
}

async function getDbStatus() {
  const required = [];

  for (const item of REQUIRED_DOCS) {
    required.push({
      ...item,
      exists: await documentExists(item.collection, item.id)
    });
  }

  const optional = [];

  for (const item of OPTIONAL_COLLECTIONS) {
    optional.push({
      ...item,
      has_documents: await collectionHasDocuments(item.collection)
    });
  }

  const missingRequired = required.filter(item => !item.exists);
  const readyScore = Math.round(((required.length - missingRequired.length) / required.length) * 100);

  return {
    ready: missingRequired.length === 0,
    ready_score: readyScore,
    required,
    optional,
    missing_required: missingRequired.map(item => `${item.collection}/${item.id}`),
    recommendation: missingRequired.length === 0
      ? "Database setup is ready for tag inventory, mini store, catalogs, marketplace and analytics schemas. Next, create manufactured stock with /admin/create-manufactured-tags."
      : "Open /admin/setup-db with your setup key to create the missing core documents."
  };
}

app.get("/admin/db-status", async (req, res) => {
  try {
    if (!requireDb(res) || !requireSetupAccess(req, res)) {
      return;
    }

    const status = await getDbStatus();

    return res.json({
      success: true,
      firebase_configured: true,
      ...status
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
});

app.get("/admin/setup-db", async (req, res) => {
  try {
    if (!requireDb(res) || !requireSetupAccess(req, res)) {
      return;
    }

    const now = new Date().toISOString();
    const batch = db.batch();
    const plans = buildDefaultPlans(now);
    const counterRef = db.collection("counters").doc("global");
    const counterDoc = await counterRef.get();
    const counters = counterDoc.exists ? counterDoc.data() : {};

    batch.set(counterRef, {
      last_account_no: Number(counters.last_account_no || 0),
      last_tag_serial: Number(counters.last_tag_serial || 0),
      last_order_no: Number(counters.last_order_no || 0),
      last_manufactured_tag_no: Number(counters.last_manufactured_tag_no || 0),
      updated_at: now
    }, { merge: true });

    batch.set(db.collection("settings").doc("business"), buildBusinessSettings(now), { merge: true });
    batch.set(db.collection("settings").doc("frontend"), buildFrontendSettings(now), { merge: true });
    batch.set(db.collection("settings").doc("analytics"), buildAnalyticsSettings(now), { merge: true });
    batch.set(db.collection("pages").doc("activate"), buildActivatePage(now), { merge: true });
    batch.set(db.collection("warehouses").doc("main"), buildDefaultWarehouse(now), { merge: true });
    batch.set(db.collection("inventory_views").doc("tag-inventory-table"), {
      title: "Tag Inventory Table",
      collection: "tag_inventory",
      columns: TAG_INVENTORY_COLUMNS,
      filters: ["product_category", "manufacturing_status", "activation_status", "warehouse_status", "warehouse_location"],
      updated_at: now
    }, { merge: true });

    for (const [planId, plan] of Object.entries(plans)) {
      batch.set(db.collection("plans").doc(planId), plan, { merge: true });
    }

    for (const categoryId of Object.keys(CATALOG_CATEGORIES)) {
      batch.set(db.collection("catalog_categories").doc(categoryId), buildCatalogCategoryData(categoryId, now), { merge: true });
    }

    if (req.query.seed_demo === "true") {
      batch.set(db.collection("catalog_items").doc("starter-identity-tag"), {
        title: "Smart QR Identity Tag",
        description: "Starter physical QR tag for profile, pet, asset or product use.",
        product_category: "mini_store",
        sku: "starter-identity-tag",
        price: 299,
        currency: "INR",
        inventory_tracking: true,
        status: "draft",
        created_at: now,
        updated_at: now
      }, { merge: true });
      batch.set(db.collection("catalog_items").doc("nfc-smart-card"), {
        title: "NFC Smart Card",
        description: "Tap-enabled NFC card connected to myQRID profile and analytics.",
        product_category: "nfc_products",
        sku: "nfc-smart-card",
        price: 499,
        currency: "INR",
        inventory_tracking: true,
        status: "draft",
        created_at: now,
        updated_at: now
      }, { merge: true });
      batch.set(db.collection("catalog_items").doc("helmet-safety-qr"), {
        title: "Helmet Safety QR",
        description: "Helmet QR sticker for emergency profile and scan analytics.",
        product_category: "helmet_catalog",
        sku: "helmet-safety-qr",
        price: 199,
        currency: "INR",
        inventory_tracking: true,
        status: "draft",
        created_at: now,
        updated_at: now
      }, { merge: true });
      batch.set(db.collection("affiliate_partners").doc("demo-partner"), {
        name: "Demo Affiliate Partner",
        status: "draft",
        commission_percent: 10,
        payout_status: "not_connected",
        created_at: now,
        updated_at: now
      }, { merge: true });
    }

    await batch.commit();

    const status = await getDbStatus();

    return res.json({
      success: true,
      message: "Core Firestore documents created or updated safely.",
      next_urls: {
        check_status: "/admin/db-status?key=YOUR_SETUP_SECRET",
        create_first_user: "/create-user?username=preetmahant&display_name=Preet%20Mahant&category=I",
        create_extra_tag: "/create-tag?username=preetmahant&category=P",
        create_inventory: "/admin/create-manufactured-tags?key=YOUR_SETUP_SECRET&count=10&category=nfc_products&sku=nfc-smart-card",
        view_inventory: "/admin/tag-inventory?key=YOUR_SETUP_SECRET"
      },
      ...status
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
});

/* -------------------------------
   TAG INVENTORY ADMIN
-------------------------------- */
app.get("/admin/create-manufactured-tags", async (req, res) => {
  try {
    if (!requireDb(res) || !requireSetupAccess(req, res)) {
      return;
    }

    const count = Math.min(Math.max(parseInt(req.query.count || "1", 10) || 1, 1), 100);
    const productCategory = normalizeCatalogCategory(req.query.category);
    const sku = normalizeSku(req.query.sku, productCategory);
    const warehouse = String(req.query.warehouse || "MAIN").trim().toUpperCase().slice(0, 40) || "MAIN";
    const warehouseId = warehouse.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "main";
    const now = new Date().toISOString();
    const batchId = `BATCH-${Date.now()}`;
    const counterRef = db.collection("counters").doc("global");
    const warehouseRef = db.collection("warehouses").doc(warehouseId);
    const created = [];

    await db.runTransaction(async transaction => {
      const counterDoc = await transaction.get(counterRef);
      const counters = counterDoc.exists ? counterDoc.data() : {};
      const startSerial = Number(counters.last_manufactured_tag_no || counters.last_tag_serial || 0);
      const endSerial = startSerial + count;

      for (let serial = startSerial + 1; serial <= endSerial; serial += 1) {
        const tagNumber = createManufacturedTagNumber(serial);
        const tagRef = db.collection("tag_inventory").doc(tagNumber);
        const tagData = buildTagInventoryData({
          serial,
          tagNumber,
          productCategory,
          sku,
          warehouse,
          batchId,
          now
        });

        transaction.set(tagRef, tagData, { merge: true });
        created.push(tagData);
      }

      transaction.set(counterRef, {
        last_manufactured_tag_no: endSerial,
        updated_at: now
      }, { merge: true });
      transaction.set(warehouseRef, {
        name: `${warehouse} Warehouse`,
        code: warehouse,
        status: "active",
        stock_counts: {
          manufactured: admin.firestore.FieldValue.increment(count),
          in_warehouse: admin.firestore.FieldValue.increment(count)
        },
        updated_at: now
      }, { merge: true });
    });

    return res.json({
      success: true,
      message: `Created ${created.length} manufactured tag inventory records.`,
      batch_id: batchId,
      count: created.length,
      category: productCategory,
      sku,
      warehouse,
      tags: created
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
});

app.get("/admin/tag-inventory", async (req, res) => {
  try {
    if (!requireDb(res) || !requireSetupAccess(req, res)) {
      return;
    }

    const limit = Math.min(Math.max(parseInt(req.query.limit || "50", 10) || 50, 1), 200);
    const category = req.query.category ? normalizeCatalogCategory(req.query.category) : null;
    const snapshot = await db.collection("tag_inventory").limit(limit).get();
    let rows = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (category) {
      rows = rows.filter(row => row.product_category === category);
    }

    return res.json({
      success: true,
      table: {
        title: "Tag Inventory",
        columns: TAG_INVENTORY_COLUMNS,
        categories: CATALOG_CATEGORIES
      },
      summary: {
        total_returned: rows.length,
        filters: { category },
        statuses: {
          manufactured: rows.filter(row => row.manufacturing_status === "manufactured").length,
          not_activated: rows.filter(row => row.activation_status === "not_activated").length,
          activated: rows.filter(row => row.activation_status === "activated").length,
          in_stock: rows.filter(row => row.warehouse_status === "in_stock").length
        }
      },
      rows
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
});

/* -------------------------------
   WEB MVP API (FIRESTORE + VANILLA FRONTEND)
-------------------------------- */
const MVP_TAG_TYPES = {
  DI: "digital_identity",
  RM: "returnme",
  HM: "helpme",
  PT: "pet",
  VH: "vehicle",
  AS: "asset",
  BS: "business"
};

function cleanText(value, fallback = "") {
  return String(value || fallback).trim().slice(0, 500);
}

function cleanUrl(value) {
  const raw = cleanText(value);
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

function normalizePhoneForWa(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function publicBaseUrl(req) {
  return process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;
}

function buildVCard(profile, profileUrl) {
  const phone = cleanText(profile.phone);
  const whatsapp = cleanText(profile.whatsapp || profile.phone);
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${cleanText(profile.display_name || profile.username || "myQRID User")}`,
    profile.profession ? `TITLE:${cleanText(profile.profession)}` : "",
    profile.organization ? `ORG:${cleanText(profile.organization)}` : "",
    phone ? `TEL;TYPE=CELL:${phone}` : "",
    profile.email ? `EMAIL:${cleanText(profile.email)}` : "",
    profile.website ? `URL:${cleanUrl(profile.website)}` : `URL:${profileUrl}`,
    whatsapp ? `NOTE:WhatsApp ${whatsapp} | myQRID ${profileUrl}` : `NOTE:myQRID ${profileUrl}`,
    "END:VCARD"
  ].filter(Boolean).join("\n");
}

function buildMvpProfile(username, body, req) {
  const profileUrl = `${publicBaseUrl(req)}/u/${username}`;
  const links = Array.isArray(body.links)
    ? body.links.map(link => ({ title: cleanText(link.title), url: cleanUrl(link.url) })).filter(link => link.title && link.url)
    : [];

  return {
    username,
    profile_url: profileUrl,
    display_name: cleanText(body.display_name, username),
    profession: cleanText(body.profession),
    organization: cleanText(body.organization),
    location: cleanText(body.location),
    bio: cleanText(body.bio, "Welcome to my myQRID profile."),
    avatar: cleanUrl(body.avatar),
    cover_image: cleanUrl(body.cover_image),
    website: cleanUrl(body.website),
    whatsapp: cleanText(body.whatsapp),
    phone: cleanText(body.phone),
    email: cleanText(body.email),
    instagram: cleanUrl(body.instagram),
    youtube: cleanUrl(body.youtube),
    linkedin: cleanUrl(body.linkedin),
    x: cleanUrl(body.x),
    links,
    theme: cleanText(body.theme, "glass"),
    profile_type: cleanText(body.profile_type, "digital_identity"),
    lost_item: body.lost_item && typeof body.lost_item === "object" ? body.lost_item : null,
    analytics: createDefaultAnalytics(),
    updated_at: new Date().toISOString()
  };
}

async function logMvpEvent({ req, username, tagSlug, action, metadata = {} }) {
  const now = new Date().toISOString();
  await db.collection("scan_logs").add({
    username: username || null,
    tag_slug: tagSlug || null,
    action,
    ip: req.ip,
    user_agent: req.get("user-agent") || "",
    referrer: req.get("referer") || "",
    timestamp: now,
    metadata
  });
}

app.post("/api/mvp/profile", async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const username = cleanUsername(req.body.username);
    const validationError = usernameValidationError(username);
    if (validationError) return res.status(422).json({ error: validationError });

    const profileRef = db.collection("profiles").doc(username);
    const userRef = db.collection("users").doc(username);
    const existing = await profileRef.get();
    const profile = {
      ...(existing.exists ? existing.data() : {}),
      ...buildMvpProfile(username, req.body, req),
      created_at: existing.exists ? existing.data().created_at : new Date().toISOString()
    };

    await profileRef.set(profile, { merge: true });
    await userRef.set({ username, display_name: profile.display_name, email: profile.email, phone: profile.phone, updated_at: profile.updated_at }, { merge: true });
    return res.json({ success: true, profile, qr_url: `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(profile.profile_url)}` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/api/mvp/profile/:username", async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const username = cleanUsername(req.params.username);
    const doc = await db.collection("profiles").doc(username).get();
    if (!doc.exists) return res.status(404).json({ error: "Profile not found" });
    const profile = doc.data();
    const analytics = normalizeAnalytics(profile.analytics);
    analytics.total_views += 1;
    analytics.last_seen = new Date().toISOString();
    analytics.profile_opens.push({ time: analytics.last_seen });
    await doc.ref.update({ analytics });
    await logMvpEvent({ req, username, action: "profile_view" });
    return res.json({ success: true, profile: { ...profile, analytics }, vcard: buildVCard(profile, profile.profile_url) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/mvp/track", async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const username = cleanUsername(req.body.username);
    const action = cleanText(req.body.action, "click").slice(0, 60);
    if (username) {
      const ref = db.collection("profiles").doc(username);
      const doc = await ref.get();
      if (doc.exists) {
        const analytics = normalizeAnalytics(doc.data().analytics);
        analytics.total_clicks += 1;
        analytics.link_clicks[action] = Number(analytics.link_clicks[action] || 0) + 1;
        await ref.update({ analytics });
      }
    }
    await logMvpEvent({ req, username, tagSlug: cleanText(req.body.tag_slug), action, metadata: req.body.metadata || {} });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/mvp/activate", async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const claimId = cleanText(req.body.claim_id).toUpperCase();
    const username = cleanUsername(req.body.username);
    const profileType = cleanText(req.body.profile_type, "digital_identity");
    const validationError = usernameValidationError(username);
    if (!claimId) return res.status(422).json({ error: "Claim ID required" });
    if (validationError) return res.status(422).json({ error: validationError });

    const claimRef = db.collection("claim_ids").doc(claimId);
    const claimDoc = await claimRef.get();
    if (!claimDoc.exists) return res.status(404).json({ error: "Claim ID not found" });
    const claim = claimDoc.data();
    if (claim.status === "activated" && claim.owner_username !== username) return res.status(409).json({ error: "Claim ID already activated" });

    const now = new Date().toISOString();
    const tagSlug = claim.slug;
    const tagData = {
      slug: tagSlug,
      claim_id: claimId,
      owner_username: username,
      profile_type: profileType,
      tag_type: claim.tag_type || profileType,
      status: "active",
      visibility: "public",
      activated_at: now,
      updated_at: now,
      returnme: req.body.returnme || null
    };

    await db.collection("tags").doc(tagSlug).set(tagData, { merge: true });
    await claimRef.set({ status: "activated", owner_username: username, activated_at: now, updated_at: now }, { merge: true });
    await db.collection("profiles").doc(username).set({ username, profile_type: profileType, tags: admin.firestore.FieldValue.arrayUnion(tagSlug), updated_at: now }, { merge: true });
    return res.json({ success: true, tag: tagData, public_url: `${publicBaseUrl(req)}/t/${tagSlug}` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/admin/mvp/generate-tags", async (req, res) => {
  try {
    if (!requireDb(res) || !requireSetupAccess(req, res)) return;
    const count = Math.min(Math.max(parseInt(req.body.count || req.query.count || "10", 10) || 10, 1), 1000);
    const prefix = cleanText(req.body.prefix || req.query.prefix || "DI").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4) || "DI";
    const tagType = MVP_TAG_TYPES[prefix] || cleanText(req.body.tag_type || req.query.tag_type || "digital_identity");
    const now = new Date().toISOString();
    const counterRef = db.collection("counters").doc("mvp_tags");
    const created = [];

    await db.runTransaction(async transaction => {
      const counterDoc = await transaction.get(counterRef);
      const counters = counterDoc.exists ? counterDoc.data() : {};
      const start = Number(counters[prefix] || 1000);
      const end = start + count;
      transaction.set(counterRef, { [prefix]: end, updated_at: now }, { merge: true });
      for (let serial = start + 1; serial <= end; serial += 1) {
        const slug = `${prefix}${serial}`;
        const claimId = `${prefix}-${serial}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        const data = { slug, claim_id: claimId, tag_type: tagType, status: "unused", created_at: now, qr_url: `${process.env.PUBLIC_BASE_URL || ""}/t/${slug}` };
        transaction.set(db.collection("claim_ids").doc(claimId), data);
        transaction.set(db.collection("tags").doc(slug), { slug, claim_id: claimId, tag_type: tagType, status: "inactive", created_at: now }, { merge: true });
        created.push(data);
      }
    });

    return res.json({ success: true, count: created.length, tags: created });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/mvp/tags", async (req, res) => {
  try {
    if (!requireDb(res) || !requireSetupAccess(req, res)) return;
    const snapshot = await db.collection("tags").limit(300).get();
    return res.json({ success: true, tags: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/api/mvp/tag/:slug", async (req, res) => {
  try {
    if (!requireDb(res)) return;
    const slug = cleanText(req.params.slug).toUpperCase();
    const doc = await db.collection("tags").doc(slug).get();
    if (!doc.exists) return res.status(404).json({ error: "Tag not found" });
    const tag = doc.data();
    await logMvpEvent({ req, tagSlug: slug, username: tag.owner_username, action: tag.status === "active" ? "tag_scan" : "inactive_tag_scan" });
    return res.json({ success: true, tag });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* -------------------------------
   CHECK USERNAME + SUGGESTIONS
-------------------------------- */
app.get("/check-username", async (req, res) => {
  try {
    if (!requireDb(res)) {
      return;
    }

    const username = cleanUsername(req.query.username);

    const validationError = usernameValidationError(username);

    if (validationError) {
      return res.json({
        available: false,
        error: validationError,
        suggestions: []
      });
    }

    const doc = await db.collection("users").doc(username).get();

    if (!doc.exists) {
      return res.json({
        available: true,
        suggestions: []
      });
    }

    const suggestions = await getUsernameSuggestions(username);

    return res.json({
      available: false,
      error: "Username already taken",
      suggestions
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
});

/* -------------------------------
   CREATE USER
-------------------------------- */
app.get("/create-user", async (req, res) => {
  try {
    if (!requireDb(res)) {
      return;
    }

    const username = cleanUsername(req.query.username);
    const display_name = String(req.query.display_name || "").trim();
    const category = normalizeCategory(req.query.category || "I");

    const validationError = usernameValidationError(username);

    if (validationError) {
      return res.json({
        error: validationError,
        suggestions: []
      });
    }

    const ref = db.collection("users").doc(username);
    const existing = await ref.get();

    if (existing.exists) {
      const suggestions = await getUsernameSuggestions(username);

      return res.json({
        available: false,
        error: "Username already taken",
        suggestions
      });
    }

    const now = new Date().toISOString();
    const counterRef = db.collection("counters").doc("global");
    let userData = null;
    let tagData = null;

    await db.runTransaction(async transaction => {
      const counterDoc = await transaction.get(counterRef);
      const counters = counterDoc.exists ? counterDoc.data() : {};
      const accountNo = Number(counters.last_account_no || 0) + 1;
      const tagSerial = Number(counters.last_tag_serial || 0) + 1;
      const slug = createTagSlug(category, tagSerial);
      const tagRef = db.collection("tags").doc(slug);

      userData = {
        account_no: accountNo,
        username,
        display_name: display_name || "New User",
        unique_slug: slug,
        primary_tag_slug: slug,
        phone: "",
        bio: "New profile",
        avatar: "",
        whatsapp: "",
        email: "",
        instagram: "",
        x: "",
        snapchat: "",
        linkedin: "",
        youtube: "",
        website: "",
        links: [],
        products: [],
        status: "active",
        tag_count: 1,
        tags: [slug],
        old_usernames: [],
        username_last_changed: 0,
        analytics: createDefaultAnalytics(),
        created_at: now
      };

      tagData = buildTagData({
        serial: tagSerial,
        slug,
        category,
        username,
        accountNo,
        now
      });

      transaction.set(counterRef, {
        last_account_no: accountNo,
        last_tag_serial: tagSerial,
        last_order_no: Number(counters.last_order_no || 0),
        updated_at: now
      }, { merge: true });
      transaction.set(ref, userData);
      transaction.set(tagRef, tagData);
    });

    return res.json({
      success: true,
      user: userData,
      tag: tagData
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
});

/* -------------------------------
   CREATE TAG FOR USER
-------------------------------- */
app.get("/create-tag", async (req, res) => {
  try {
    if (!requireDb(res)) {
      return;
    }

    const username = cleanUsername(req.query.username);
    const category = normalizeCategory(req.query.category || "I");

    const validationError = usernameValidationError(username);

    if (validationError) {
      return res.json({
        error: validationError
      });
    }

    const userRef = db.collection("users").doc(username);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.json({
        error: "User not found"
      });
    }

    const now = new Date().toISOString();
    const counterRef = db.collection("counters").doc("global");
    let tagData = null;

    await db.runTransaction(async transaction => {
      const counterDoc = await transaction.get(counterRef);
      const transactionUserDoc = await transaction.get(userRef);

      if (!transactionUserDoc.exists) {
        throw new Error("User not found");
      }

      const counters = counterDoc.exists ? counterDoc.data() : {};
      const user = transactionUserDoc.data();
      const hasAccountNo = Number(user.account_no || 0) > 0;
      const accountNo = hasAccountNo
        ? Number(user.account_no)
        : Number(counters.last_account_no || 0) + 1;
      const tagSerial = Number(counters.last_tag_serial || 0) + 1;
      const slug = createTagSlug(category, tagSerial);
      const tagRef = db.collection("tags").doc(slug);

      tagData = buildTagData({
        serial: tagSerial,
        slug,
        category,
        username,
        accountNo,
        now
      });

      transaction.set(counterRef, {
        last_account_no: Math.max(Number(counters.last_account_no || 0), accountNo),
        last_tag_serial: tagSerial,
        last_order_no: Number(counters.last_order_no || 0),
        updated_at: now
      }, { merge: true });
      transaction.set(tagRef, tagData);
      transaction.update(userRef, {
        account_no: accountNo,
        tag_count: Number(user.tag_count || 0) + 1,
        tags: admin.firestore.FieldValue.arrayUnion(slug),
        updated_at: now
      });
    });

    return res.json({
      success: true,
      tag: tagData
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
});

/* -------------------------------
   CHANGE USERNAME (30 DAYS RULE)
-------------------------------- */
app.get("/change-username", async (req, res) => {
  try {
    if (!requireDb(res)) {
      return;
    }

    const current = cleanUsername(req.query.current);
    const newUsername = cleanUsername(req.query.new);

    if (!current || !newUsername) {
      return res.json({
        error: "Current & new username required"
      });
    }

    const validationError = usernameValidationError(newUsername);

    if (validationError) {
      return res.json({
        error: validationError,
        suggestions: []
      });
    }

    const oldRef = db.collection("users").doc(current);
    const oldDoc = await oldRef.get();

    if (!oldDoc.exists) {
      return res.json({
        error: "User not found"
      });
    }

    const oldUser = oldDoc.data();
    const now = Date.now();
    const lastChanged = oldUser.username_last_changed || 0;
    const diffDays = (now - lastChanged) / (1000 * 60 * 60 * 24);

    if (lastChanged !== 0 && diffDays < 30) {
      return res.json({
        error: "Username can be changed only after 30 days"
      });
    }

    const newRef = db.collection("users").doc(newUsername);
    const newDoc = await newRef.get();

    if (newDoc.exists) {
      const suggestions = await getUsernameSuggestions(newUsername);

      return res.json({
        available: false,
        error: "New username already taken",
        suggestions
      });
    }

    const oldUsernames = Array.isArray(oldUser.old_usernames)
      ? oldUser.old_usernames
      : [];

    const updatedUser = {
      ...oldUser,
      username: newUsername,
      old_usernames: [...oldUsernames, oldUser.username || current],
      username_last_changed: now
    };

    await newRef.set(updatedUser);
    await oldRef.delete();

    return res.json({
      success: true,
      new_username: newUsername
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
});

/* -------------------------------
   TRACK LINK CLICK
-------------------------------- */
app.get("/track-click", async (req, res) => {
  try {
    if (!requireDb(res)) {
      return;
    }

    const username = cleanUsername(req.query.username);
    const button = String(req.query.button || "").trim();

    if (!username || !button) {
      return res.json({
        error: "username & button required"
      });
    }

    const ref = db.collection("users").doc(username);
    const doc = await ref.get();

    if (!doc.exists) {
      return res.json({
        error: "User not found"
      });
    }

    const user = doc.data();
    const analytics = normalizeAnalytics(user.analytics);

    analytics.link_clicks[button] = Number(analytics.link_clicks[button] || 0) + 1;
    analytics.total_clicks += 1;

    await ref.update({ analytics });

    return res.json({
      success: true,
      analytics
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
});

/* -------------------------------
   GET USER PROFILE
-------------------------------- */
app.get("/:username", async (req, res) => {
  try {
    if (!requireDb(res)) {
      return;
    }

    const username = cleanUsername(req.params.username);

    if (!username) {
      return res.json({
        error: "Username required"
      });
    }

    const ref = db.collection("users").doc(username);
    const doc = await ref.get();

    if (!doc.exists) {
      return res.json({
        error: "Profile not found"
      });
    }

    const user = doc.data();
    const analytics = normalizeAnalytics(user.analytics);
    const now = new Date().toISOString();

    analytics.total_views += 1;
    analytics.last_seen = now;
    analytics.is_online = true;
    analytics.profile_opens.push({ time: now });

    await ref.update({ analytics });

    return res.json({
      ...user,
      analytics
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
});

/* -------------------------------
   SERVER START
-------------------------------- */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
