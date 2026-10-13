const fs = require('fs');
const htmlPath = '/Users/muhammadabdullah/Downloads/eservices.hec.gov.pk-1791553794841.html';
const html = fs.readFileSync(htmlPath, 'utf8');

const regex = /data:image\/png;base64,[a-zA-Z0-9+/=\r\n\s]+/g;
let match;
while ((match = regex.exec(html)) !== null) {
  if (match[0].length === 70894) {
    fs.writeFileSync('/Users/muhammadabdullah/Desktop/hec-qr-system/photo.png', Buffer.from(match[0].split(',')[1], 'base64'));
  }
  if (match[0].length === 25538) {
    fs.writeFileSync('/Users/muhammadabdullah/Desktop/hec-qr-system/qr.png', Buffer.from(match[0].split(',')[1], 'base64'));
  }
}
