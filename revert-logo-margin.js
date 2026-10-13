const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'verify', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// The mobileHtml h1 is: <h1 style="margin-top: 0px;">
// Let's replace it with just <h1>
const mStart = content.indexOf('mobileHtml = `<html>');
const dStart = content.indexOf('desktopHtml = `<html>');

if (mStart !== -1 && dStart !== -1) {
    let mSection = content.substring(mStart, dStart);
    mSection = mSection.replace(/<h1 style="margin-top: 0px;">/g, '<h1>');
    content = content.substring(0, mStart) + mSection + content.substring(dStart);
    fs.writeFileSync(pagePath, content);
    console.log("Reverted logo margin-top in mobileHtml!");
}
