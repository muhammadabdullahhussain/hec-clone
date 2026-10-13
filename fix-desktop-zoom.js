const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'verify', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

const dStart = content.indexOf('desktopHtml = `<html>');

if (dStart !== -1) {
    let dSection = content.substring(dStart);
    // Remove the 768px media query completely from desktopHtml because desktop shouldn't zoom 2.4x!
    dSection = dSection.replace(/@media \(min-width: 768px\) \{\n\s*body \{ zoom: 2\.4; \}\n\s*td \{ padding-right:30px !important; \}\n\s*\}/, '');
    
    // Also, just to be completely safe, enforce zoom: 1 globally for desktop
    dSection = dSection.replace(/body \{\n\s*background: #f7f7f7;/, 'body {\n            zoom: 1 !important;\n            background: #f7f7f7;');

    content = content.substring(0, dStart) + dSection;
    fs.writeFileSync(pagePath, content);
    console.log("Fixed desktop zoom issue!");
}
