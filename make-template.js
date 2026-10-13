const fs = require('fs');
let html = fs.readFileSync('public/template.html', 'utf8');

// Replace text fields exactly as they appear in the HTML
html = html.replace('Mubara Naz', '${name}');
html = html.replace('Saeed Ahmed', '${father_name}');
html = html.replace('3540139675680', '${cnic}');
html = html.replace('1998-11-13', '${date_of_birth}');
html = html.replace('2026-07-16', '${date_of_issuance}');
html = html.replace('5076464', '${reference_number.replace(/\\D/g, "").slice(-7)}');
html = html.replace('Bachelor of Science in Chemistry', '${degree_title}');
html = html.replace('University of Education, Lahore', '${university}');
html = html.replace('23-UE-12367', '${enrollment_no}');

// Escape backticks
html = html.replace(/`/g, '\\`');

const exportCode = `
export const getCertificateHtml = (data: any) => {
    const { name, father_name, cnic, date_of_birth, date_of_issuance, reference_number, degree_title, university, enrollment_no, photoDataUri, qrCodeDataUri } = data;
    
    // Inject the new photo and QR code overlays right before the closing </div> of page 1 (or at the end of body)
    const overLays = \`
        <img src="\\\${photoDataUri}" style="position: absolute; left: 381px; top: 285px; width: 156px; height: 171px; object-fit: contain; z-index: 100;" />
        <img src="\\\${qrCodeDataUri}" style="position: absolute; left: 730px; top: 40px; width: 140px; height: 140px; object-fit: contain; z-index: 100;" />
    \`;
    
    // We insert it at the end of the body
    return \`${html}\`.replace('</body>', overLays + '</body>');
};
`;

fs.writeFileSync('src/lib/certificateTemplate.ts', exportCode);
console.log("Done");
