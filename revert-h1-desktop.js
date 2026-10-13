const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'verify', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

content = content.replace(/<h1 style="margin-top: 0px; margin-bottom: -40px;">/g, '<h1 style="margin-top: 0px;">'); // keep margin-top: 0px for consistency if they want the logo up

fs.writeFileSync(pagePath, content);
console.log("Reverted desktop H1!");
