const fs = require('fs');
const htmlPath = '/Users/muhammadabdullah/Downloads/eservices.hec.gov.pk-1791553794841.html';
const html = fs.readFileSync(htmlPath, 'utf8');

const regex = /https:\/\/[^\s"'><]+/g;
const urls = new Set();
let match;
while ((match = regex.exec(html)) !== null) {
  urls.add(match[0]);
}
console.log(Array.from(urls).join('\n'));
