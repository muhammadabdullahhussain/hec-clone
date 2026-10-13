const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'verify', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Update mobileHtml td
content = content.replace(/td \{\n\s*font-size: 16px;\n\s*font-weight: bold;\n\s*color: #212529 !important;\n\s*padding-right: 85px;\n\s*padding-bottom: 10px;\n\s*padding-top: 8px;\n\}/g, `td {\n    font-size: 16px;\n    font-weight: bold;\n    color: #212529 !important;\n    padding: 8px 85px 10px 1px !important;\n}`);

// Update desktopHtml td
content = content.replace(/td \{\n\s*font-size: 16px;\n\s*font-weight: bold;\n\s*color: #000 !important;\n\s*padding-right: 85px !important;\n\s*padding-bottom: 10px !important;\n\s*padding-top: 8px !important;\n\s*line-height: 1.1 !important;\n\s*\}/g, `td {\n            font-size: 16px;\n            font-weight: bold;\n            color: #212529 !important;\n            padding: 8px 85px 10px 1px !important;\n            line-height: 1.1 !important;\n        }`);

// Wait, the mobileHtml one might not have the !important on padding-right anymore? No, it's 85px.
// Let's just do a safer replace using substring for desktopHtml
const dStart = content.indexOf('desktopHtml = `<html>');
if (dStart !== -1) {
    let dSection = content.substring(dStart);
    dSection = dSection.replace(/td \{\n\s*font-size: 16px;\n\s*font-weight: bold;\n\s*color: #000 !important;\n\s*padding-right: 85px !important;\n\s*padding-bottom: 10px !important;\n\s*padding-top: 8px !important;\n\s*line-height: 1.1 !important;\n\s*\}/g, `td {\n            font-size: 16px;\n            font-weight: bold;\n            color: #212529 !important;\n            padding: 8px 85px 10px 1px !important;\n            line-height: 1.1 !important;\n        }`);
    content = content.substring(0, dStart) + dSection;
}

const mStart = content.indexOf('mobileHtml = `<html>');
if (mStart !== -1) {
    let mSection = content.substring(mStart, dStart);
    mSection = mSection.replace(/td \{\n\s*font-size: 16px;\n\s*font-weight: bold;\n\s*color: #212529 !important;\n\s*padding-right: 85px;\n\s*padding-bottom: 10px;\n\s*padding-top: 8px;\n\}/g, `td {\n    font-size: 16px;\n    font-weight: bold;\n    color: #212529 !important;\n    padding: 8px 85px 10px 1px !important;\n}`);
    content = content.substring(0, mStart) + mSection + content.substring(dStart);
}

fs.writeFileSync(pagePath, content);
console.log("Updated TD styles!");
