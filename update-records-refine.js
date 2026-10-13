const fs = require('fs');
const file = 'src/app/admin-portal/records/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the constants block
const constants = `
const STANDARD_BOARDS = [
    "Federal Board (FBISE)", "BISE Lahore", "BISE Rawalpindi", "BISE Multan", "BISE Faisalabad", "BISE Gujranwala", "BISE Sargodha", "BISE Sahiwal", "BISE DG Khan", "BISE Bahawalpur",
    "BSEK Karachi (Matric)", "BIEK Karachi (Inter)", "BISE Hyderabad", "BISE Sukkur", "BISE Larkana", "BISE Mirpurkhas", "BISE Shaheed Benazirabad", "Aga Khan University Board",
    "BISE Peshawar", "BISE Swat", "BISE Kohat", "BISE Mardan", "BISE Bannu", "BISE DI Khan", "BISE Abbottabad", "BISE Malakand",
    "BISE Quetta", "BISE Turbat", "BISE Zhob", "BISE Loralai", "BISE Mirpur (AJK)"
];
const TECHNICAL_BOARDS = [
    "Punjab Technical Board Lahore", "Sindh Board of Technical Education", "KPK Board of Technical Education", "Balochistan Board of Technical Education",
    "PBTE (Punjab Tech)", "KPBTE (KP Tech)", "SBTE (Sindh Tech)", "BTE (Balochistan Tech)"
];
const MATRIC_GROUPS = ["Science", "Arts / Humanities", "Computer Science", "General Science", "Other"];
const INTER_GROUPS = ["Pre-Medical", "Pre-Engineering", "ICS (Computer Science)", "I.Com (Commerce)", "Humanities (Arts)", "General Science", "Home Economics", "Medical Technology", "Other"];
const DAE_GROUPS = ["Mechanical Technology", "Electrical Technology", "Civil Technology", "Computer Information Technology", "Auto & Diesel Technology", "Architecture Technology", "Chemical Technology", "Electronics Technology", "Telecommunication Technology", "Other"];
const DCOM_GROUPS = ["Accounting", "Finance", "Banking", "Secretarial Practice", "Commerce", "Other"];
const DBA_GROUPS = ["Business Administration", "Other"];
const VOC_GROUPS = ["Vocational", "Other"];
const PROGRAMS = ["SSC / Matric", "HSSC / Intermediate", "Diploma"];
const DIPLOMA_TYPES = ["Diploma of Associate Engineer", "Diploma in Commerce", "Diploma in Business Administration", "Vocational", "Other"];
`;

// Replace all constants up to the component definition
content = content.replace(/const STANDARD_BOARDS[\s\S]*?const PROGRAMS = \[[\s\S]*?\];/m, constants);

// Update State & Handlers
const stateMatch = /const \[editProgram, setEditProgram\] = useState\(""\);[\s\S]*?const handleProgramChange = \(e: any\) => \{[\s\S]*?\};\n/m;
const newState = `
    const [editProgram, setEditProgram] = useState("");
    const [editSubProgram, setEditSubProgram] = useState("Diploma of Associate Engineer");
    const [editBoard, setEditBoard] = useState("");
    const [editGroup, setEditGroup] = useState("");
    
    const openEditModal = (student: any) => {
        setEditStudent(student);
        const prog = student.program || "SSC / Matric";
        if (prog.startsWith("Diploma")) {
            setEditProgram("Diploma");
            setEditSubProgram(prog.includes(" / ") ? prog.split(" / ")[1] : "Diploma of Associate Engineer");
        } else {
            setEditProgram(prog);
            setEditSubProgram("Diploma of Associate Engineer");
        }
        setEditBoard(student.board || "Federal Board (FBISE)");
        setEditGroup(student.group || "Science");
    };

    const handleProgramChange = (e: any) => {
        const val = e.target.value;
        setEditProgram(val);
        if (val === "Diploma") {
            if (!TECHNICAL_BOARDS.includes(editBoard)) setEditBoard("Punjab Technical Board Lahore");
            setEditGroup("Mechanical Technology");
        } else if (val === "HSSC / Intermediate") {
            if (!STANDARD_BOARDS.includes(editBoard)) setEditBoard("Federal Board (FBISE)");
            setEditGroup("Pre-Medical");
        } else {
            if (!STANDARD_BOARDS.includes(editBoard)) setEditBoard("Federal Board (FBISE)");
            setEditGroup("Science");
        }
    };

    const handleSubProgramChange = (e: any) => {
        const val = e.target.value;
        setEditSubProgram(val);
        if (val === "Diploma of Associate Engineer") setEditGroup("Mechanical Technology");
        else if (val === "Diploma in Commerce") setEditGroup("Accounting");
        else if (val === "Diploma in Business Administration") setEditGroup("Business Administration");
        else if (val === "Vocational") setEditGroup("Vocational");
        else setEditGroup("Other");
    };
`;
content = content.replace(stateMatch, newState);

