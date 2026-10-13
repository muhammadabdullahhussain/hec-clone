const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'verify', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

const targetStr = `<div className="block md:hidden w-full h-[100vh] overflow-hidden bg-[#f7f7f7]">
                <iframe
                    srcDoc={mobileHtml}
                    style={{ 
                        width: '100%', height: '100%', border: 'none', display: 'block', margin: 0, padding: 0
                    }}
                    title="IBCC Verification Mobile"
                />
            </div>`;

const replacement = `<div className="block md:hidden w-full h-[100vh] overflow-hidden m-0 p-0" style={{ display: 'flex', justifyContent: 'center' }}>
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
            </div>`;

content = content.replace(targetStr, replacement);
fs.writeFileSync(pagePath, content);
console.log("Applied flawless React layout centering (attempt 2)!");
