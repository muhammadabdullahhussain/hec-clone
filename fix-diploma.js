const fs = require('fs');

const routeTsPath = 'src/app/verify/route.ts';
let content = fs.readFileSync(routeTsPath, 'utf8');

// Fix the h2 styling
content = content.replace(
    '<h2>This Certificate is attested by IBCC',
    '<h2 style="text-align:center;color:green;">This Certificate is attested by IBCC'
);

// Fix the broken table flex CSS
content = content.replace(
    'table {\\n    display: flex;\\n    justify-content: center;\\n    align-items: center;\\n    margin-top: 50px;\\n}',
    'table {\\n    display: table;\\n    margin: 50px auto 0 auto;\\n    width: 60%;\\n}'
);

fs.writeFileSync(routeTsPath, content, 'utf8');
console.log("Fixed the broken CSS that the extension ripped incorrectly for Diploma.");
