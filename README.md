diff --git a/README.md b/README.md
index afcd5f42a3520abcd0dbc7449515f313e1bf04fd..cc76e07d1e5f6b36b9f468fdbb6d59436dde1d62 100644
--- a/README.md
+++ b/README.md
@@ -1,2 +1,44 @@
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
