const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'verify', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

console.log("Check if table display is updated:");
const match = content.match(/table \{\n\s*border-collapse: collapse;\n\s*display: table;\n\s*margin: 0 auto;\n\}/);
if (match) {
    console.log("Table is updated successfully!");
} else {
    console.log("Table is NOT updated!");
}
