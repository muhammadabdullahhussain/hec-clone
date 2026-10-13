const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'verify', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

const hackString = `/* Added to perfectly mimic the missing viewport meta tag zoom behavior of the live site on mobile screens */
@media (max-width: 767px) {
    html {
        width: 980px !important;
        transform: scale(calc(100vw / 980)) !important;
        transform-origin: top center !important;
        background-color: #202124 !important; /* Chrome dark background */
    }
    body {
        min-height: 100vh;
        background-color: #f7f7f7 !important;
    }
}

`;

content = content.replace(hackString, '');

// Also revert the iframe wrapper for mobile
const badWrapper = `<div className="block md:hidden h-full w-full bg-[#202124]">`;
const goodWrapper = `<div className="block md:hidden h-full w-full">`;
content = content.replace(badWrapper, goodWrapper);

fs.writeFileSync(pagePath, content);
console.log("Reverted hack.");
