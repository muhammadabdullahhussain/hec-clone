const fs = require('fs');
const path = require('path');

const sourcePath = '/Users/muhammadabdullah/Downloads/DAS_revamped_AppForm_32496996 (1).html';
const destPath = path.join(__dirname, 'src', 'lib', 'certificateTemplate.ts');

let html = fs.readFileSync(sourcePath, 'utf8');

// Replace the image sources
// The photo is 160x160
html = html.replace(
  /<img class="im" src="data:image\/jpeg;base64,[^"]+" style="z-index:136;width:160px;height:160px[^"]+" alt="">/,
  `<img class="im" src="\${data.photoDataUri}" style="z-index:136;width:160px;height:160px;transform:matrix(1,0,0,1,610.67,40)" alt="">`
);

// The QR code is 113x113
html = html.replace(
  /<img class="im" src="data:image\/png;base64,[^"]+" style="z-index:135;width:113.33px;height:113.33px[^"]+" alt="">/,
  `<img class="im" src="\${data.qrCodeDataUri}" style="z-index:135;width:113.33px;height:113.33px;transform:matrix(1,0,0,1,36,66.67)" alt="">`
);

// Mappings from plan
html = html.replace('Saeed Ahmed', '${data.name}');
html = html.replace('Mubara Naz', '${data.father_name}');
html = html.replace('3540139675680', '${data.cnic}');
html = html.replace('1998-11-13', '${data.date_of_birth}');
html = html.replace('2026-07-16', '${data.date_of_issuance}');
html = html.replace('Bachelor of Science in Chemistry', '${data.degree_title}');
html = html.replace('University of Education, Lahore', '${data.university}');
html = html.replace('23-UE-12367', '${data.enrollment_no}');
html = html.replace('HEC/A&amp;A/DAS/2026/5076464', 'HEC/A&amp;A/DAS/2026/${data.reference_number}');
html = html.replace('HEC/A&A/DAS/2026/5076464', 'HEC/A&A/DAS/2026/${data.reference_number}');

// Verification URLs
html = html.replace(/https:\/\/www\.hec\.gov\.pk\/site\/verification/g, '${data.qrCodeUrl}');

// Escape backticks
html = html.replace(/`/g, '\\`');

const tsContent = `export const getCertificateHtml = (data: any) => {
  return \`${html}\`;
};
`;

fs.writeFileSync(destPath, tsContent, 'utf8');
console.log('Successfully generated src/lib/certificateTemplate.ts');
