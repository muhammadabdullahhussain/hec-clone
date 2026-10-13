// CDP comparison: localhost iframe vs file:// document computed styles
const CDP_HTTP = 'http://127.0.0.1:9222';

async function newTab(url) {
    const res = await fetch(`${CDP_HTTP}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
    const target = await res.json();
    return target;
}

function connect(wsUrl) {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(wsUrl);
        let id = 0;
        const pending = new Map();
        ws.onopen = () => resolve({
            send: (method, params = {}) => new Promise((res, rej) => {
                const mid = ++id;
                pending.set(mid, { res, rej });
                ws.send(JSON.stringify({ id: mid, method, params }));
            }),
            close: () => ws.close(),
        });
        ws.onmessage = (ev) => {
            const msg = JSON.parse(ev.data);
            if (msg.id && pending.has(msg.id)) {
                const { res, rej } = pending.get(msg.id);
                pending.delete(msg.id);
                if (msg.error) rej(new Error(msg.error.message)); else res(msg.result);
            }
        };
        ws.onerror = reject;
    });
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function inspect(cdp, expression) {
    const r = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) return { error: JSON.stringify(r.exceptionDetails) };
    return r.result.value;
}

const COLLECT = `(() => {
    const d = document.querySelector('iframe') ? document.querySelector('iframe').contentDocument : document;
    const cs = (el, p) => d.defaultView.getComputedStyle(el)[p];
    const rect = (el) => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; };
    const body = d.body;
    const h1s = d.querySelectorAll('h1');
    const h2 = d.querySelector('h2');
    const tds = d.querySelectorAll('td');
    const table = d.querySelector('table');
    return {
        doctype: d.doctype ? d.doctype.name : null,
        compatMode: d.compatMode,
        innerWidth: d.defaultView.innerWidth,
        body: {
            zoom: cs(body, 'zoom'),
            margin: cs(body, 'margin'),
            fontFamily: cs(body, 'fontFamily'),
            fontSize: cs(body, 'fontSize'),
            lineHeight: cs(body, 'lineHeight'),
            rect: rect(body),
        },
        h1count: h1s.length,
        h1: Array.from(h1s).map(h => ({ text: h.textContent.slice(0,40), marginTop: cs(h,'marginTop'), marginBottom: cs(h,'marginBottom'), fontSize: cs(h,'fontSize'), lineHeight: cs(h,'lineHeight'), rect: rect(h) })),
        h2: h2 ? { text: h2.textContent.slice(0,40), marginTop: cs(h2,'marginTop'), fontSize: cs(h2,'fontSize'), rect: rect(h2) } : null,
        td: tds.length ? { lineHeight: cs(tds[0],'lineHeight'), fontSize: cs(tds[0],'fontSize'), paddingTop: cs(tds[0],'paddingTop'), paddingBottom: cs(tds[0],'paddingBottom'), rect: rect(tds[0]) } : null,
        table: table ? { display: cs(table,'display'), rect: rect(table) } : null,
        rowRects: Array.from(d.querySelectorAll('tr')).map(tr => rect(tr)),
    };
})()`;

(async () => {
    const targets = [];
    targets.push(await newTab('http://localhost:3000/verify?code=41861018f30b4b47b5a2211ef403700bb0705ddc45de5483'));
    targets.push(await newTab('file:///Users/muhammadabdullah/Downloads/attest.ibcc.educat.pk-verify.php-1790518487694%20(1).html'));
    await sleep(2500);

    for (const t of targets) {
        const cdp = await connect(t.webSocketDebuggerUrl);
        await cdp.send('Runtime.enable');
        const before = await inspect(cdp, 'document.readyState');
        await cdp.send('Page.enable');
        await sleep(1500);
        const data = await inspect(cdp, COLLECT);
        console.log('\n===== ' + t.url + ' =====');
        console.log('readyState:', before);
        console.log(JSON.stringify(data, null, 1));
        cdp.close();
    }
})().catch(e => { console.error('FAIL', e); process.exit(1); });
