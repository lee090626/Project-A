const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const sourcePath = path.join(rootDir, 'config/security-headers.json');
const outputPath = path.join(rootDir, 'public/_headers');

const headers = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const lines = ['/*'];

for (const header of headers) {
  lines.push(`  ${header.key}: ${header.value}`);
}

fs.writeFileSync(outputPath, `${lines.join('\n')}\n`);
console.log(`[generate-headers] public/_headers generated from config/security-headers.json`);
