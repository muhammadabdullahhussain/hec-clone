const fs = require('fs');

const DAE_GROUPS = [
    "Mechanical Technology", "Electrical Technology", "Civil Technology",
    "Computer Information Technology", "Auto & Diesel Technology",
    "Architecture Technology", "Chemical Technology", "Electronics Technology",
    "Telecommunication Technology", "Other"
];

const DCOM_GROUPS = ["Accounting", "Finance", "Banking", "Secretarial Practice", "Commerce", "Other"];
const DBA_GROUPS = ["Business Administration", "Other"];
const VOC_GROUPS = ["Vocational", "Other"];

function updateFile(file) {
    let content = fs.readFileSync(file, 'utf8');

    const replStr = "const DAE_GROUPS = " + JSON.stringify(DAE_GROUPS) + ";\n" +
                    "const DCOM_GROUPS = " + JSON.stringify(DCOM_GROUPS) + ";\n" +
                    "const DBA_GROUPS = " + JSON.stringify(DBA_GROUPS) + ";\n" +
                    "const VOC_GROUPS = " + JSON.stringify(VOC_GROUPS) + ";";

    content = content.replace(/const TECHNICAL_GROUPS = \[[\s\S]*?\];/, replStr);

    content = content.replace(/"Diploma"\\s*\\]/, ']');
    content = content.replace(/"Diploma",\\s*\\]/, ']');
    // Wait, the previous array had "Diploma" as the last element: "Diploma / Vocational", "Diploma"
    content = content.replace(/"Diploma"\s*\]/, ']');
    content = content.replace(/,\s*\]/, ']');

    if (file.includes('add-student')) {
        const oldLogic = /const currentGroups = isDiploma \? TECHNICAL_GROUPS : STANDARD_GROUPS;/;
        const newLogic = "let currentGroups = STANDARD_GROUPS;\n" +
            "if (program === 'Diploma / Diploma of Associate Engineer') currentGroups = DAE_GROUPS;\n" +
            "else if (program === 'Diploma / Diploma in Commerce') currentGroups = DCOM_GROUPS;\n" +
            "else if (program === 'Diploma / Diploma in Business Administration') currentGroups = DBA_GROUPS;\n" +
            "else if (program === 'Diploma / Vocational') currentGroups = VOC_GROUPS;\n" +
            "else if (program.includes('Diploma')) currentGroups = DAE_GROUPS;";
        content = content.replace(oldLogic, newLogic);

        const oldEffect = /if \(!TECHNICAL_GROUPS\.includes\(group\)\) setGroup\("Mechanical Technology"\);/;
        const newEffect = "if (program === 'Diploma / Diploma of Associate Engineer' && !DAE_GROUPS.includes(group)) setGroup('Mechanical Technology');\n" +
            "else if (program === 'Diploma / Diploma in Commerce' && !DCOM_GROUPS.includes(group)) setGroup('Accounting');\n" +
            "else if (program === 'Diploma / Diploma in Business Administration' && !DBA_GROUPS.includes(group)) setGroup('Business Administration');\n" +
            "else if (program === 'Diploma / Vocational' && !VOC_GROUPS.includes(group)) setGroup('Vocational');";
        content = content.replace(oldEffect, newEffect);
    }

    if (file.includes('records')) {
        const oldHandle = /if \(!TECHNICAL_GROUPS\.includes\(editGroup\)\) setEditGroup\("Mechanical Technology"\);/;
        const newHandle = "if (newProg === 'Diploma / Diploma of Associate Engineer' && !DAE_GROUPS.includes(editGroup)) setEditGroup('Mechanical Technology');\n" +
            "else if (newProg === 'Diploma / Diploma in Commerce' && !DCOM_GROUPS.includes(editGroup)) setEditGroup('Accounting');\n" +
            "else if (newProg === 'Diploma / Diploma in Business Administration' && !DBA_GROUPS.includes(editGroup)) setEditGroup('Business Administration');\n" +
            "else if (newProg === 'Diploma / Vocational' && !VOC_GROUPS.includes(editGroup)) setEditGroup('Vocational');";
        content = content.replace(oldHandle, newHandle);

        const oldSelect = /\{\(editProgram\.includes\("Diploma"\) \? TECHNICAL_GROUPS : STANDARD_GROUPS\)\.map\(g => <option key=\{g\} value=\{g\}>\{g\}<\/option>\)\}/;
        const newSelect = "{(editProgram === 'Diploma / Diploma of Associate Engineer' ? DAE_GROUPS :\n" +
            "editProgram === 'Diploma / Diploma in Commerce' ? DCOM_GROUPS :\n" +
            "editProgram === 'Diploma / Diploma in Business Administration' ? DBA_GROUPS :\n" +
            "editProgram === 'Diploma / Vocational' ? VOC_GROUPS :\n" +
            "editProgram.includes('Diploma') ? DAE_GROUPS : STANDARD_GROUPS).map(g => <option key={g} value={g}>{g}</option>)}";
        content = content.replace(oldSelect, newSelect);
    }

    fs.writeFileSync(file, content);
}

updateFile('src/app/admin-portal/add-student/page.tsx');
updateFile('src/app/admin-portal/records/page.tsx');
console.log('Smart dropdowns applied!');
