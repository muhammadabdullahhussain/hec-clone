const fs = require('fs');
let html = fs.readFileSync('public/template.html', 'utf8');

const imgMatches = html.match(/<img[^>]+>/g);
if (imgMatches) {
    imgMatches.forEach((img, i) => {
        const classMatch = img.match(/class="([^"]+)"/);
        console.log(`Image ${i} class: ${classMatch ? classMatch[1] : 'none'}`);
    });
}
