const fs = require("fs");
const path = require("path");

const required = [
  "src/app/App.js",
  "src/navigation/RootNavigator.js",
  "src/navigation/BottomTabs.js",
  "src/product-engines/index.js",
  "src/scanner/scanDetector.js",
  "src/services/mockApi.js",
  "src/store/AppStore.js",
  "src/screens/HomeScreen.js",
  "src/screens/ScannerScreen.js",
  "src/screens/ActivationScreen.js",
  "src/screens/QRDesignerScreen.js",
  "src/screens/AdminPanelScreen.js"
];

const root = __dirname;
const missing = required.filter(file => !fs.existsSync(path.join(root, file)));

if (missing.length) {
  console.error("Missing mobile architecture files:");
  missing.forEach(file => console.error(`- ${file}`));
  process.exit(1);
}

const engine = fs.readFileSync(path.join(root, "src/product-engines/index.js"), "utf8");
for (const requiredEngine of ["digitalIdentity", "returnMe", "helpMe", "pet", "vehicle", "business"]) {
  if (!engine.includes(requiredEngine)) {
    console.error(`Missing product engine: ${requiredEngine}`);
    process.exit(1);
  }
}

console.log("Mobile architecture files and product engines are present.");
