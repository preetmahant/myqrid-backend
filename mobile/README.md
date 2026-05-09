# myQRID React Native mobile app

This folder contains the production-grade mobile frontend architecture for myQRID.

## Active stack alignment

- Frontend mobile architecture: React Native / Expo-ready.
- Backend APIs: current Render + Express + Firebase Firestore stack.
- Hosting/web companion: Hostinger static frontend from `public/`.

## Architecture

The app follows a scalable super-app structure:

- `src/app` app entry.
- `src/navigation` custom bottom navigation with Home, Scan, Quick Actions, Insights and Profile.
- `src/components` reusable glassmorphism components.
- `src/product-engines` dynamic engines for Digital Identity, ReturnMe, HelpMe, Pet, Vehicle and Business.
- `src/configs` tag type and module registries.
- `src/services` working mock APIs for scan detection, claim activation, QR design, admin tag generation and module visibility.
- `src/store` shared state and navigation actions.
- `src/screens` working flows for home, scanner, quick actions, insights, profile, activation, QR designer, dynamic profile, shop, family safety and admin.

## Implemented flows

1. Bottom navigation retention loop.
2. Smart scanner result detection for UPI, payment links, myQRID and ReturnMe tags.
3. User custom QR designer with center logo preview and export states.
4. Claim-ID tag activation flow.
5. Dynamic profile rendering by tag type.
6. Admin generation of up to 1000 unique slugs and claim IDs in mock state.
7. Admin visibility toggles for app pages/modules.
8. Analytics dashboard cards, heatmap-style visual and device stats.
9. Shop/creator monetization screen.
10. Family safety and SOS-ready screen.

## Design system

- Primary: `#7C3AED`
- Accent: `#22D3EE`
- Background: `#0F0F1A`
- UI: glassmorphism, floating cards, gradients, large India-first touch targets.

## Run later

```bash
cd mobile
npm install
npm start
```
