const fs = require('fs');

const pageTsxPath = 'src/app/verify/page.tsx';
let content = fs.readFileSync(pageTsxPath, 'utf8');

const fontFaceCSS = `
        @font-face {
            font-family: 'Faible Test';
            src: url('/assets/fonts/faible/FaibleTest-Regular.otf') format('opentype');
        }
        @font-face {
            font-family: 'Yorkten-ExtBol';
            src: url('/assets/fonts/yorkten/yorkten-extbol.otf') format('opentype');
        }
        @font-face {
            font-family: 'Montserrat';
            src: url('/assets/fonts/montserrat/static/Montserrat-Regular.ttf') format('truetype');
        }
        @font-face {
            font-family: 'Yorkten-ConReg';
            src: url('/assets/fonts/yorkten/yorkten-conreg.otf') format('opentype');
        }
        @font-face {
            font-family: 'Yorkten-ConBol';
            src: url('/assets/fonts/yorkten/yorkten-conbol.otf') format('opentype');
        }

        body {
            font-family: 'Faible Test', sans-serif !important;
        }

        h1:nth-of-type(2) {
            font-family: 'Faible Test', sans-serif !important;
        }

        h2 {
            font-family: 'Yorkten-ExtBol', sans-serif !important;
        }

        table {
            font-family: 'Montserrat', sans-serif !important;
        }

        .footer-note {
            font-family: 'Yorkten-ConReg', sans-serif !important;
        }

        .footer-bold {
            font-family: 'Yorkten-ConBol', sans-serif !important;
        }
`;

const elseIndex = content.indexOf('} else {');
const styleIndex = content.indexOf('<style>', elseIndex);

if (elseIndex === -1 || styleIndex === -1) {
    console.error("Could not find style block in else statement");
    process.exit(1);
}

// Split the content at the else block
let beforeElse = content.substring(0, elseIndex);
let elseBlock = content.substring(elseIndex);

// Add classes to footers
elseBlock = elseBlock.replace(
    '<p>Note - Please compare',
    '<p class="footer-note">Note - Please compare'
);
elseBlock = elseBlock.replace(
    '<p style="text-align:center;color:green;font-weight:bold;">For More Information',
    '<p class="footer-bold" style="text-align:center;color:green;font-weight:bold;">For More Information'
);

// Also change Marksheet to Certificate as per user's text
elseBlock = elseBlock.replace(
    'This Marksheet is attested by IBCC',
    'This Certificate is attested by IBCC'
);


// Inject CSS
const styleEndInElse = elseBlock.indexOf('<style>') + 7;
elseBlock = elseBlock.substring(0, styleEndInElse) + fontFaceCSS + elseBlock.substring(styleEndInElse);

fs.writeFileSync(pageTsxPath, beforeElse + elseBlock, 'utf8');
console.log("Fonts CSS and classes successfully injected into page.tsx");
