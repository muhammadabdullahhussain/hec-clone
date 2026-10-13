const puppeteer = require('puppeteer');
const fs = require('fs');
const { getCertificateHtml } = require('./src/lib/certificateTemplate');

async function testPdf() {
    const htmlContent = getCertificateHtml({
        name: 'Test Name',
        father_name: 'Test Father',
        cnic: '1234567890123',
        date_of_birth: '2000-01-01',
        date_of_issuance: '2026-08-01',
        reference_number: '1234567',
        degree_title: 'Bachelor of Testing',
        university: 'Test University',
        enrollment_no: '23-TEST',
        photoDataUri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        qrCodeDataUri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        qrCodeUrl: 'https://test.com'
    });

    const browser = await puppeteer.launch({
        headless: true,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'load' });
    
    const page1Buffer = await page.pdf({
        printBackground: true,
        width: '918px',
        height: '1188px',
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });
    await browser.close();

    fs.writeFileSync('test_output.pdf', page1Buffer);
    console.log('Generated test_output.pdf');
}

testPdf().catch(console.error);
