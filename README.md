# myqrid-backend

myQRID backend - QR based identity, lead capture & lost & found system (Node.js + Express + Firebase).

## Active deployment stack

| Layer | Service |
| --- | --- |
| Domain | GoDaddy |
| Frontend | Hostinger |
| Backend | Render |
| Database | Firebase Firestore |
| Backend Runtime | Node.js |
| Framework | Express.js |

For this active stack, Render runs the root `server.js` file through `npm start`, and Firebase Firestore is the live database. The PostgreSQL/Prisma architecture under `src/` and `prisma/` remains available as a future optional backend track, but it is not the default Render runtime for the current Firebase stack. See `docs/DEPLOYMENT_STACK.md` for the exact GoDaddy, Hostinger, Render and Firebase wiring.


## React Native mobile app frontend

A production-grade React Native / Expo-ready mobile frontend scaffold lives in `mobile/`. It implements the requested myQRID super-app architecture with reusable glassmorphism components, bottom navigation, smart scanner detection, QR Designer Studio, claim-ID tag activation, dynamic tag-type profile rendering, admin bulk tag/claim generation, module visibility controls, analytics, shop and family safety flows. See `mobile/README.md` for details.

## Premium viewer frontend

Static frontend files are now included for the Hostinger / viewer UI flow:

- `public/index.html` — premium mobile-first viewer page with five working sections: myQRID, Shop, Scan, Insight, More.
- `public/style.css` — medium-tone purple glassmorphism theme.
- `public/app.js` — dynamic profile loading from `https://myqrid-backend.onrender.com/:username`, smart links, product cards, QR sharing, vCard download, and analytics display.

Use these same files on Hostinger if the frontend is hosted separately. The backend also serves them at `/` for quick preview.

## Source-file safety before deploy

Do not paste GitHub patch text into runtime files. `server.js`, `package.json`, files under `src/`, and files under `public/` must contain only valid code or valid JSON.

Before pushing to Render, run:

```bash
npm run check
```

The check command validates JavaScript syntax and now also scans deployable files for pasted patch metadata that can crash Node or break JSON parsing.

## Render deploy starts then exits early

If Render shows build success and then:

```txt
Running 'node server.js'
Application exited early
```

check `/health` after the next deploy. The server now stays alive even when Firebase Admin cannot initialize and reports the Firebase error in `/health` as `firebase_error`. Most commonly this means `FIREBASE_PRIVATE_KEY` was pasted in the wrong format on Render.

For Render, keep the private key as one environment value with escaped newlines:

```txt
-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
```

Do not paste Git diffs into any source file, and do not wrap the private key in extra quotes unless Render added them automatically.

## QR serial, tag slug, and billing structure

The backend now uses a global serial counter for QR/tag generation:

- `counters/global.last_account_no` counts created accounts.
- `counters/global.last_tag_serial` counts every generated QR/tag.
- `users/{username}` stores the owner profile and tag list.
- `tags/{slug}` stores every physical/digital QR tag.

Slug format:

```txt
I-000001
P-000002
A-000003
B-000004
S-000005
G-000006
```

Category codes:

- `I` = Identity
- `P` = Pet
- `A` = Asset
- `B` = Business
- `S` = Safety
- `G` = Group

Create the first user and primary identity tag:

```txt
/create-user?username=preetmahant&display_name=Preet%20Mahant&category=I
```

Create additional tags for the same user:

```txt
/create-tag?username=preetmahant&category=P
/create-tag?username=preetmahant&category=A
```

## Easy Firestore database setup and business-readiness checklist

Firestore creates collections automatically when the backend writes the first document. That means you do **not** need to manually create every collection in Firebase Console before testing. For safety, this project now includes two protected admin URLs that you can open in a browser after deploy.

### 1. Add one setup secret on Render

In Render environment variables, add:

```txt
SETUP_SECRET=make-a-long-private-random-password
```

Keep this value private. Anyone with this key can initialize your core database documents.

Optional but recommended:

