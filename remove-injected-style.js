const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'verify', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

const regex = /<style>\n@media \(max-width: 767px\) \{[\s\S]*?\}<\/style>\n/g;
content = content.replace(regex, '');

fs.writeFileSync(pagePath, content);
console.log("Removed injected style block!");
