const fs = require('fs');
let html = fs.readFileSync('/Users/muhammadabdullah/Desktop/ibcc-qr-system/src/components/search.html', 'utf8');

// Replace the input with name="q" and add the form tag
html = html.replace(
    '<div class="flex gap-2"><input type="text" placeholder="e.g. A385, M7584, O4663" class="flex-1 border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-700 placeholder:text-slate-400"> <button type="button" class="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors whitespace-nowrap">',
    '<form action="/search" method="GET" class="flex gap-2"><input type="text" name="q" placeholder="e.g. A385, M7584, O4663" class="flex-1 border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-700 placeholder:text-slate-400"> <button type="submit" class="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors whitespace-nowrap">'
);
html = html.replace('Verify</button> </div>', 'Verify</button> </form>{{ERROR_MSG}}');

// Fix image path if it's relative
html = html.replace('src="assets/', 'src="/assets/attest.ibcc.edu.pk/');
html = html.replace('href="assets/', 'href="/assets/attest.ibcc.edu.pk/');
html = html.replace('href="https://attest.ibcc.edu.pk/assets/', 'href="/assets/attest.ibcc.edu.pk/');

// Write to a ts file so we can import it
fs.writeFileSync('/Users/muhammadabdullah/Desktop/ibcc-qr-system/src/lib/searchHtml.ts', 
`export function buildSearchHtml(errorMsg: string = ""): string {
    let html = \`${html.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
    
    if (errorMsg) {
        html = html.replace('{{ERROR_MSG}}', \`<div style="margin-top: 12px; padding: 10px; background: #fff3f3; color: #d32f2f; border-radius: 6px; text-align: center; border: 1px solid #ffcdd2;">\${errorMsg}</div>\`);
    } else {
        html = html.replace('{{ERROR_MSG}}', '');
    }
    
    return html;
}
`);
console.log("Done");
