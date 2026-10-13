const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'verify', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Remove line-height: 1.1 !important; from desktopHtml td
content = content.replace(/padding: 8px 85px 10px 1px !important;\n\s*line-height: 1.1 !important;/g, 'padding: 8px 85px 10px 1px !important;');

fs.writeFileSync(pagePath, content);
console.log("Removed line-height: 1.1 !important");
