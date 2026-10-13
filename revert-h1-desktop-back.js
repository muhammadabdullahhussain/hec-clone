const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'verify', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Find the desktopHtml section and replace the h1 back to margin-bottom: -40px
const desktopSectionStart = content.indexOf('desktopHtml = `<html>');
if (desktopSectionStart !== -1) {
    let desktopHtml = content.substring(desktopSectionStart);
    desktopHtml = desktopHtml.replace(/<h1 style="margin-top: 0px;">\n\s*<a href="#" title="Inter Board Committee of Chairmen/g, '<h1 style="margin-top: 0px; margin-bottom: -40px;">\n        <a href="#" title="Inter Board Committee of Chairmen');
    content = content.substring(0, desktopSectionStart) + desktopHtml;
    fs.writeFileSync(pagePath, content);
    console.log("Restored margin-bottom: -40px to desktop H1!");
}
