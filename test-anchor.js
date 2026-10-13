const fs = require('fs');
let html = fs.readFileSync('public/template.html', 'utf8');
const idx = html.indexOf('<div class="pc pc1 w0 h0">');
console.log("Found at:", idx);
