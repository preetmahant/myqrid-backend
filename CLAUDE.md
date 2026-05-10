# myQRID Project Rules

## Project Vision
myQRID = Linktree + HiHello + Lost & Found QR Platform
India's first physical QR + digital identity platform.
Core loop: Stranger scans QR → profile loads → WhatsApp/Call instantly.

## Tech Stack (NEVER CHANGE)
- Node.js + Express.js (server.js)
- Firebase Firestore database
- Vanilla HTML + CSS + JavaScript ONLY
- Render deployment
- GitHub Codespaces development
- Mobile-first, no build tools

## NEVER USE
- React, Next.js, TypeScript, Vite, Tailwind
- Webpack, Docker, GraphQL, Prisma
- Any npm frontend framework
- JSX or TypeScript syntax

## Existing Routes (NEVER BREAK)
- GET / → serves web-mvp.html
- GET /admin
- GET /u/:username → public profile page
- GET /t/:slug → tag page (dynamic by type)
- POST /api/profiles
- GET /api/profiles/:username
- PUT /api/profiles/:username
- GET /api/tags/:slug
- GET /api/qr
- GET /api/status
- POST /api/track

## Critical Rules
- NEVER leave <<<<<<< merge markers
- NEVER duplicate CSS blocks or JS functions
- ALWAYS run npm run check after changes
- ALWAYS show diff before applying
- ALWAYS preserve Firebase + Render compatibility
- ALWAYS mobile-first responsive design
- NEVER hardcode secrets or API keys

## Core Business Logic
When QR/NFC tag scanned:
- INACTIVE tag → activation page
- PERSONAL tag → full profile with WhatsApp/Call first
- PET tag → pet profile fields only
- VEHICLE tag → vehicle profile only
- MEDICAL tag → emergency contacts prominently
- ASSET tag → asset tracking info
- LOST MODE → finder page with WhatsApp + reward

## File Structure
- server.js (backend)
- public/web-mvp.html (main frontend)
- public/style.css (styles)
- public/web-mvp.js (frontend JS)
- public/components/ (modular components)
- public/pages/ (additional pages)

## Priority Order
1. Stability over complexity
2. Mobile-first always
3. WhatsApp CTA is #1 on every profile
4. Fast load speed
5. Deployment safety

## Design System
- Brand purple: #8b5cf6
- Brand pink: #ec4899
- Dark bg: #0f0c29
- Glass effect: rgba(255,255,255,0.08)
- Always glassmorphism dark theme as default
