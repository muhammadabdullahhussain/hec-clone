const fs = require('fs');
const content = fs.readFileSync('src/lib/certificateTemplate.ts', 'utf8');
const index = content.indexOf('${name}');
console.log(content.substring(index - 50, index + 50));