```txt
PUBLIC_BASE_URL=https://myqrid-backend.onrender.com
```

### 2. Check current database readiness

Open this URL after replacing `YOUR_SETUP_SECRET`:

```txt
https://myqrid-backend.onrender.com/admin/db-status?key=YOUR_SETUP_SECRET
```

The response shows:

- `ready` — `true` when all core documents exist.
- `ready_score` — percent of required setup that is complete.
- `missing_required` — exact documents that still need to be created.
- `optional` — future business collections to add as the platform grows.

### 3. Automatically create the core database by opening one URL

Open this URL once:

```txt
https://myqrid-backend.onrender.com/admin/setup-db?key=YOUR_SETUP_SECRET
```

This safely creates or updates these required documents:

| Firestore path | Why it exists |
| --- | --- |
| `counters/global` | Account, tag and order serial counters. |
| `settings/business` | Brand, support email, currency and public profile base URL. |
| `plans/free` | Free starter profile limits and features. |
| `plans/pro` | Paid creator/business limits and features. |
| `plans/business` | Bulk tags, teams and business plan limits. |
| `pages/activate` | Activation-page copy and status. |

If you also want one demo product document, open:

```txt
https://myqrid-backend.onrender.com/admin/setup-db?key=YOUR_SETUP_SECRET&seed_demo=true
```

### 4. Is the current database future-ready?

The core profile and tag database is ready for an MVP because it supports:

- Unique account numbers and QR/tag serials through `counters/global`.
- Username-based profile documents in `users/{username}`.
- Physical or digital tag records in `tags/{slug}`.
- Basic profile analytics inside each user document.
- Plan documents for free, pro and business tiers.

For a scalable business platform, add these collections when the matching feature is ready:

| Collection | Add when you need |
| --- | --- |
| `orders` | QR/product checkout, payment status, invoice number, delivery status. |
| `subscriptions` | Paid plan renewals, billing provider customer IDs and expiry dates. |
| `leads` | Contact forms, scan leads, CRM export and sales follow-up. |
| `events` | Append-only scan/click/edit audit trail for better analytics. |
| `short_links` | Marketing links, campaign QR codes and redirect tracking. |
| `teams` | Multi-user business accounts and staff permissions. |
| `coupons` | Discounts, referral codes and influencer campaigns. |

### 5. Efficiency notes for growth

- Keep `users/{username}` small. Store only current profile fields and summary analytics there.
- For high traffic, write every scan/click to `events` and update daily summary documents like `analytics_daily/{yyyy-mm-dd}_{username}` instead of keeping unlimited arrays in one user document.
- Add Firestore indexes only when Firebase Console reports that a query needs one. The current simple document reads do not require custom indexes.
- Use transactions for serial generation, as the backend already does for `/create-user` and `/create-tag`.
- Protect all setup/admin URLs with `SETUP_SECRET`; do not expose it in frontend code.

## Plain-English answer: what changed and what you get

You should understand this update like this:

1. **Yes, update/deploy the code** if you want the new DB tools. The code adds safe admin URLs that help you check and prepare Firestore.
2. **Your DB is not manually built collection-by-collection.** Firestore creates collections when the backend writes documents.
3. **Your DB status means:** is the minimum myQRID database structure ready or missing something?
4. **You get a browser-friendly guide URL:**

```txt
https://myqrid-backend.onrender.com/admin/db-help
```

This explains what the database can do, what `ready`, `ready_score`, and `missing_required` mean, and which URL to open next.

### What you should do after deploying

1. In Render, add this environment variable:

```txt
SETUP_SECRET=your-private-long-password
```

2. Open this public help URL anytime:

```txt
https://myqrid-backend.onrender.com/admin/db-help
```

3. Check your real Firestore setup status:

```txt
https://myqrid-backend.onrender.com/admin/db-status?key=YOUR_SETUP_SECRET
```

4. If `ready` is `false`, open this once:

```txt
https://myqrid-backend.onrender.com/admin/setup-db?key=YOUR_SETUP_SECRET
```

