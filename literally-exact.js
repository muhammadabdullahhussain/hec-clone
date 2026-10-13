const fs = require('fs');
const verifyPhpPath = '/Users/muhammadabdullah/Downloads/temp_matric_inter/ibcc.a2zstationers.com/verify.php';
let verifyPhpHtml = fs.readFileSync(verifyPhpPath, 'utf8');

// Replace hardcoded values with placeholders based on the file content
verifyPhpHtml = verifyPhpHtml.replace('Malik Arslan Ahmed', '{{NAME}}');
verifyPhpHtml = verifyPhpHtml.replace('Malik Arslan Ahmed', '{{NAME}}'); // For the table
verifyPhpHtml = verifyPhpHtml.replace('Ahmed', '{{FATHER_NAME}}');
verifyPhpHtml = verifyPhpHtml.replace('90292', '{{ROLL_NO}}');
verifyPhpHtml = verifyPhpHtml.replace('SSC / Matric', '{{PROGRAM}}');
verifyPhpHtml = verifyPhpHtml.replace('BISE Abbottabad', '{{BOARD}}');
verifyPhpHtml = verifyPhpHtml.replace('Science', '{{GROUP}}');
verifyPhpHtml = verifyPhpHtml.replace('2026 - Annual', '{{YEAR_SESSION}}');
verifyPhpHtml = verifyPhpHtml.replace('408/850 (60.00%)', '{{MARKS}}');
verifyPhpHtml = verifyPhpHtml.replace('M00216811', '{{APP_ID}}');

// Format it so we can safely inject it into a JS template literal string.
// Escape backticks and dollar signs if any (there shouldn't be, but just in case)
let templateString = verifyPhpHtml.replace(/`/g, '\\`').replace(/\$/g, '\\$');

const pageTsxPath = 'src/app/verify/page.tsx';
let pageTsxContent = fs.readFileSync(pageTsxPath, 'utf8');

const elseIndex = pageTsxContent.indexOf('} else {');
const desktopHtmlIndex = pageTsxContent.indexOf('desktopHtml = mobileHtml; // Inter/Matric are the same on both', elseIndex);

if (elseIndex === -1 || desktopHtmlIndex === -1) {
    console.error("Could not find bounds");
    process.exit(1);
}

const before = pageTsxContent.substring(0, elseIndex);
const after = pageTsxContent.substring(desktopHtmlIndex);

const newHtml = `    } else {
        mobileHtml = \`${templateString}\`;
        `;

fs.writeFileSync(pageTsxPath, before + newHtml + after, 'utf8');
console.log("Updated page.tsx with 10000% exact HTML");
