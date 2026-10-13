const fs = require('fs');
let html = fs.readFileSync('public/template.html', 'utf8');
const imgMatches = html.match(/<img[^>]+>/g);
if (imgMatches) {
    imgMatches.forEach((img, i) => {
        const src = img.match(/src="([^"]+)"/)[1];
        console.log(`Image ${i} size (chars): ${src.length}`);
    });
}