5. Then check status again. If `ready` is `true`, the core DB is ready for MVP use.

### What can be done through the DB now?

| Feature | DB collection/document used |
| --- | --- |
| Create user/profile | `users/{username}` |
| Create QR/tag serials | `counters/global` and `tags/{slug}` |
| Show profile page | `users/{username}` |
| Count profile views | `users/{username}.analytics` |
| Count link clicks | `users/{username}.analytics.link_clicks` |
| Store business settings | `settings/business` |
| Store free/pro/business limits | `plans/free`, `plans/pro`, `plans/business` |

### What should be added later for a full business platform?

| Future feature | Suggested collection |
| --- | --- |
| Product/QR orders | `orders` |
| Paid monthly/yearly plans | `subscriptions` |
| Customer messages and leads | `leads` |
| Detailed scan and click history | `events` |
| Campaign QR links | `short_links` |
| Business staff accounts | `teams` |
| Discounts and referral codes | `coupons` |

Simple answer: **the current DB setup is good for an MVP profile + QR/tag platform. For a full business platform, the next big DB work is payments/orders, subscriptions, leads, and detailed analytics events.**
## Ready DB additions for tag numbers, store, catalogs and analytics

This update makes the database structure ready for the next myQRID business modules:

| Module | Firestore paths prepared |
| --- | --- |
| Tag number inventory | `tag_inventory/{tag_number}`, `inventory_views/tag-inventory-table`, `counters/global.last_manufactured_tag_no` |
| Manufactured tags | `tag_inventory/{tag_number}.manufacturing_status` and `batch_id` |
| Activation status | `tag_inventory/{tag_number}.activation_status`, `owner_username`, `activated_at` |
| Warehouse stock | `warehouses/main`, `tag_inventory/{tag_number}.warehouse_status`, `warehouse_location` |
| Mini store | `catalog_categories/mini_store`, `catalog_items/{item}` |
| Helmet catalog | `catalog_categories/helmet_catalog`, `catalog_items/{helmet}` |
| NFC products | `catalog_categories/nfc_products`, `catalog_items/{nfc-product}` |
| Affiliate marketplace | `catalog_categories/affiliate_marketplace`, `affiliate_partners/{partner}` |
| Geo analytics | `settings/analytics`, `scan_events`, `geo_analytics` |
| Scan location | `scan_events` with city, region, country and approximate coordinates |
| Device analytics | `scan_events`, `device_analytics` |
| Conversion analytics | `events`, `conversion_analytics` |
| Modular frontend rendering | `settings/frontend` and category-driven catalog documents |

### One-time setup URL

After deployment and after adding `SETUP_SECRET` in Render, open this once:

```txt
https://myqrid-backend.onrender.com/admin/setup-db?key=YOUR_SETUP_SECRET&seed_demo=true
```

This creates core settings, category documents, analytics settings, warehouse config, the reusable tag inventory table config, and demo catalog/affiliate records.

### Create manufactured tag numbers

To create stock for manufactured tags, open a URL like this:

```txt
https://myqrid-backend.onrender.com/admin/create-manufactured-tags?key=YOUR_SETUP_SECRET&count=50&category=nfc_products&sku=nfc-smart-card&warehouse=MAIN
```

What it creates:

- Unique tag numbers like `MQTAG-000001`, `MQTAG-000002`.
- `manufacturing_status: manufactured`.
- `activation_status: not_activated`.
- `warehouse_status: in_stock`.
- `warehouse_location: MAIN`.
- A QR activation URL for each tag.

Maximum `count` per URL call is `100` so Firestore writes stay safe and predictable.

### View inventory as JSON or frontend table

JSON API:

```txt
https://myqrid-backend.onrender.com/admin/tag-inventory?key=YOUR_SETUP_SECRET
```

Frontend table:

```txt
https://myqrid-backend.onrender.com/admin-inventory.html?key=YOUR_SETUP_SECRET
```

