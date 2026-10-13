const fs = require('fs');

const DAE_GROUPS = [
    "Civil Technology",
    "Electrical Technology",
    "Mechanical Technology",
    "Electronics Technology",
    "Chemical Technology",
    "Computer Information Technology (CIT)",
    "Telecommunication Technology",
    "Mechatronics Technology",
    "Instrumentation Technology",
    "Automation Technology",
    "Architecture Technology",
    "Auto & Diesel Technology",
    "Refrigeration & Air Conditioning (RAC) Technology",
    "Textile Spinning Technology",
    "Textile Weaving Technology",
    "Textile Dyeing & Printing Technology",
    "Food Processing & Preservation Technology",
    "Glass Ceramics & Pottery Development Technology",
    "Petroleum Technology",
    "Petro-Chemical Technology",
    "Mining Technology",
    "Land & Mine Surveying Technology",
    "Metallurgy & Materials Technology",
    "Footwear Technology",
    "Printing & Graphic Arts Technology",
    "Biomedical Technology",
    "Agriculture Technology",
    "Dies & Mould Technology",
    "Mechanical Manufacturing Technology",
    "Information Technology",
    "Environmental Technology",
    "Other"
];

function updateFile(file) {
    let content = fs.readFileSync(file, 'utf8');

    // Replace the old DAE_GROUPS array
    const newArr = "const DAE_GROUPS = " + JSON.stringify(DAE_GROUPS, null, 4) + ";";
    
    // In our files it looks like: const DAE_GROUPS = ["Mechanical Technology", "Electrical Technology", "Civil Technology", "Computer Information Technology", "Auto & Diesel Technology", "Architecture Technology", "Chemical Technology", "Electronics Technology", "Telecommunication Technology", "Other"];
    // Or it might be multi-line. Let's use a regex that captures it until the next const
    content = content.replace(/const DAE_GROUPS = \[[\s\S]*?\];/g, newArr);
    
    fs.writeFileSync(file, content);
}

updateFile('src/app/admin-portal/add-student/page.tsx');
updateFile('src/app/admin-portal/records/page.tsx');
console.log('TEVTA groups added successfully.');
