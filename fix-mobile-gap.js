const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'verify', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Replace the transform logic with zoom, and add explicit centering
content = content.replace(
    /html, body \{\n\s*overflow-x: hidden !important;\n\s*width: 408px !important;\n\s*margin: 0 !important;\n\s*padding: 0 !important;\n\s*\}\n\s*html \{\n\s*transform: scale\(calc\(100vw \/ 408\)\) !important;\n\s*transform-origin: top left !important;\n\s*\}/g,
    `html, body {
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
    }`
);

// Also add margin:0 padding:0 to the iframe to be 100% sure
content = content.replace(
    /<iframe\n\s*srcDoc=\{mobileHtml\}\n\s*style=\{\{ \n\s*width: '100%', height: '100%', border: 'none', display: 'block'\n\s*\}\}/g,
    `<iframe
                    srcDoc={mobileHtml}
                    style={{ 
                        width: '100%', height: '100%', border: 'none', display: 'block', margin: 0, padding: 0
                    }}`
);

fs.writeFileSync(pagePath, content);
console.log("Applied zoom and centering fix!");
