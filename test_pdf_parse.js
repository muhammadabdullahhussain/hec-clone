const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('/Users/muhammadabdullah/Downloads/DAS_revamped_AppForm_32496996 (2).pdf');

pdf(dataBuffer).then(function(data) {
    console.log(data.text);
}).catch(err => console.error(err));
