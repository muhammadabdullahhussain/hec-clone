const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'verify', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

content = content.replace(
    /height: '100vh', \n\s*border: 'none',/g,
    `height: 'calc(100vh * 408 / 100vw)', \n                        border: 'none',`
);

fs.writeFileSync(pagePath, content);
console.log("Iframe height fix applied!");
