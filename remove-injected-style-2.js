const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'verify', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

const targetStr = `<style>
@media (max-width: 767px) {
    html, body {
        overflow-x: hidden !important;
        margin: 0 auto !important;
        padding: 0 !important;
    }
    html {
        zoom: calc(100vw / 408) !important;
    }
    body {
        width: 408px !important;
        background: #f7f7f7 !important;
    }
    td {
        padding-right: 30px !important;
    }
    table {
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
    }
}
</style>
`;

content = content.replace(targetStr, '');

fs.writeFileSync(pagePath, content);
console.log("Removed injected style block!");
