const fs = require('fs');
let html = fs.readFileSync('public/template.html', 'utf8');

const searchStrings = ['Name:', 'Father Name:', 'CNIC No.'];
const lines = html.split('</div>');

for (const s of searchStrings) {
    const line = lines.find(l => l.includes(s));
    console.log(`Found ${s}:`, line !== undefined);
    if (line) {
        const classMatch = line.match(/class="([^"]+)"/);
        if (classMatch) {
            const classes = classMatch[1].split(' ');
            const xClass = classes.find(c => c.startsWith('x'));
            const yClass = classes.find(c => c.startsWith('y'));
            
            const cssMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/);
            if (cssMatch) {
                const css = cssMatch[1];
                const xMatch = css.match(new RegExp(`\\.${xClass}\\{([^}]+)\\}`));
                const yMatch = css.match(new RegExp(`\\.${yClass}\\{([^}]+)\\}`));
                console.log(`  X CSS:`, xMatch ? xMatch[1] : 'not found');
                console.log(`  Y CSS:`, yMatch ? yMatch[1] : 'not found');
            }
        }
    }
}
