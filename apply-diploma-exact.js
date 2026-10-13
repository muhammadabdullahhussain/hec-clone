const fs = require('fs');

const pageTsxPath = 'src/app/verify/page.tsx';
let content = fs.readFileSync(pageTsxPath, 'utf8');

const diplomaHtmlPath = '/Users/muhammadabdullah/Downloads/deploma for attest.ibcc.educat.pk-verify.php-1790515469056.html';
let diplomaHtml = fs.readFileSync(diplomaHtmlPath, 'utf8');

// Replace hardcoded values with variables
diplomaHtml = diplomaHtml.replace(/Muhammad Waqar/g, '{{NAME}}');
diplomaHtml = diplomaHtml.replace(/Mukhtar Ahmed/g, '{{FATHER_NAME}}');
diplomaHtml = diplomaHtml.replace(/666317/g, '{{ROLL_NO}}');
diplomaHtml = diplomaHtml.replace(/Diploma \/ Diploma of Associate Engineer/g, '{{PROGRAM}}');
diplomaHtml = diplomaHtml.replace(/Punjab Technical Board Lahore/g, '{{BOARD}}');
diplomaHtml = diplomaHtml.replace(/Mechanical Technology/g, '{{GROUP}}');
diplomaHtml = diplomaHtml.replace(/2011 - Annual/g, '{{YEAR_SESSION}}');
diplomaHtml = diplomaHtml.replace(/2612\/3450 \(75\%\)/g, '{{MARKS}}');
diplomaHtml = diplomaHtml.replace(/C10894072/g, '{{APP_ID}}');

// Fix the logo link and image source so it doesn't jump
diplomaHtml = diplomaHtml.replace(/href="search.php"/g, 'href="https://ibcc.edu.pk/" target="_blank"');
diplomaHtml = diplomaHtml.replace(/src="\.\/apps\/attestation\/assets\/images\/logo\.jpg"/g, 'src="/Final.png"');

// Find the boundaries of the isDiploma block
const isDiplomaIndex = content.indexOf('if (isDiploma) {');
const elseIndex = content.indexOf('} else {', isDiplomaIndex);

if (isDiplomaIndex === -1 || elseIndex === -1) {
    console.error("Could not find isDiploma block");
    process.exit(1);
}

const before = content.substring(0, isDiplomaIndex);
const after = content.substring(elseIndex);

const newBlock = `if (isDiploma) {
        mobileHtml = \`${diplomaHtml.replace(/`/g, '\\`').replace(/\\$/g, '\\$')}\`;
        desktopHtml = mobileHtml;
    `;

fs.writeFileSync(pageTsxPath, before + newBlock + after, 'utf8');
console.log("Updated page.tsx with exactly ripped HTML for Diploma, fixing the logo source");
