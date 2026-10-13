const fs = require('fs');
const htmlPath = '/Users/muhammadabdullah/Downloads/eservices.hec.gov.pk-1791553794841.html';
const html = fs.readFileSync(htmlPath, 'utf8');

console.log(html.substring(11543700, 11545000));
