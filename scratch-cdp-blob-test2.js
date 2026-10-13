// Blob-URL iframe quirks-mode test (clean version)
const CDP = 'http://127.0.0.1:9222';
const fs = require('fs');
const template = fs.readFileSync('/Users/muhammadabdullah/Desktop/ibcc-qr-system/src/components/diploma.html', 'utf8');
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
    const r = await fetch(CDP + '/json/new?' + encodeURIComponent('about:blank'), { method: 'PUT' });
    const t = await r.json();
    const ws = new WebSocket(t.webSocketDebuggerUrl);
    let id = 0; const pend = new Map();
    ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id); } };
    const send = (method, params = {}) => new Promise(res => { const mid = ++id; pend.set(mid, res); ws.send(JSON.stringify({ id: mid, method, params })); });
    await new Promise(res => ws.onopen = res);
    await send('Runtime.enable');
    await sleep(500);

    const html = JSON.stringify(template);
    const createExpr = '(()=>{const u=URL.createObjectURL(new Blob([' + html + '],{type:\'text/html\'}));const i=document.createElement(\'iframe\');i.style.cssText=\'width:100%;height:100vh;border:0\';document.body.appendChild(i);i.src=u;return \'ok\';})()';
    await send('Runtime.evaluate', { expression: createExpr, returnByValue: true });
    await sleep(2000);

    const evalJs = async (label, js) => {
        const res = await send('Runtime.evaluate', { expression: js, returnByValue: true });
        console.log(label, '=>', JSON.stringify(res.result && res.result.value));
    };

    await evalJs('A compatMode', "document.querySelector('iframe').contentDocument.compatMode");
    await evalJs('B td lineHeight', "(function(d){return getComputedStyle(d.querySelector('td')).lineHeight})(document.querySelector('iframe').contentDocument)");
    await evalJs('C row rects', "(function(d){return Array.from(d.querySelectorAll('tr')).slice(0,3).map(function(t){var r=t.getBoundingClientRect();return {y:r.y,h:r.height}})})(document.querySelector('iframe').contentDocument)");
    await evalJs('D h1 rects', "(function(d){return Array.from(d.querySelectorAll('h1')).map(function(h){var r=h.getBoundingClientRect();return {y:r.y,h:r.height}})})(document.querySelector('iframe').contentDocument)");
    await evalJs('E h2 rect', "(function(d){var r=d.querySelector('h2').getBoundingClientRect();return {y:r.y,h:r.height}})(document.querySelector('iframe').contentDocument)");
    await evalJs('F img rect', "(function(d){var r=d.querySelector('img').getBoundingClientRect();return {y:r.y,h:r.height,w:r.width}})(document.querySelector('iframe').contentDocument)");
    console.log('DONE');
    ws.close();
    process.exit(0);
})().catch(e => { console.error('FAIL', e && e.message); process.exit(1); });
