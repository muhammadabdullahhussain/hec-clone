const fs = require('fs');
const PDFParser = require('pdf2json');

const pdfParser = new PDFParser();

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
pdfParser.on("pdfParser_dataReady", pdfData => {
    fs.writeFileSync('pdfData.json', JSON.stringify(pdfData, null, 2));
    console.log("Written to pdfData.json");
});

pdfParser.loadPDF("public/hec_template.pdf");
