const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'verify', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

const mStart = content.indexOf('mobileHtml = `<html>');
const dStart = content.indexOf('desktopHtml = `<html>');

if (mStart !== -1 && dStart !== -1) {
    let mSection = content.substring(mStart, dStart);
    mSection = mSection.replace(/td \{\n\s*font-size: 16px;\n\s*font-weight: bold;\n\s*color: #212529 !important;\n\s*padding: 8px 85px 10px 1px !important;\n\}/g, `td {\n    font-size: 16px;\n    font-weight: bold;\n    color: #212529 !important;\n    padding-right: 85px;\n    padding-bottom: 10px;\n    padding-top: 8px;\n}`);
    content = content.substring(0, mStart) + mSection + content.substring(dStart);
    fs.writeFileSync(pagePath, content);
    console.log("Reverted mobile base td padding!");
}
