const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'verify', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Find the desktopHtml section and replace padding
const desktopSectionStart = content.indexOf('desktopHtml = `<html>');
const desktopSectionEnd = content.indexOf('}`;', desktopSectionStart);

if (desktopSectionStart !== -1 && desktopSectionEnd !== -1) {
    let desktopHtml = content.substring(desktopSectionStart, desktopSectionEnd);
    
    desktopHtml = desktopHtml.replace('padding-bottom: 10px !important;', 'padding-bottom: 6px !important;');
    desktopHtml = desktopHtml.replace('padding-top: 8px !important;', 'padding-top: 4px !important;');
    
    content = content.substring(0, desktopSectionStart) + desktopHtml + content.substring(desktopSectionEnd);
    fs.writeFileSync(pagePath, content);
    console.log("Updated padding in desktopHtml.");
} else {
    console.log("Could not find desktopHtml section.");
}
