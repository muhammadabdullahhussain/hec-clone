const fs = require('fs');
let html = fs.readFileSync('public/template.html', 'utf8');

// Replace text fields
html = html.replace('Mubara Naz', '${name}');
html = html.replace('Saeed Ahmed', '${father_name}');
html = html.replace('3540139675680', '${cnic}');
html = html.replace('1998-11-13', '${date_of_birth}');
html = html.replace('2026-07-16', '${date_of_issuance}');
html = html.replace('5076464', '${reference_number.replace(/\\D/g, "").slice(-7)}');
html = html.replace('Bachelor of Science in Chemistry', '${degree_title}');
html = html.replace('University of Education, Lahore', '${university}');
html = html.replace('23-UE-12367', '${enrollment_no}');

// CloudConvert usually puts images in <img> tags with base64 src.
const imgMatches = html.match(/<img[^>]+>/g);
if (imgMatches) {
    console.log("Found img tags:", imgMatches.length);
    // Usually the photo is one of these. But wait, cloudconvert usually puts all text over absolute images.
    // If we just use the HTML as-is, the old photo will still be there!
}

// We will just do a simple search for the photo's base64 or coordinates.
// Since it's a 2-page PDF, CloudConvert generated both pages.
// We only want the first page! But Puppeteer can render both, and then pdf-lib will merge? No, Puppeteer will render all pages, but I only want Page 1.
// We can just render the whole HTML and take page 1.

// Let's replace backticks so the template literal works
html = html.replace(/`/g, '\\`');

const exportCode = `
export const getCertificateHtml = (data) => {
    const { name, father_name, cnic, date_of_birth, date_of_issuance, reference_number, degree_title, university, enrollment_no, photoDataUri, qrCodeDataUri } = data;
    return \`${html}\`;
};
`;
fs.writeFileSync('src/lib/certificateTemplate.ts', exportCode);
console.log("Written to src/lib/certificateTemplate.ts");
