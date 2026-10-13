const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'verify', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Replace the phantom grid trick with standard text
content = content.replace(/<td><div style="display:grid;align-items:center;"><div style="grid-area:1\/1;visibility:hidden;white-space:nowrap;pointer-events:none;">\{\{PROGRAM\}\}<\/div><div style="grid-area:1\/1;">\{\{PROGRAM\}\} <\/div><\/div><\/td>/g, '<td>{{PROGRAM}} </td>');
content = content.replace(/<td><div style="display:grid;align-items:center;"><div style="grid-area:1\/1;visibility:hidden;white-space:nowrap;pointer-events:none;">\{\{BOARD\}\}<\/div><div style="grid-area:1\/1;">\{\{BOARD\}\} <\/div><\/div><\/td>/g, '<td>{{BOARD}} </td>');

fs.writeFileSync(pagePath, content);
console.log("Reverted desktop HTML to normal!");
