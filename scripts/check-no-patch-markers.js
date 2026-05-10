const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const BLOCKED = [
  '<<<<<<<',
  '=======',
  '>>>>>>>'
];

const IGNORE = [
  'node_modules',
  '.git'
];

function scan(dir) {
  const entries = fs.readdirSync(dir);

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);

    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!IGNORE.includes(entry)) {
        scan(fullPath);
      }
      continue;
    }

    const content = fs.readFileSync(fullPath, 'utf8');

    for (const token of BLOCKED) {
      if (content.includes(token)) {
        console.error(`Merge marker found in: ${fullPath}`);
        process.exit(1);
      }
    }
  }
}

scan(ROOT);

console.log('No merge conflict markers found.');