// Update form data inside handleEditSave
const formDataMatch = /program: editProgram,\s*group: editGroup,/;
const formDataRepl = `program: editProgram === "Diploma" ? \`Diploma / \${editSubProgram}\` : editProgram,\n            group: editGroup,`;
content = content.replace(formDataMatch, formDataRepl);


// Build UI replacement logic
const isDiplomaLogic = `
    const isDiplomaEdit = editProgram === "Diploma";
    let currentEditGroups = MATRIC_GROUPS;
    if (editProgram === "HSSC / Intermediate") currentEditGroups = INTER_GROUPS;
    else if (isDiplomaEdit) {
        if (editSubProgram === "Diploma of Associate Engineer") currentEditGroups = DAE_GROUPS;
        else if (editSubProgram === "Diploma in Commerce") currentEditGroups = DCOM_GROUPS;
        else if (editSubProgram === "Diploma in Business Administration") currentEditGroups = DBA_GROUPS;
        else if (editSubProgram === "Vocational") currentEditGroups = VOC_GROUPS;
        else currentEditGroups = ["Other"];
    }
`;

// Insert the logic just before the return block of handleEditSave ... wait, no. Inside the component body.
content = content.replace('const handleEditSave = async (e: any) => {', isDiplomaLogic + '\n    const handleEditSave = async (e: any) => {');

// Update UI JSX elements inside Edit modal form.
// First program select:
const uiMatch = /<select name="program" value=\{editProgram\}[\s\S]*?<\/select>/;
const uiRepl = `<select name="program" value={editProgram} onChange={handleProgramChange} className="mt-1 w-full p-2 border rounded text-black font-medium">
                                    {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            
                            {isDiplomaEdit && (
                                <div className="border-l-4 border-green-500 pl-3">
                                    <label className="block text-sm font-bold text-green-800">Diploma Type</label>
                                    <select 
                                        value={editSubProgram}
                                        onChange={handleSubProgramChange}
                                        className="mt-1 w-full p-2 border border-green-300 bg-green-50 rounded text-black font-medium"
                                    >
                                        {DIPLOMA_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            )}`;
content = content.replace(uiMatch, uiRepl);

// Update groups select
const grpMatch = /<select name="group" value=\{editGroup\}[\s\S]*?<\/select>/;
const grpRepl = `<select name="group" value={editGroup} onChange={(e) => setEditGroup(e.target.value)} className="mt-1 w-full p-2 border rounded text-black font-medium">
                                    {currentEditGroups.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>`;
content = content.replace(grpMatch, grpRepl);

// Update boards select
const brdMatch = /<select name="board" value=\{editBoard\}[\s\S]*?<\/select>/;
const brdRepl = `<select name="board" value={editBoard} onChange={(e) => setEditBoard(e.target.value)} className="mt-1 w-full p-2 border rounded text-black font-medium">
                                    {(isDiplomaEdit ? TECHNICAL_BOARDS : STANDARD_BOARDS).map(b => <option key={b} value={b}>{b}</option>)}
                                </select>`;
content = content.replace(brdMatch, brdRepl);


fs.writeFileSync(file, content);
console.log("Updated records page.");
