const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'verify', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Add line-height: 1.1 !important; back to desktopHtml td
const desktopSectionStart = content.indexOf('desktopHtml = `<html>');
if (desktopSectionStart !== -1) {
    let desktopHtml = content.substring(desktopSectionStart);
    desktopHtml = desktopHtml.replace(/padding: 8px 85px 10px 1px !important;\n\s*\}/g, 'padding: 8px 85px 10px 1px !important;\n            line-height: 1.1 !important;\n        }');
    content = content.substring(0, desktopSectionStart) + desktopHtml;
    fs.writeFileSync(pagePath, content);
    console.log("Restored line-height: 1.1 !important");
}
