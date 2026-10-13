const fs = require('fs');
const htmlPath = '/Users/muhammadabdullah/Downloads/eservices.hec.gov.pk-1791553794841.html';
const html = fs.readFileSync(htmlPath, 'utf8');

const lines = html.split('\n');
const sorted = lines.map((l, i) => ({ line: i + 1, length: l.length, text: l.substring(0, 100) }))
  .sort((a, b) => b.length - a.length);

for (let i = 0; i < 5; i++) {
  console.log(`Line ${sorted[i].line}: length ${sorted[i].length}`);
  console.log(`  Preview: ${sorted[i].text}`);
}