The inventory frontend is modular and category-driven: it receives table columns and categories from the backend and renders cards plus a reusable table for manufactured tags, activation status and warehouse stock.

## Optional future PostgreSQL backend architecture

This repository includes an optional future startup-grade backend architecture for the full myQRID platform using Node.js, Express, PostgreSQL, Prisma ORM, JWT auth, Redis caching, RBAC, Swagger docs, Docker and modular services. The current active deployment stack still uses Render plus Firebase Firestore through the root `server.js`.

### Current Render runtime

The active Firebase backend entrypoint is:

```bash
npm start
```

which runs:

```bash
node server.js
```

### Optional PostgreSQL folder structure

| Path | Purpose |
| --- | --- |
| `src/app.js` | Optional PostgreSQL API Express app setup, security middleware, rate limiting, Swagger, static files and API mounting. |
| `src/server.js` | Optional future PostgreSQL API startup/shutdown, Prisma connection and Redis connection. |
| `src/config/` | Environment validation, Prisma client and Redis client. |
| `src/middleware/` | JWT auth, RBAC, validation, audit logs, security, error handling. |
| `src/routes/` | REST API modules for auth, tags, inventory, orders, products, subscriptions, scans, devices, admin, uploads, emergency and lost mode. |
| `src/controllers/` | HTTP controllers for each API area. |
| `src/services/` | Business logic for auth, tag inventory manufacturing, scan tracking, profile engine and premium feature engine. |
| `src/validators/` | Zod validation schemas for secure API inputs. |
| `prisma/schema.prisma` | Full optional PostgreSQL schema for a future myQRID platform migration. |
| `prisma/seed.js` | Seed data for roles, permissions, modules, tag customizations and demo admin/user accounts. |
| `docs/openapi.yaml` | Swagger/OpenAPI REST documentation. |
| `Dockerfile` / `docker-compose.yml` | Docker-ready API, PostgreSQL and Redis stack. |
| `.env.example` | Active Firebase variables plus optional PostgreSQL variables. |

### Important backend tables/systems included

| System | Tables/models |
| --- | --- |
| Users, auth and sessions | `users`, `user_sessions`, `otp_codes` |
| Roles and permissions | `roles`, `permissions`, `role_permissions` |
| Main QR/NFC/BLE tags | `tags` |
| Dynamic tag UI engine | `tag_type_customizations`, `profile_modules` |
| Tag inventory/manufacturing | `tag_inventory` |
| Ecommerce, COD, GST invoices | `orders`, `order_items`, `products` |
| ₹99/year premium and recurring revenue | `subscriptions`, `premium_features` |
| NFC/BLE smart hardware | `device_mappings` |
| GPS/device/conversion analytics | `scan_logs` |
| Lost and found | `lost_and_found` |
| Emergency safety | `emergency_alerts`, `emergency_contacts` |
| Vehicle, pet, asset and business profiles | `vehicle_profiles`, `pet_profiles`, `asset_profiles`, `business_profiles` |
| Files and documents | `files` |
| Notifications and scan alerts | `notifications` |
| Enterprise integrations | `api_keys`, `enterprise_accounts` |
| Audit and activity tracking | `audit_logs`, `activity_logs` |
| Affiliate marketplace | `affiliate_partners` |

### Optional PostgreSQL setup commands

Use this only if you intentionally run the future PostgreSQL API track instead of the current Firebase backend.

```bash
cp .env.example .env
docker compose up -d postgres redis
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run postgres:start
```

For the optional PostgreSQL API track, Swagger API docs will be available at:

```txt
http://localhost:3000/docs
```

### API modules included

