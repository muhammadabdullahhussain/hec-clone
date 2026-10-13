const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');

async function run() {
    const pdfBytes = fs.readFileSync('public/hec_template.pdf');
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Remove all pages except the first one to make it our template
    while(pdfDoc.getPageCount() > 1) {
        pdfDoc.removePage(1);
    }

    const page = pdfDoc.getPages()[0];
    const { width, height } = page.getSize();
    console.log(`Size: ${width} x ${height}`);

    // Draw white rectangles
    const drawWhite = (x, y, w, h) => {
        page.drawRectangle({ x, y, width: w, height: h, color: rgb(1, 1, 1) });
    }

    // Coordinates (Estimation)
    // Ref No
    drawWhite(210, 615, 200, 15);
    // Photo (x=240, y=490, w=100, h=110)
    drawWhite(250, 490, 95, 115);
    
    // Name
    drawWhite(190, 452, 300, 14);
    // Father Name
    drawWhite(190, 420, 300, 14);
    // CNIC
    drawWhite(190, 390, 300, 14);
    // DOB
    drawWhite(190, 355, 300, 14);
    // Issuance
    drawWhite(190, 323, 300, 14);

    // Paragraph
    drawWhite(120, 240, 400, 40);

    const outBytes = await pdfDoc.save();
    fs.writeFileSync('public/test_out.pdf', outBytes);
}
run().catch(console.error);
