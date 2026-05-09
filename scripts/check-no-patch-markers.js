const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const targets = [
  "server.js",
  "package.json",
  "public",
  "README.md"
];

const blocked = [
  ["diff", " --git"].join(""),
  "@@ ",
  ["---", " a/"].join(""),
  ["+++", " b/"].join("")
];

function walk(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const stat = fs.statSync(filePath);
  if (stat.isDirectory()) {
    return fs.readdirSync(filePath).flatMap(entry => walk(path.join(filePath, entry)));
  }

const targets = [
  "server.js",
  "package.json",
  "src",
  "public",
  "docs",
  "README.md",
  "Dockerfile",
  ".dockerignore"
];

const blocked = [
  "diff --git",
  "@@ ",
  "--- a/",
  "+++ b/"
];

function walk(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const stat = fs.statSync(filePath);

  if (stat.isDirectory()) {
    return fs
      .readdirSync(filePath)
      .flatMap(entry => walk(path.join(filePath, entry)));
  }

  return [filePath];
}

const failures = [];

for (const target of targets) {
  for (const filePath of walk(path.join(root, target))) {
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) continue;
    const text = fs.readFileSync(filePath, "utf8");
    const lines = text.split(/\r?\n/);

    lines.forEach((line, index) => {
      if (blocked.some(marker => line.includes(marker))) {
        failures.push(`${path.relative(root, filePath)}:${index + 1}`);
  const targetPath = path.join(root, target);

  for (const filePath of walk(targetPath)) {
    const stat = fs.statSync(filePath);

    if (!stat.isFile()) {
      continue;
    }

    let text = "";

    try {
      text = fs.readFileSync(filePath, "utf8");
    } catch {
      continue;
    }

    const lines = text.split(/\r?\n/);

    lines.forEach((line, index) => {
      if (
        blocked.some(marker =>
          line.includes(marker)
        )
      ) {
        failures.push(
          `${path.relative(root, filePath)}:${index + 1}`
        );
      }
    });
  }
}

if (failures.length) {
  console.error("Pasted patch metadata found in deployable files:");
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("No pasted patch metadata found in deployable files.");
  console.error(
    "Pasted patch metadata found in deployable files:"
  );

  failures.forEach(failure => {
    console.error(`- ${failure}`);
  });

  process.exit(1);
}

console.log(
  "No pasted patch metadata found in deployable files."
);
