# myQRID current backend architecture

The current myQRID backend uses:

* Node.js
* Express.js
* Firebase Admin SDK
* Firebase Firestore
* Render backend hosting
* Hostinger frontend hosting
* GoDaddy domain management
* npm package management

## Runtime layers

* `server.js` handles backend startup, Express routing, Firebase initialization and API handling.
* `public/` contains frontend assets such as profile UI, viewer pages and analytics rendering.
* Firebase Firestore stores users, tags, inventory, analytics and scan events.
* Render hosts backend APIs and Express routes.
* Hostinger serves frontend pages and static assets.

## Current production systems

1. QR Identity System
   Supports username profiles, QR tags, smart identity pages and category-based tags.

2. Tag Inventory
   Tracks manufactured tags, warehouse stock, activation status and ownership mapping.

3. Analytics System
   Tracks scans, clicks, device analytics, geo analytics and conversions.

4. Emergency & Lost Mode
   Supports emergency profiles, lost/found flow and recovery workflows.

5. Product Catalog System
   Supports QR products, NFC products, helmet tags and future smart products.

6. Affiliate & Marketplace Preparation
   Supports affiliate catalog categories and future marketplace expansion.

## Current Firestore collections

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

## Local setup

Install dependencies:

```bash
npm install
```

Run backend:

```bash
node server.js
```

## Current deployment architecture

```txt
GoDaddy Domain
        ↓
Hostinger Frontend
        ↓
Render Backend API
        ↓
Firebase Firestore
```

## Important note

This project currently uses Firebase Firestore as the production database.

PostgreSQL, Prisma, Redis and enterprise infrastructure are future roadmap items and are not part of the current production deployment.
