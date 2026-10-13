const fs = require('fs');
const path = require('path');

const diplomaComponentPath = '/Users/muhammadabdullah/Desktop/ibcc-qr-system/src/components/VerifyDiploma.tsx';
const newHtmlPath = '/Users/muhammadabdullah/Downloads/attest.ibcc.edu.pk-verify.php-1790517877106.html';

let htmlContent = fs.readFileSync(newHtmlPath, 'utf8');

// Replace hardcoded values with variables for the template
htmlContent = htmlContent.replace(/Muhammad nabeel bin Rafaqat/g, '{{NAME}}');
htmlContent = htmlContent.replace(/Rafaqat ali/g, '{{FATHER_NAME}}');
htmlContent = htmlContent.replace(/103560/g, '{{ROLL_NO}}');
htmlContent = htmlContent.replace(/HSSC \/ Intermediate/g, '{{PROGRAM}}');
htmlContent = htmlContent.replace(/BISE Abbottabad/g, '{{BOARD}}');
htmlContent = htmlContent.replace(/Pre-Medical/g, '{{GROUP}}');
htmlContent = htmlContent.replace(/2024 - 2nd_Annual/g, '{{YEAR_SESSION}}');
htmlContent = htmlContent.replace(/758\/1200 \(63\.17\%\)/g, '{{MARKS}}');
htmlContent = htmlContent.replace(/C10680221/g, '{{APP_ID}}');

// Note: Certificate is attested by IBCC to... string
htmlContent = htmlContent.replace(/This Certificate is attested by IBCC to/g, 'This {{DOC_TYPE}} is attested by IBCC to');

// Escape backticks and dollars so we can put it in a JS template string safely
const escapedHtml = htmlContent.replace(/`/g, '\\`').replace(/\\$/g, '\\$');

const tsxContent = `import React from 'react';

export default function VerifyDiploma({ student, cleanName }: { student: any, cleanName: string }) {
    let diplomaHtml = \`${escapedHtml}\`;

    const docType = "Diploma";

    diplomaHtml = diplomaHtml.replace(/{{DOC_TYPE}}/g, docType);
    diplomaHtml = diplomaHtml.replace(/{{NAME}}/g, cleanName);
    diplomaHtml = diplomaHtml.replace(/{{FATHER_NAME}}/g, student.father_name);
    diplomaHtml = diplomaHtml.replace(/{{ROLL_NO}}/g, student.roll_no);
    diplomaHtml = diplomaHtml.replace(/{{PROGRAM}}/g, student.program || "");
    diplomaHtml = diplomaHtml.replace(/{{BOARD}}/g, student.board);
    diplomaHtml = diplomaHtml.replace(/{{GROUP}}/g, student.group);
    diplomaHtml = diplomaHtml.replace(/{{YEAR_SESSION}}/g, \\\`\\\${student.passing_year} - \\\${student.session}\\\`);
    diplomaHtml = diplomaHtml.replace(/{{MARKS}}/g, \\\`\\\${student.obtained_marks}/\\\${student.total_marks} (\\\${student.percentage}%)\\\`);
    diplomaHtml = diplomaHtml.replace(/{{APP_ID}}/g, student.application_id);

    return (
        <div dangerouslySetInnerHTML={{ __html: diplomaHtml }} />
    );
}
`;

fs.writeFileSync(diplomaComponentPath, tsxContent, 'utf8');
console.log("Updated VerifyDiploma with the exact single HTML file");
