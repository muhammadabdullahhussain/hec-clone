const fs = require('fs');
let html = fs.readFileSync('public/template.html', 'utf8');

// Find Mubara Naz
const lines = html.split('</div>');
const mubaraLine = lines.find(l => l.includes('Mubara Naz'));
console.log("Mubara Naz HTML:", mubaraLine);

// We need to extract the class name that defines its position.
// It has classes like "t m0 x6 h6 y9 ff2 fs1 fc0 sc0 ls0 ws0"
// Usually 'x' classes define left, and 'y' classes define top.
if (mubaraLine) {
    const classMatch = mubaraLine.match(/class="([^"]+)"/);
    if (classMatch) {
        const classes = classMatch[1].split(' ');
        const xClass = classes.find(c => c.startsWith('x'));
        const yClass = classes.find(c => c.startsWith('y'));
        
        // Find their definitions in the CSS
        const cssMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/);
        if (cssMatch) {
            const css = cssMatch[1];
            const xDef = css.match(new RegExp(`\\.${xClass}\\{bottom:([0-9.]+)px;\\}`));
            const yDef = css.match(new RegExp(`\\.${yClass}\\{bottom:([0-9.]+)px;\\}`));
            console.log("xDef:", xDef ? xDef[1] : "not found");
            console.log("yDef:", yDef ? yDef[1] : "not found");
            
            // Try left/top instead of bottom
            const xDef2 = css.match(new RegExp(`\\.${xClass}\\{left:([0-9.]+)px;\\}`));
            const yDef2 = css.match(new RegExp(`\\.${yClass}\\{bottom:([0-9.]+)px;\\}`)); // pdf2htmlEX uses bottom usually
            console.log("xDef (left):", xDef2 ? xDef2[1] : "not found");
            
            // Let's just grep the whole CSS for the y class
            const yRegex = new RegExp(`\\.${yClass}\\{[^}]*\\}`);
            console.log("y class full CSS:", css.match(yRegex) ? css.match(yRegex)[0] : "none");
        }
    }
}
