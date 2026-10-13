const fs = require('fs');
let html = fs.readFileSync('public/template.html', 'utf8');

// Find Reference No
const lines = html.split('</div>');
const refLine = lines.find(l => l.includes('Reference No.'));
console.log("Ref Line:", refLine);

if (refLine) {
    const classMatch = refLine.match(/class="([^"]+)"/);
    if (classMatch) {
        const classes = classMatch[1].split(' ');
        const xClass = classes.find(c => c.startsWith('x'));
        const yClass = classes.find(c => c.startsWith('y'));
        
        const cssMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/);
        if (cssMatch) {
            const css = cssMatch[1];
            // Try to find the actual definitions
            const xMatch = css.match(new RegExp(`\\.${xClass}\\{([^}]+)\\}`));
            const yMatch = css.match(new RegExp(`\\.${yClass}\\{([^}]+)\\}`));
            console.log("X CSS:", xMatch ? xMatch[1] : 'not found');
            console.log("Y CSS:", yMatch ? yMatch[1] : 'not found');
        }
    }
}
