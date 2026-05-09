# myqrid-backend

myQRID backend — QR identity, smart profile, analytics, inventory, emergency safety and lost & found platform using Node.js, Express.js and Firebase Firestore.

---

# Current production stack

| Component         | Service            |
| ----------------- | ------------------ |
| Frontend Hosting  | Hostinger          |
| Backend Hosting   | Render             |
| Database          | Firebase Firestore |
| Domain Provider   | GoDaddy            |
| Backend Runtime   | Node.js            |
| Backend Framework | Express.js         |
| Package Manager   | npm                |

---

# Current architecture

```txt
GoDaddy Domain
        ↓
Hostinger Frontend
        ↓
Render Backend API
        ↓
Firebase Firestore
```

Frontend pages are hosted on Hostinger.

Backend APIs run on Render.

All database operations use Firebase Firestore.

---

# Current backend entrypoint

```bash
node server.js
```

---

# Frontend files

Static frontend files are included inside:

* `public/index.html`
* `public/style.css`
* `public/app.js`

Features included:

* dynamic QR profiles
* smart links
* analytics display
* QR sharing
* vCard download
* product cards
* emergency sections
* inventory rendering

---

# Source-file safety before deploy

Do not paste GitHub diff/patch text into runtime files.

Wrong example:

```txt
diff --git a/server.js b/server.js
```

Files must contain only valid code.

Important files:

* `server.js`
* `package.json`
* `public/*.js`
* `public/*.html`

---

# Install dependencies

```bash
npm install
```

---

# Start backend locally

```bash
node server.js
```

---

# Render deployment issue fix

If Render shows:

```txt
Running 'node server.js'
Application exited early
```

most common causes are:

* invalid Firebase private key
* broken service account JSON
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

# Firestore collections

Current collections used:

* users
* tags
* counters
* settings
* plans
* pages
* tag_inventory
* warehouses
* catalog_categories
* catalog_items
* affiliate_partners
* scan_events
* geo_analytics
* conversion_analytics

---

# QR serial and tag structure

Global counters:

* `counters/global.last_account_no`
* `counters/global.last_tag_serial`

Main collections:

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

Manual collection creation is not required before testing.

---

# Required Render environment variables

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

# Current features supported

* username-based profiles
* QR identity tags
* smart profile pages
* tag inventory
* activation system
* lost & found
* emergency profiles
* analytics tracking
* scan tracking
* dynamic frontend rendering
* product catalogs
* warehouse inventory
* lead capture
* affiliate marketplace preparation
* modular profile sections

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

Current analytics supports:

* profile views
* QR scans
* link clicks
* WhatsApp opens
* scan locations
* device analytics
* conversion analytics

---

# Hosting responsibilities

## Hostinger

Handles:

* frontend UI
* HTML/CSS/JS
* landing pages
* viewer pages

## Render

Handles:

* Express backend
* APIs
* Firebase logic
* QR routes
* analytics
* admin routes

## Firebase Firestore

Handles:

* profiles
* tags
* analytics
* inventory
* scan events
* plans
* settings

## GoDaddy

Handles:

* domain ownership
* DNS records

---

# Security notes

Never commit:

* `.env`
* Firebase service account JSON
* private keys
* setup secrets

Always store them in Render environment variables.

---

# Planned future upgrades

Possible future upgrades:

* BLE integrations
* NFC automation
* advanced analytics
* enterprise dashboard
* AI recommendations
* realtime tracking

These are future roadmap features and are not part of the current production deployment.
