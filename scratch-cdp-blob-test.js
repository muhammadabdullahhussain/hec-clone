// Test: does a blob-URL iframe render the no-doctype HTML in quirks mode like file://?
const CDP_HTTP = 'http://127.0.0.1:9222';
const fs = require('fs');

const template = fs.readFileSync('/Users/muhammadabdullah/Desktop/ibcc-qr-system/src/components/diploma.html', 'utf8');

async function newTab(url) {
    const res = await fetch(`${CDP_HTTP}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
    return (await res.json());
}
function connect(wsUrl) {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(wsUrl);
        let id = 0; const pending = new Map();
        ws.onopen = () => resolve({
            send: (method, params = {}) => new Promise((res, rej) => {
                const mid = ++id; pending.set(mid, { res, rej });
                ws.send(JSON.stringify({ id: mid, method, params }));
            }),
            close: () => ws.close(),
        });
        ws.onmessage = (ev) => {
            const msg = JSON.parse(ev.data);
            if (msg.id && pending.has(msg.id)) {
                const p = pending.get(msg.id); pending.delete(msg.id);
                msg.error ? p.rej(new Error(msg.error.message)) : p.res(msg.result);
            }
        };
        ws.onerror = reject;
    });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
    console.log('STEP1: creating tab');
    const t = await newTab('about:blank');
    console.log('STEP2: target', t.id);
    const cdp = await connect(t.webSocketDebuggerUrl);
    console.log('STEP3: connected');
    await cdp.send('Runtime.enable');
    await sleep(800);

    const html = JSON.stringify(template);
    const expr = `(() => {
        const blob = new Blob([${html}], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const ifr = document.createElement('iframe');
        ifr.style.cssText = 'width:100%;height:100vh;border:0';
        document.body.appendChild(ifr);
        ifr.src = url;
        return 'blob iframe created';
    })()`;
    await cdp.send('Runtime.evaluate', { expression: expr });
    console.log('STEP5: iframe created, waiting');
    await sleep(1500);

    console.log('STEP6: inspecting');
    const check = await cdp.send('Runtime.evaluate', {
        expression: `(() => {
            const d = document.querySelector('iframe').contentDocument;
            const cs = (el,p) => d.defaultView.getComputedStyle(el)[p];
            const rect = el => { const r = el.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height}; };
            const td = d.querySelector('td');
            const trs = Array.from(d.querySelectorAll('tr'));
            return {
                compatMode: d.compatMode,
                innerWidth: d.defaultView.innerWidth,
                h1rects: Array.from(d.querySelectorAll('h1')).map(rect),
                h2rect: rect(d.querySelector('h2')),
                tdLineHeight: cs(td,'lineHeight'),
                firstRowRect: rect(trs[0]),
                secondRowRect: rect(trs[1]),
                tableRect: rect(d.querySelector('table')),
            };
        })()`,
        returnByValue: true,
    });
    console.log(JSON.stringify(check.result.value, null, 1));
    cdp.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