- `/api/v1/auth` — register, login, current user.
- `/api/v1/tags` — tag creation, listing, mode changes and public slug fetch.
- `/api/v1/profiles` — public dynamic profile engine by tag slug.
- `/api/v1/inventory` — manufactured tag inventory and warehouse stock.
- `/api/v1/orders` — ecommerce, COD, GST-ready order creation/listing.
- `/api/v1/products` — QR/NFC/helmet/BLE product catalog.
- `/api/v1/subscriptions` — premium/pro/enterprise subscriptions.
- `/api/v1/scans` — scan, click, share, WhatsApp, download, NFC tap and BLE ping tracking.
- `/api/v1/devices` — NFC UID and BLE device mapping.
- `/api/v1/admin` — role-protected dashboard support.
- `/api/v1/lost` — lost/found report support.
- `/api/v1/emergency` — emergency alert support.
- `/api/v1/uploads` — file metadata records.
- `/api/v1/notifications` — alerts and reminders.

### Security included

- JWT access/refresh token structure.
- Bcrypt password hashing.
- RBAC role and permission middleware.
- Zod validation for critical request bodies.
- Helmet security headers.
- CORS allowlist from environment variables.
- Rate limiting.
- Audit log middleware support.
- Soft delete fields on core mutable tables.
- Prisma ORM query protection against SQL injection.
## Current-stack web MVP

The lightweight web MVP is now the main backend front page:

```txt
/
/web-mvp
/web-mvp.html
```

You do **not** need to manually create 74, 120 or 122 files one by one. Keep this repository as one project, deploy it to Render, and the root backend URL will render the front-page UI from `public/web-mvp.html` through `server.js`.

Minimum files that make the front page appear:

- `server.js` serves the app and routes `/`, `/web-mvp`, `/u/:username` and `/t/:slug`.
- `public/web-mvp.html` is the UI page.
- `public/web-mvp.js` powers profile creation, activation, QR rendering and public scan pages.
- `public/style.css` styles the page.
- `package.json` defines `npm start` and `npm run check`.

It uses only the current active stack: root `server.js`, Express, Firebase Firestore, vanilla HTML/CSS/JS in `public/`, and Render-compatible deployment.

### What the web MVP gives you quickly

| Area | What works now |
| --- | --- |
| Landing page | Hero, product/demo cards, CTA buttons and QR preview. |
| Create profile | Saves a digital identity profile to Firestore `profiles/{username}` and `users/{username}`. |
| Public profile QR | Generates a profile QR to `/u/:username` and lets the user download PNG. |
| Public profile page | `/u/:username` opens a mobile-friendly public profile with contact actions and vCard save. |
| Public profile API | `/api/mvp/profile/:username` returns profile data, increments views and returns vCard text. |
| Contact actions | Frontend creates call, WhatsApp, email, website and Save Contact actions. |
| vCard | Browser generates a `.vcf` file with name, phone, email, website, organization and profile URL. |
| Claim activation | User enters admin-issued claim ID, username and profile type to activate a physical tag. |
| ReturnMe/lost item | Activation can store item name, reward amount and return instructions. |
| Tag/finder page | `/t/:slug` opens inactive activation or active owner/finder contact flow. |
| Admin tag generation | Admin can bulk-generate slugs and claim IDs with `/api/admin/mvp/generate-tags`. |
| Admin export | Web admin can export generated slugs/claim IDs as CSV for printing/operations. |
| QR designer | Renders profile/tag QR with center logo, gradient frame and PNG download. |
| Analytics | Tracks profile views, CTA clicks, QR downloads and recent browser activity. |

### Firestore collections used by the MVP

- `users`
- `profiles`
- `tags`
- `claim_ids`
- `scan_logs`
- `analytics` can be added later as daily rollups; current MVP stores profile summary analytics inside `profiles/{username}.analytics`.

### Fast demo flow

1. Run `npm install` once.
2. Run `npm start` locally or deploy the repository to Render with start command `npm start`.
3. Open the backend root URL `/`; it should show the web MVP front-page UI.
4. Create a profile in Dashboard.
5. Download or open the profile QR; it opens `/u/:username`.
6. In Admin, enter `SETUP_SECRET`, generate `RM` or `DI` tags and export CSV.
7. Go to Activate Tag, paste a claim ID, choose profile type and activate.
8. Open the generated tag URL `/t/:slug` to demo post-scan connect/contact flow.
