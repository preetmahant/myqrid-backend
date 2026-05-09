# myQRID production backend architecture

The active deployment uses Render + Firebase Firestore through the root `server.js`. This document describes the optional future PostgreSQL + Prisma + Express + JWT + Redis backend track under `src/`.

## Runtime layers

- `src/app.js` wires security, rate limiting, Swagger, static files and API routes.
- `src/server.js` owns startup/shutdown, Prisma connection and Redis connection.
- `src/routes` exposes REST resources.
- `src/controllers` handles HTTP request/response only.
- `src/services` contains business logic such as auth, tag manufacturing, scan tracking, dynamic profile modules and premium feature locks.
- `src/middleware` contains auth, RBAC, validation, rate/security, audit and error handling.
- `prisma/schema.prisma` is the PostgreSQL source of truth.

## Important production systems

1. Tag Inventory: `tag_inventory` tracks manufactured tags, NFC UID, BLE device ID, activation, shipment and warehouse status.
2. Orders: `orders` and `order_items` support ecommerce, shipping, COD and GST invoice data.
3. Subscriptions: `subscriptions` supports yearly ₹99 premium, renewals and recurring revenue.
4. Device/NFC Mapping: `device_mappings` maps tags to NFC taps, BLE devices and smart hardware.
5. RBAC: `roles`, `permissions`, `role_permissions` support franchise, support, vendor and enterprise access.
6. Scan Logs: `scan_logs` stores GPS, browser, OS, device, action and anomaly fields for analytics.

## Optional PostgreSQL setup

```bash
cp .env.example .env
docker compose up -d postgres redis
npm install
npx prisma generate
npx prisma migrate dev --name init
node prisma/seed.js
npm run postgres:start
```

API docs are available at `/docs`.
