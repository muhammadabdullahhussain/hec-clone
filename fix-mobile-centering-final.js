const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'verify', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// 1. Remove the injected mobile styles
content = content.replace(/<style>\n@media \(max-width: 767px\) \{[\s\S]*?\}<\/style>\n<\/head>/, '</head>');

// 2. Wrap the iframe in a perfectly centered 408px scaler
content = content.replace(
    /<div className="block md:hidden w-full h-\[100vh\] overflow-hidden bg-\[#f7f7f7\] m-0 p-0">\n\s*<iframe\n\s*srcDoc=\{mobileHtml\}\n\s*style=\{\{ \n\s*width: '100%', height: '100%', border: 'none', display: 'block', margin: 0, padding: 0\n\s*\}\}\n\s*title="IBCC Verification Mobile"\n\s*\/>\n\s*<\/div>/,
    `<div className="block md:hidden w-full h-[100vh] overflow-hidden m-0 p-0" style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{
                    width: '408px',
                    height: 'calc(100vh * 408 / 100vw)',
                    transform: 'scale(calc(100vw / 408))',
                    transformOrigin: 'top center',
                    backgroundColor: '#f7f7f7',
                    flexShrink: 0
                }}>
                    <iframe
                        srcDoc={mobileHtml}
                        style={{ width: '100%', height: '100%', border: 'none', display: 'block', margin: 0, padding: 0 }}
                        title="IBCC Verification Mobile"
                    />
                </div>
            </div>`
);

fs.writeFileSync(pagePath, content);
console.log("Applied flawless React layout centering!");
