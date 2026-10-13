const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'verify', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

content = content.replace(
    /<div className="hidden md:block h-full w-full">/g,
    '<div className="hidden md:block h-full w-full" style={{ backgroundColor: "#f7f7f7" }}>'
);

content = content.replace(
    /<div style=\{\{ width: '100%', height: '100vh', overflow: 'hidden' \}\}>/g,
    '<div style={{ width: "100%", height: "100vh", overflow: "hidden", backgroundColor: "#f7f7f7" }}>'
);

fs.writeFileSync(pagePath, content);
console.log("Forced desktop wrapper background to white!");
