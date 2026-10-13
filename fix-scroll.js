const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'verify', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// We need to add overflow-x: hidden to the html block in the media query
content = content.replace(
    /html \{\n        width: 408px !important;\n        transform: scale\(calc\(100vw \/ 408\)\) !important;\n        transform-origin: top left !important;\n    \}/g,
    `html {\n        width: 408px !important;\n        transform: scale(calc(100vw / 408)) !important;\n        transform-origin: top left !important;\n        overflow-x: hidden !important;\n    }\n    body {\n        overflow-x: hidden !important;\n    }`
);

fs.writeFileSync(pagePath, content);
console.log("Added overflow-x: hidden");
