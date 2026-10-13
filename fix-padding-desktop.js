const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'verify', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

const desktopSectionStart = content.indexOf('desktopHtml = `<html>');
if (desktopSectionStart !== -1) {
    let desktopHtml = content.substring(desktopSectionStart);
    desktopHtml = desktopHtml.replace(/padding: 8px 85px 10px 1px !important;/g, 'padding: 10px 85px 12px 1px !important;');
    content = content.substring(0, desktopSectionStart) + desktopHtml;
    fs.writeFileSync(pagePath, content);
    console.log("Increased vertical padding by 2px on desktop!");
}
