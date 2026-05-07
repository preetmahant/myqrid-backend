diff --git a/README.md b/README.md
index afcd5f42a3520abcd0dbc7449515f313e1bf04fd..108b14501d90c9a38aba30ed7f9e59876734495f 100644
--- a/README.md
+++ b/README.md
@@ -1,2 +1,104 @@
 # myqrid-backend
-myQRID backend - QR based identity, lead capture &amp; lost &amp; found system (Node.js + Express + Firebase)
+
+myQRID backend - QR based identity, lead capture & lost & found system (Node.js + Express + Firebase).
+
+## Premium viewer frontend
+
+Static frontend files are now included for the Hostinger / viewer UI flow:
+
+- `public/index.html` — premium mobile-first viewer page with five working sections: myQRID, Shop, Scan, Insight, More.
+- `public/style.css` — medium-tone purple glassmorphism theme.
+- `public/app.js` — dynamic profile loading from `https://myqrid-backend.onrender.com/:username`, smart links, product cards, QR sharing, vCard download, and analytics display.
+
+Use these same files on Hostinger if the frontend is hosted separately. The backend also serves them at `/` for quick preview.
+
+## Render deploy troubleshooting
+
+If Render logs show this error:
+
+```txt
+SyntaxError: Unexpected identifier 'git'
+diff --git a/server.js b/server.js
+```
+
+then a GitHub diff/patch was pasted into `server.js` instead of only the JavaScript code. Render runs `node server.js`, so lines like `diff --git`, `@@`, `--- a/server.js`, or `+++ b/server.js` will crash the deployment.
+
+Fix:
+
+1. Open `server.js` in GitHub or your editor.
+2. Remove every pasted diff line such as `diff --git ...`, `@@ ...`, `--- ...`, and `+++ ...`.
+3. Keep only valid JavaScript starting with:
+
+```js
+const express = require("express");
+const admin = require("firebase-admin");
+const cors = require("cors");
+```
+
+4. Before pushing, run:
+
+```bash
+npm run check
+```
+
+5. Commit and push again. Render should redeploy from the clean JavaScript file.
+
+## Render `package.json` JSON parse failure
+
+If Render logs show this error:
+
+```txt
+npm error JSON.parse Invalid package.json
+Unexpected token "d" ... "diff --git" ... is not valid JSON
+```
+
+then a GitHub diff/patch was pasted into `package.json`. Unlike JavaScript files, `package.json` must be pure JSON only. It cannot contain comments, `diff --git`, `@@`, `---`, `+++`, or any pasted PR diff text.
+
+Use this clean `package.json`:
+
+```json
+{
+  "name": "myqrid-backend",
+  "version": "1.0.0",
+  "description": "myQRID backend - QR based identity, lead capture & lost & found system",
+  "main": "server.js",
+  "scripts": {
+    "start": "node server.js",
+    "dev": "node --watch server.js",
+    "check": "node --check server.js && node --check public/app.js"
+  },
+  "dependencies": {
+    "cors": "^2.8.5",
+    "express": "^4.19.2",
+    "qrcode": "^1.5.3",
+    "nanoid": "^3.3.7",
+    "firebase-admin": "^11.10.1"
+  }
+}
+```
+
+After replacing `package.json`, run this locally before pushing:
+
+```bash
+node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package ok')"
+npm run check
+```
+
+## Render deploy starts then exits early
+
+If Render shows build success and then:
+
+```txt
+Running 'node server.js'
+Application exited early
+```
+
+check `/health` after the next deploy. The server now stays alive even when Firebase Admin cannot initialize and reports the Firebase error in `/health` as `firebase_error`. Most commonly this means `FIREBASE_PRIVATE_KEY` was pasted in the wrong format on Render.
+
+For Render, keep the private key as one environment value with escaped newlines:
+
+```txt
+-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
+```
+
+Do not paste Git diffs into any source file, and do not wrap the private key in extra quotes unless Render added them automatically.
