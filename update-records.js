const fs = require('fs');
const file = 'src/app/admin-portal/records/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add Constants at the top (after imports)
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
const STANDARD_GROUPS = [
    "Science", "Arts / Humanities", "Pre-Medical", "Pre-Engineering", "ICS (Computer Science)", "I.Com (Commerce)", "General Science", "Home Economics", "Medical Technology", "Other"
];
const TECHNICAL_GROUPS = [
    "Mechanical Technology", "Electrical Technology", "Civil Technology", "Computer Information Technology", "Auto & Diesel Technology",
    "Architecture Technology", "Chemical Technology", "Electronics Technology", "Telecommunication Technology", "Diploma in Commerce", "Other"
];
const PROGRAMS = [
    "SSC / Matric", "HSSC / Intermediate", "Diploma / Diploma of Associate Engineer", "Diploma / Diploma in Commerce", "Diploma / Diploma in Business Administration", "Diploma / Vocational", "Diploma"
];
`;

content = content.replace("export default function RecordsPage() {", constants + "\nexport default function RecordsPage() {");

// 2. Add state inside the component
const stateRepl = `
    const [editStudent, setEditStudent] = useState<any | null>(null);
    const [editProgram, setEditProgram] = useState("");
    const [editBoard, setEditBoard] = useState("");
    const [editGroup, setEditGroup] = useState("");
    
    const openEditModal = (student: any) => {
        setEditStudent(student);
        setEditProgram(student.program || "SSC / Matric");
        setEditBoard(student.board || "Federal Board (FBISE)");
        setEditGroup(student.group || "Science");
    };

    const handleProgramChange = (e: any) => {
        const newProg = e.target.value;
        setEditProgram(newProg);
        if (newProg.includes("Diploma")) {
            if (!TECHNICAL_BOARDS.includes(editBoard)) setEditBoard("Punjab Technical Board Lahore");
            if (!TECHNICAL_GROUPS.includes(editGroup)) setEditGroup("Mechanical Technology");
        } else {
            if (!STANDARD_BOARDS.includes(editBoard)) setEditBoard("Federal Board (FBISE)");
            if (!STANDARD_GROUPS.includes(editGroup)) setEditGroup("Science");
        }
    };
`;
content = content.replace("const [editStudent, setEditStudent] = useState<any | null>(null);", stateRepl);

// 3. Update handleEditSave to use the controlled state instead of e.target
const editSaveMatch = `const formData = {
            serial_number: e.target.serial_number.value,
            name: e.target.name.value,
            father_name: e.target.father_name.value,
            roll_no: e.target.roll_no.value,
            program: e.target.program.value,
            group: e.target.group.value,
            board: e.target.board.value,`;

const editSaveRepl = `const formData = {
            serial_number: e.target.serial_number.value,
            name: e.target.name.value,
            father_name: e.target.father_name.value,
            roll_no: e.target.roll_no.value,
            program: editProgram,
            group: editGroup,
            board: editBoard,`;
content = content.replace(editSaveMatch, editSaveRepl);

// 4. Update the "Edit" button to use openEditModal
content = content.replace(/onClick=\{\(\) => setEditStudent\(student\)\}/g, "onClick={() => openEditModal(student)}");

// 5. Replace the <select> fields in the modal
const selectMatch = /<select name="program" defaultValue=\{editStudent\.program\}.*?<\/select>\s*<\/div>\s*<div>\s*<label className="block text-sm font-bold text-gray-800">Serial Number \(Optional\)<\/label>\s*<input type="text" name="serial_number" defaultValue=\{editStudent\.serial_number \|\| ''\} className="mt-1 w-full p-2 border rounded text-black font-medium" \/>\s*<\/div>\s*<div><label className="block text-sm font-bold text-gray-800">Group<\/label>\s*<select name="group" defaultValue=\{editStudent\.group\}.*?<\/select>\s*<\/div>\s*<div><label className="block text-sm font-bold text-gray-800">Board<\/label>\s*<select name="board" defaultValue=\{editStudent\.board\}.*?<\/select>/s;

const selectRepl = `
<select name="program" value={editProgram} onChange={handleProgramChange} className="mt-1 w-full p-2 border rounded text-black font-medium">
    {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
</select>
</div>
<div>
    <label className="block text-sm font-bold text-gray-800">Serial Number (Optional)</label>
    <input type="text" name="serial_number" defaultValue={editStudent.serial_number || ''} className="mt-1 w-full p-2 border rounded text-black font-medium" />
</div>
<div><label className="block text-sm font-bold text-gray-800">Group</label>
<select name="group" value={editGroup} onChange={(e) => setEditGroup(e.target.value)} className="mt-1 w-full p-2 border rounded text-black font-medium">
    {(editProgram.includes("Diploma") ? TECHNICAL_GROUPS : STANDARD_GROUPS).map(g => <option key={g} value={g}>{g}</option>)}
</select>
</div>
<div><label className="block text-sm font-bold text-gray-800">Board</label>
<select name="board" value={editBoard} onChange={(e) => setEditBoard(e.target.value)} className="mt-1 w-full p-2 border rounded text-black font-medium">
    {(editProgram.includes("Diploma") ? TECHNICAL_BOARDS : STANDARD_BOARDS).map(b => <option key={b} value={b}>{b}</option>)}
</select>
`;

content = content.replace(selectMatch, selectRepl);

fs.writeFileSync(file, content);
console.log('Updated records page.');
