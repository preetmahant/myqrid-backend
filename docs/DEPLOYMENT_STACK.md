# myQRID active deployment stack

This is the active production stack for the current myQRID deployment.

| Layer | Service |
| --- | --- |
| Domain | GoDaddy |
| Frontend | Hostinger |
| Backend | Render |
| Database | Firebase Firestore |
| Backend Runtime | Node.js |
| Framework | Express.js |

## What this means

- Render should run the root `server.js` file with `npm start`.
- Firebase Firestore is the active production database.
- Hostinger should host or mirror the static frontend from `public/`.
- GoDaddy should point domain DNS records to Hostinger for the frontend and optionally to Render for API subdomains.
- The PostgreSQL/Prisma files under `src/` and `prisma/` are an optional future backend architecture, not the default Render runtime for this stack.

## Render settings

Use these Render settings:

| Setting | Value |
| --- | --- |
| Build command | `npm install` |
| Start command | `npm start` |
| Runtime | Node.js |

Required Render environment variables:

| Variable | Purpose |
| --- | --- |
| `FIREBASE_PROJECT_ID` | Firebase project ID. |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email. |
| `FIREBASE_PRIVATE_KEY` | Firebase private key with escaped newline characters. |
| `SETUP_SECRET` | Private key for protected admin setup URLs. |
| `PUBLIC_BASE_URL` | Public backend URL, usually Render URL or API domain. |

## Hostinger frontend

Upload or mirror these files to Hostinger when using separate frontend hosting:

- `public/index.html`
- `public/style.css`
- `public/app.js`
- `public/admin-inventory.html`
- `public/admin-inventory.js`

If the frontend is not hosted separately yet, Render still serves the same files from the backend root.

## GoDaddy DNS

Recommended DNS shape:

| Record | Target |
| --- | --- |
| Root domain or `www` | Hostinger website. |
| `api` subdomain | Render backend URL, if you want a custom API domain. |

## Current backend URLs

| URL | Purpose |
| --- | --- |
| `/health` | Confirms backend is running and shows Firebase status. |
| `/admin/db-help` | Plain English database help. |
| `/admin/db-status?key=YOUR_SETUP_SECRET` | Checks Firestore setup readiness. |
| `/admin/setup-db?key=YOUR_SETUP_SECRET` | Creates core Firestore setup documents. |
| `/admin/create-manufactured-tags?key=YOUR_SETUP_SECRET&count=10` | Creates manufactured tag stock. |
| `/admin/tag-inventory?key=YOUR_SETUP_SECRET` | Returns tag inventory JSON. |
