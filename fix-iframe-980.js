const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'verify', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Update the iframe style to use 980px
content = content.replace(
    /width: '408px', \n\s*height: 'calc\(100vh \* 408 \/ 100vw\)', \n\s*border: 'none', \n\s*display: 'block',\n\s*transform: 'scale\(calc\(100vw \/ 408\)\)',/g,
    `width: '980px', \n                        height: 'calc(100vh * 980 / 100vw)', \n                        border: 'none', \n                        display: 'block',\n                        transform: 'scale(calc(100vw / 980))',`
);

fs.writeFileSync(pagePath, content);
console.log("Iframe 980px fix applied!");
