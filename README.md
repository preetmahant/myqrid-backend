# myqrid-backend

myQRID backend — QR based identity, lead capture, analytics, inventory, emergency safety and lost & found platform using Node.js, Express and Firebase.

---

# Current backend architecture

The current myQRID backend uses:

* Node.js
* Express.js
* Firebase Admin SDK
* Firestore
* Render deployment
* Static frontend serving
* QR/tag identity system
* Dynamic profile rendering
* Analytics tracking
* Inventory and activation system

The platform currently runs as a Firebase-first architecture optimized for rapid MVP development and scalable QR identity management.

---

# Current backend entrypoint

```bash
node server.js
```

---

# Current deployment stack

* Render (backend hosting)
* Firebase Firestore (database)
* Firebase Admin SDK
* npm package management

---

# Premium viewer frontend

Static frontend files are included for the Hostinger / viewer UI flow:

* `public/index.html` — premium mobile-first viewer page with five working sections: myQRID, Shop, Scan, Insight, More.
* `public/style.css` — purple glassmorphism theme.
* `public/app.js` — dynamic profile loading, smart links, product cards, QR sharing, vCard download and analytics display.

The backend also serves these files for quick preview.

---

# Source-file safety before deploy

Do not paste GitHub diff/patch text into runtime files.

Files such as:

* `server.js`
* `package.json`
* `public/*.js`
* `public/*.html`

must contain only valid code or valid JSON.

Before deploying:

```bash
npm install
```

---

# Render deploy issue fix

If Render shows:

```txt
Running 'node server.js'
Application exited early
```

most common causes are:

* invalid Firebase private key
* broken JSON/service account
* pasted Git diff text
* missing environment variables
* syntax errors

---

# Firebase private key format for Render

Use escaped newlines:

```txt
-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n
```

Do not wrap the key in extra quotes.

---

# QR serial and tag structure

Global serial counters:

* `counters/global.last_account_no`
* `counters/global.last_tag_serial`

Collections used:

* `users/{username}`
* `tags/{slug}`

---

# Tag slug format

```txt
I-000001
P-000002
A-000003
B-000004
S-000005
G-000006
```

Category codes:

* `I` = Identity
* `P` = Pet
* `A` = Asset
* `B` = Business
* `S` = Safety
* `G` = Group

---

# Create user

```txt
/create-user?username=preetmahant&display_name=Preet%20Mahant&category=I
```

---

# Create additional tags

```txt
/create-tag?username=preetmahant&category=P

/create-tag?username=preetmahant&category=A
```

---

# Firestore setup

Firestore automatically creates collections when documents are written.

You do not need to manually create collections before testing.

---

# Render environment variables

Required:

```txt
SETUP_SECRET=your-private-secret
PUBLIC_BASE_URL=https://your-backend-url.onrender.com
```

---

# Database setup URLs

Check DB readiness:

```txt
/admin/db-status?key=YOUR_SETUP_SECRET
```

Initialize DB:

```txt
/admin/setup-db?key=YOUR_SETUP_SECRET
```

Seed demo data:

```txt
/admin/setup-db?key=YOUR_SETUP_SECRET&seed_demo=true
```

---

# Current Firestore collections

Core collections:

* users
* tags
* counters
* settings
* plans
* pages
* catalog_categories
* catalog_items
* affiliate_partners
* scan_events
* geo_analytics
* conversion_analytics
* warehouses
* tag_inventory

---

# Current features supported

* Username-based profiles
* QR identity tags
* Tag inventory
* Activation system
* Lost & found
* Emergency profiles
* Analytics tracking
* Dynamic frontend rendering
* Product catalogs
* Warehouse inventory
* Affiliate marketplace preparation
* Scan tracking
* Lead capture
* Modular profile sections

---

# Manufactured tag inventory

Create manufactured stock:

```txt
/admin/create-manufactured-tags?key=YOUR_SETUP_SECRET&count=50&category=nfc_products&sku=nfc-smart-card&warehouse=MAIN
```

This creates:

* unique tag serials
* warehouse inventory
* activation-ready QR URLs
* manufacturing status
* stock tracking

---

# Inventory APIs

JSON inventory:

```txt
/admin/tag-inventory?key=YOUR_SETUP_SECRET
```

Frontend inventory table:

```txt
/admin-inventory.html?key=YOUR_SETUP_SECRET
```

---

# Analytics tracking

Current analytics system supports:

* profile views
* QR scans
* link clicks
* WhatsApp opens
* scan locations
* device analytics
* conversion analytics

---

# Planned future upgrades

Future versions may later introduce:

* PostgreSQL
* Prisma ORM
* Redis caching
* Docker infrastructure
* Enterprise RBAC
* BLE integrations
* Advanced analytics engine

These are future roadmap items and are not part of the current production deployment.

---

# Deployment notes

The current production deployment uses:

```bash
node server.js
```

Do not change entrypoint unless backend architecture is migrated fully.

---

# Security notes

Never commit:

* `.env`
* Firebase service account JSON
* private keys
* setup secrets

Always keep them in Render environment variables.

---

# Important reminder

Do not paste Git diffs into runtime files.

Example of WRONG content:

```txt
diff --git a/server.js b/server.js
```

Only paste final valid code into actual files.
