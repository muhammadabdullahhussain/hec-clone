const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function testHecStates() {
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    console.log("Navigating to portal...");
    await page.goto('http://localhost:3000/index.html#/degree-verification/hec-verification-public', {
        waitUntil: 'domcontentloaded'
    });

    // Wait for the inputs
    await page.waitForSelector('#mat-input-0');

    // Helper to evaluate styles of input 0
    const getFieldInfo = async () => {
        return await page.evaluate(() => {
            const wrapper = document.querySelector('#mat-input-0').closest('.mat-form-field');
            const outlineThin = wrapper.querySelector('.mat-form-field-outline:not(.mat-form-field-outline-thick)');
            const outlineThick = wrapper.querySelector('.mat-form-field-outline-thick');
            const label = wrapper.querySelector('.mat-form-field-label');
            const hint = wrapper.querySelector('.mat-hint');
            const endThin = outlineThin ? outlineThin.querySelector('.mat-form-field-outline-end') : null;
            const endThick = outlineThick ? outlineThick.querySelector('.mat-form-field-outline-end') : null;

            return {
                classes: wrapper.className,
                hintColor: hint ? window.getComputedStyle(hint).color : null,
                outlineThinOpacity: outlineThin ? window.getComputedStyle(outlineThin).opacity : null,
                outlineThinColor: outlineThin ? window.getComputedStyle(outlineThin).color : null,
                outlineThickOpacity: outlineThick ? window.getComputedStyle(outlineThick).opacity : null,
                outlineThickColor: outlineThick ? window.getComputedStyle(outlineThick).color : null,
                labelBg: label ? window.getComputedStyle(label).backgroundColor : null,
                labelWidth: label ? window.getComputedStyle(label).width : null,
                labelColor: label ? window.getComputedStyle(label).color : null,
                endThickBorderTop: endThick ? window.getComputedStyle(endThick).borderTopWidth + ' ' + window.getComputedStyle(endThick).borderTopColor : null
            };
        });
    };

    const outDir = path.join(__dirname, 'qa_screenshots');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

    // 1. Initial / Resting State
    console.log("\n--- STATE A: Initial / Resting ---");
    let infoA = await getFieldInfo();
    console.log("State A info:", infoA);
    const searchPanel = await page.$('.hec-panel--search');
    await searchPanel.screenshot({ path: path.join(outDir, 'state_a_resting.png') });

    // 2. Hover State
    console.log("\n--- STATE B: Hover ---");
    const flex0 = await page.$('#mat-input-0');
    await flex0.hover();
    await new Promise(r => setTimeout(r, 200));
    let infoB = await getFieldInfo();
    console.log("State B info:", infoB);
    await searchPanel.screenshot({ path: path.join(outDir, 'state_b_hover.png') });

    // 3. Focused State
    console.log("\n--- STATE C: Focused ---");
    await page.click('#mat-input-0');
    await new Promise(r => setTimeout(r, 200));
    let infoC = await getFieldInfo();
    console.log("State C info:", infoC);
    await searchPanel.screenshot({ path: path.join(outDir, 'state_c_focused.png') });

    // 4. Unfocused Invalid State
    console.log("\n--- STATE D: Unfocused Invalid ---");
    // Click outside to blur while empty
    await page.click('.hec-panel-head');
    await new Promise(r => setTimeout(r, 200));
    let infoD = await getFieldInfo();
    console.log("State D info:", infoD);
    await searchPanel.screenshot({ path: path.join(outDir, 'state_d_unfocused_invalid.png') });

    // 5. Focused Invalid State
    console.log("\n--- STATE E: Focused Invalid ---");
    await page.click('#mat-input-0');
    await new Promise(r => setTimeout(r, 200));
    let infoE = await getFieldInfo();
    console.log("State E info:", infoE);
    await searchPanel.screenshot({ path: path.join(outDir, 'state_e_focused_invalid.png') });

    // 6. Focused Reference Number Field
    console.log("\n--- STATE F: Focused Reference Number ---");
    await page.click('#mat-input-1');
    await new Promise(r => setTimeout(r, 200));
    await searchPanel.screenshot({ path: path.join(outDir, 'state_f_ref_focused.png') });

    // 7. Type into both fields
    console.log("\n--- STATE G: Typed Valid ---");
    await page.type('#mat-input-0', '1234567890123');
    await page.type('#mat-input-1', 'HEC-REF-1234567890');
    // Blur
    await page.click('.hec-panel-head');
    await new Promise(r => setTimeout(r, 200));
    await searchPanel.screenshot({ path: path.join(outDir, 'state_g_typed_valid.png') });

    // 8. Reset
    console.log("\n--- STATE H: Reset ---");
    await page.click('.hec-btn--reset');
    await new Promise(r => setTimeout(r, 200));
    await searchPanel.screenshot({ path: path.join(outDir, 'state_h_reset.png') });

    await browser.close();
    console.log("\nDone! Screenshots saved to qa_screenshots/");
}

testHecStates().catch(console.error);
