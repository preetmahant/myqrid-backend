# myQRID active deployment stack

This is the active production stack for the current myQRID deployment.

| Layer           | Service            |
| --------------- | ------------------ |
| Domain          | GoDaddy            |
| Frontend        | Hostinger          |
| Backend         | Render             |
| Database        | Firebase Firestore |
| Backend Runtime | Node.js            |
| Framework       | Express.js         |
| Package Manager | npm                |

---

# What this means

* Render runs the root `server.js` file using `npm start`.
* Firebase Firestore is the active production database.
* Hostinger hosts or mirrors the static frontend from `public/`.
* GoDaddy manages DNS records and domain routing.
* Render handles backend APIs and Firebase logic.

---

# Current backend runtime

Start backend:

```bash id="eb1mj6"
npm start
```

Current entrypoint:

```bash id="vfgt11"
node server.js
```

---

# Render settings

Recommended Render settings:

| Setting       | Value         |
| ------------- | ------------- |
| Build command | `npm install` |
| Start command | `npm start`   |
| Runtime       | Node.js       |

---

# Required Render environment variables

| Variable                | Purpose                                    |
| ----------------------- | ------------------------------------------ |
| `FIREBASE_PROJECT_ID`   | Firebase project ID                        |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email             |
| `FIREBASE_PRIVATE_KEY`  | Firebase private key with escaped newlines |
| `SETUP_SECRET`          | Private key for protected admin setup URLs |
| `PUBLIC_BASE_URL`       | Public backend/API URL                     |

---

# Firebase private key format

Use escaped newlines:

```txt id="sgvqfr"
-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n
```

Do not wrap the key in extra quotes.

---

# Hostinger frontend

Frontend files:

* `public/index.html`
* `public/style.css`
* `public/app.js`
* `public/admin-inventory.html`
* `public/admin-inventory.js`

These files can:

* run directly from Render
* or be mirrored to Hostinger frontend hosting

---

# GoDaddy DNS structure

Recommended DNS setup:

| Record            | Target             |
| ----------------- | ------------------ |
| Root domain / www | Hostinger          |
| api subdomain     | Render backend URL |

Example:

```txt id="c5f1jv"
myqrid.in → Hostinger
api.myqrid.in → Render backend
```

---

# Current backend URLs

| URL                                                              | Purpose                         |
| ---------------------------------------------------------------- | ------------------------------- |
| `/health`                                                        | Backend + Firebase health check |
| `/admin/db-help`                                                 | Database help                   |
| `/admin/db-status?key=YOUR_SETUP_SECRET`                         | Firestore setup readiness       |
| `/admin/setup-db?key=YOUR_SETUP_SECRET`                          | Creates setup documents         |
| `/admin/create-manufactured-tags?key=YOUR_SETUP_SECRET&count=10` | Creates manufactured stock      |
| `/admin/tag-inventory?key=YOUR_SETUP_SECRET`                     | Returns inventory JSON          |

---

# Current production architecture

```txt id="w8g94v"
GoDaddy Domain
        ↓
Hostinger Frontend
        ↓
Render Backend API
        ↓
Firebase Firestore
```

---

# Important note

Firebase Firestore is the active production database.

PostgreSQL, Prisma, Redis and enterprise backend architecture are future roadmap items and are not part of the current production deployment.
