const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'verify', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// 1. Remove the hacky CSS from mobileHtml
content = content.replace(/@media \(max-width: 767px\) \{[\s\S]*?\n\}/, '');

// 2. We also changed table to `display: table; margin: 0 auto;`. Let's revert it back to flex to be 1000% original.
content = content.replace(/table \{\n\s*border-collapse: collapse;\n\s*display: table;\n\s*margin: 0 auto;\n\}/, `table {\n    border-collapse: collapse;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n}`);

// 3. We changed td padding-right from 85px to 30px? No, we set it to 30px! But wait, original was 85px!
// Let's restore the exact original td for mobileHtml.
content = content.replace(/td \{\n\s*font-size: 16px;\n\s*font-weight: bold;\n\s*color: #212529 !important;\n\s*padding-right: 30px !important;\n\s*padding-bottom: 10px;\n\s*padding-top: 8px;\n\}/, `td {\n    font-size: 16px;\n    font-weight: bold;\n    color: #212529 !important;\n    padding-right: 85px;\n    padding-bottom: 10px;\n    padding-top: 8px;\n}`);

// 4. Update the iframe style in the mobile block
content = content.replace(
    /<div className="block md:hidden h-full w-full">\n\s*<iframe\n\s*srcDoc=\{mobileHtml\}\n\s*style=\{\{ width: '100%', height: '100%', border: 'none', display: 'block' \}\}\n\s*title="IBCC Verification Mobile"\n\s*\/>\n\s*<\/div>/,
    `<div className="block md:hidden w-full h-[100vh] overflow-hidden bg-[#f7f7f7]">
                <iframe
                    srcDoc={mobileHtml}
                    style={{ 
                        width: '408px', 
                        height: '100vh', 
                        border: 'none', 
                        display: 'block',
                        transform: 'scale(calc(100vw / 408))',
                        transformOrigin: 'top left'
                    }}
                    title="IBCC Verification Mobile"
                />
            </div>`
);

fs.writeFileSync(pagePath, content);
console.log("Iframe scale fix applied!");
