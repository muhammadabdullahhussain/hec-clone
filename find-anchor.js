const fs = require('fs');
let html = fs.readFileSync('public/template.html', 'utf8');

// The end of page 1 is usually followed by page 2
const idx = html.indexOf('<div id="pf2"');
console.log("Found pf2 at:", idx);
if (idx !== -1) {
    console.log(html.substring(idx - 100, idx + 50));
}
