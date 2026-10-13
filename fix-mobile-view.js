const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'verify', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// 1. Revert the iframe style back to normal 100%
content = content.replace(
    /width: '980px', \n\s*height: 'calc\(100vh \* 980 \/ 100vw\)', \n\s*border: 'none', \n\s*display: 'block',\n\s*transform: 'scale\(calc\(100vw \/ 980\)\)',\n\s*transformOrigin: 'top left'/g,
    `width: '100%', height: '100%', border: 'none', display: 'block'`
);

// 2. Add the clean 408px scaling CSS to mobileHtml
const injection = `
<style>
@media (max-width: 767px) {
    html, body {
        overflow-x: hidden !important;
        width: 408px !important;
        margin: 0 !important;
        padding: 0 !important;
    }
    html {
        transform: scale(calc(100vw / 408)) !important;
        transform-origin: top left !important;
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

content = content.replace(/<\/head>/, `${injection}</head>`);

fs.writeFileSync(pagePath, content);
console.log("Fixed mobile view rendering!");
