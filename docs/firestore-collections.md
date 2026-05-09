# Full Firestore collections map

The current myQRID backend uses Firebase Firestore as the production database.

The platform currently uses these collections:

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
* notifications
* emergency_alerts
* lost_and_found
* scan_logs
* device_analytics
* profile_views
* inventory_views

---

# Collection purposes

## users

Stores:

* username profiles
* owner information
* analytics summary
* profile settings
* linked tags

Example:

```json id="hq9j1r"
{
  "username": "preetmahant",
  "display_name": "Preet Mahant",
  "category": "I",
  "linked_tags": ["I-000001"],
  "analytics": {
    "profile_views": 120
  }
}
```

---

## tags

Stores:

* QR/tag slug
* ownership mapping
* activation state
* category
* emergency mode
* visibility

Example:

```json id="jlwmw9"
{
  "slug": "I-000001",
  "owner_username": "preetmahant",
  "category": "I",
  "status": "active",
  "visibility": "public"
}
```

---

## counters

Stores:

* account serial counters
* tag serial counters
* manufactured inventory counters

Example:

```json id="lp0f1e"
{
  "last_account_no": 120,
  "last_tag_serial": 540
}
```

---

## tag_inventory

Stores:

* manufactured tags
* activation status
* warehouse mapping
* ownership mapping
* SKU/category mapping

Example:

```json id="fw8utg"
{
  "tag_number": "MQTAG-000001",
  "activation_status": "not_activated",
  "warehouse_location": "MAIN",
  "category": "nfc_products"
}
```

---

## catalog_categories

Stores:

* product categories
* frontend rendering categories
* marketplace structure

---

## catalog_items

Stores:

* QR products
* NFC products
* helmet products
* smart inventory products

---

## scan_events

Stores:

* QR scans
* clicks
* timestamps
* scan locations
* device analytics

Example:

```json id="7ny3ns"
{
  "slug": "I-000001",
  "city": "Mumbai",
  "country": "India",
  "device": "Android",
  "action": "profile_view"
}
```

---

## geo_analytics

Stores:

* city analytics
* country analytics
* heatmap preparation
* regional activity

---

## conversion_analytics

Stores:

* lead tracking
* engagement metrics
* conversion events

---

## emergency_alerts

Stores:

* emergency mode
* SOS visibility
* emergency profile state
* medical alerts

---

## lost_and_found

Stores:

* lost item state
* finder reports
* recovery tracking
* reward workflows

---

## affiliate_partners

Stores:

* affiliate partner data
* referral systems
* marketplace integrations

---

# Architecture notes

Firestore automatically creates collections when documents are written.

The current architecture is optimized for:

* rapid MVP development
* QR identity systems
* smart profile rendering
* scan analytics
* inventory management
* scalable frontend rendering

---

# Current production stack

* Hostinger (frontend hosting)
* Render (backend hosting)
* Firebase Firestore (database)
* GoDaddy (domain)
* Node.js
* Express.js
* npm

---

# Future roadmap

Possible future upgrades:

* BLE integrations
* NFC automation
* realtime tracking
* enterprise dashboards
* advanced analytics
* AI recommendations

PostgreSQL, Prisma and Redis are future roadmap items and are not part of the current production deployment.
