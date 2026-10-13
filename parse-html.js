const fs = require('fs');
let html = fs.readFileSync('public/template.html', 'utf8');

// Find the style tag or inline styles for the main divs
const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/);
if (styleMatch) {
    const css = styleMatch[1];
    // Find classes with 'w' and 'h' which usually define width/height
    const dims = css.match(/\.(w[0-9a-z]+)\{width:([0-9.]+)px;\}/g);
    console.log("Widths:", dims ? dims.slice(0, 5) : "none");
    
    // Find classes for the background image
    const bgMatches = css.match(/\.(x[0-9a-z]+)\{left:([0-9.]+)px;\}/g);
    console.log("Lefts:", bgMatches ? bgMatches.slice(0, 5) : "none");
}
