const fs = require('fs');
let html = fs.readFileSync('public/template.html', 'utf8');

// Find the line that says "Mubara Naz"
const lines = html.split('\n');
const match = lines.find(l => l.includes('Mubara Naz'));
console.log(match);
