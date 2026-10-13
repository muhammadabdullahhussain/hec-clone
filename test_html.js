const fs = require('fs');
// We need to compile the TS file or just extract the string part.
const template = fs.readFileSync('./src/lib/certificateTemplate.ts', 'utf-8');
// It's just a string interpolation. We can execute it in JS.
const jsCode = template.replace('export const getCertificateHtml = (data: any) => {', 'function getCertificateHtml(data) {')
                       .replace('const { name, father_name, cnic, date_of_birth, date_of_issuance, reference_number, degree_title, university, enrollment_no, photoDataUri, qrCodeDataUri } = data;', 'const { name, father_name, cnic, date_of_birth, date_of_issuance, reference_number, degree_title, university, enrollment_no, photoDataUri, qrCodeDataUri } = data;')
                       .replace(/export const /g, 'const ');

const fullCode = jsCode + `
const html = getCertificateHtml({
    name: 'MUHAMMAD ABDULLAH',
    father_name: 'FATHER NAME',
    cnic: '12345-6789012-3',
    date_of_birth: '01-01-2000',
    date_of_issuance: '10-10-2026',
    reference_number: '1234567',
    degree_title: 'BACHELOR OF SCIENCE',
    university: 'TEST UNIVERSITY',
    enrollment_no: 'FA12-BSE-001',
    photoDataUri: 'https://via.placeholder.com/150',
    qrCodeDataUri: 'https://via.placeholder.com/150'
});
fs.writeFileSync('test_output.html', html);
console.log('HTML written to test_output.html');
`;

fs.writeFileSync('temp_runner.js', fullCode);
