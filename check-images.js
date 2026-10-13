const fs = require('fs');
let html = fs.readFileSync('public/template.html', 'utf8');

const imgMatches = html.match(/<img[^>]+>/g);
if (imgMatches) {
    imgMatches.forEach((img, i) => {
        // extract width, height, and first 50 chars of src
        const wMatch = img.match(/width["']?:?\\s*([^"';]+)/);
        const hMatch = img.match(/height["']?:?\\s*([^"';]+)/);
        const srcMatch = img.match(/src="([^"]+)"/);
        console.log(`Image ${i}:`);
        console.log(`  Width: ${wMatch ? wMatch[1] : 'N/A'}`);
        console.log(`  Height: ${hMatch ? hMatch[1] : 'N/A'}`);
        console.log(`  Src starts with: ${srcMatch ? srcMatch[1].substring(0, 50) : 'N/A'}`);
    });
}
