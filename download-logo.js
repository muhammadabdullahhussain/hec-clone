const fs = require('fs');
const https = require('https');

https.get('https://upload.wikimedia.org/wikipedia/en/e/e4/Higher_Education_Commission_%28Pakistan%29_logo.svg', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
}, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => fs.writeFileSync('hec-logo.svg', data));
});
