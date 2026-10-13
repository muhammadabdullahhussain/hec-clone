const fs = require('fs');
const file = 'src/app/admin-portal/add-student/page.tsx';

const script = `
import { useState, useEffect } from 'react';

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

const INTER_GROUPS = [
    "Pre-Medical", "Pre-Engineering", "ICS (Computer Science)", "I.Com (Commerce)", 
    "Humanities (Arts)", "General Science", "Home Economics", "Medical Technology", "Other"
];

const DAE_GROUPS = [
    "Mechanical Technology", "Electrical Technology", "Civil Technology", "Computer Information Technology", 
    "Auto & Diesel Technology", "Architecture Technology", "Chemical Technology", "Electronics Technology", 
    "Telecommunication Technology", "Other"
];

const DCOM_GROUPS = ["Accounting", "Finance", "Banking", "Secretarial Practice", "Commerce", "Other"];
const DBA_GROUPS = ["Business Administration", "Other"];
const VOC_GROUPS = ["Vocational", "Other"];

const PROGRAMS = ["SSC / Matric", "HSSC / Intermediate", "Diploma"];

const DIPLOMA_TYPES = [
    "Diploma of Associate Engineer", 
    "Diploma in Commerce", 
    "Diploma in Business Administration", 
    "Vocational", 
    "Other"
];

export default function AddStudent() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [program, setProgram] = useState("SSC / Matric");
    const [subProgram, setSubProgram] = useState("Diploma of Associate Engineer");
    const [board, setBoard] = useState("Federal Board (FBISE)");
    const [group, setGroup] = useState("Science");

    // Dynamic Lists
    const isDiploma = program === "Diploma";
    const currentBoards = isDiploma ? TECHNICAL_BOARDS : STANDARD_BOARDS;
    
    let currentGroups = MATRIC_GROUPS;
    if (program === "HSSC / Intermediate") currentGroups = INTER_GROUPS;
    else if (isDiploma) {
        if (subProgram === "Diploma of Associate Engineer") currentGroups = DAE_GROUPS;
        else if (subProgram === "Diploma in Commerce") currentGroups = DCOM_GROUPS;
        else if (subProgram === "Diploma in Business Administration") currentGroups = DBA_GROUPS;
        else if (subProgram === "Vocational") currentGroups = VOC_GROUPS;
        else currentGroups = ["Other"];
    }

    // Handle Program Change
    const handleProgramChange = (e: any) => {
        const val = e.target.value;
        setProgram(val);
        if (val === "Diploma") {
            if (!TECHNICAL_BOARDS.includes(board)) setBoard("Punjab Technical Board Lahore");
            setGroup("Mechanical Technology");
        } else if (val === "HSSC / Intermediate") {
            if (!STANDARD_BOARDS.includes(board)) setBoard("Federal Board (FBISE)");
            setGroup("Pre-Medical");
        } else {
            // SSC / Matric
            if (!STANDARD_BOARDS.includes(board)) setBoard("Federal Board (FBISE)");
            setGroup("Science");
        }
    };

    // Handle SubProgram Change
    const handleSubProgramChange = (e: any) => {
        const val = e.target.value;
        setSubProgram(val);
        if (val === "Diploma of Associate Engineer") setGroup("Mechanical Technology");
        else if (val === "Diploma in Commerce") setGroup("Accounting");
        else if (val === "Diploma in Business Administration") setGroup("Business Administration");
        else if (val === "Vocational") setGroup("Vocational");
        else setGroup("Other");
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        const finalProgram = program === "Diploma" ? \`Diploma / \${subProgram}\` : program;

        const formData = {
            application_id: e.target.application_id.value,
            serial_number: e.target.serial_number.value,
            name: e.target.name.value,
            father_name: e.target.father_name.value,
            roll_no: e.target.roll_no.value,
            program: finalProgram,
            group: group,
            board: board,
            passing_year: e.target.passing_year.value,
            session: e.target.session.value,
            obtained_marks: e.target.obtained_marks.value,
            total_marks: e.target.total_marks.value,
        };

        try {
            const res = await fetch('/api/students', {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            
            if (!res.ok) {
                setError(data.error || 'Failed to save');
            } else {
                setMessage(\`Success! Student Added. ID: \${data.student.application_id} | Percentage: \${data.student.percentage}%\`);
                e.target.reset(); // clear form text inputs
                setProgram("SSC / Matric");
                setSubProgram("Diploma of Associate Engineer");
                setBoard("Federal Board (FBISE)");
                setGroup("Science");
            }
        } catch (err) {
            setError('System error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Add New Student Record</h1>
            <div className="bg-white p-4 md:p-8 rounded-lg shadow-sm">
                
                {message && <div className="mb-4 p-4 bg-green-100 text-green-700 font-bold rounded border border-green-400">{message}</div>}
                {error && <div className="mb-4 p-4 bg-red-100 text-red-700 font-bold rounded border border-red-400">{error}</div>}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-800">Serial Number / App ID (Optional)</label>
                        <input type="text" name="application_id" placeholder="Leave empty to auto-generate (e.g. CC010956771)" className="mt-1 w-full p-2 border border-gray-300 rounded text-black font-medium focus:ring-green-500 focus:border-green-500" />
                        <p className="text-xs text-gray-500 mt-1">If you enter a custom serial number here, it will be used exactly as is.</p>
                    </div>

                    <div><label className="block text-sm font-bold text-gray-800">Sticker Serial Number</label><input type="text" name="serial_number" placeholder="e.g. CM00216811" className="mt-1 w-full p-2 border border-gray-300 rounded text-black font-medium focus:ring-green-500 focus:border-green-500" /></div>

                    <div><label className="block text-sm font-bold text-gray-800">Student Name</label><input type="text" name="name" className="mt-1 w-full p-2 border border-gray-300 rounded text-black font-medium focus:ring-green-500 focus:border-green-500" required /></div>
                    <div><label className="block text-sm font-bold text-gray-800">Father's Name</label><input type="text" name="father_name" className="mt-1 w-full p-2 border border-gray-300 rounded text-black font-medium focus:ring-green-500 focus:border-green-500" required /></div>
                    <div><label className="block text-sm font-bold text-gray-800">Roll Number (Alphanumeric)</label><input type="text" name="roll_no" className="mt-1 w-full p-2 border border-gray-300 rounded text-black font-medium focus:ring-green-500 focus:border-green-500" required /></div>
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-800">Certificate / Program</label>
                        <select 
                            name="program" 
                            value={program}
                            onChange={handleProgramChange}
                            className="mt-1 w-full p-2 border border-gray-300 rounded text-black font-medium focus:ring-green-500 focus:border-green-500"
                        >
                            {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>

                    {isDiploma && (
                        <div className="col-span-1 md:col-span-1 border-l-4 border-green-500 pl-3">
                            <label className="block text-sm font-bold text-green-800">Diploma Type</label>
                            <select 
                                value={subProgram}
                                onChange={handleSubProgramChange}
                                className="mt-1 w-full p-2 border border-green-300 bg-green-50 rounded text-black font-medium focus:ring-green-500 focus:border-green-500"
                            >
                                {DIPLOMA_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    )}
                    
                    <div className={isDiploma ? "" : ""}>
                        <label className="block text-sm font-bold text-gray-800">Group / Discipline</label>
                        <select 
                            name="group" 
                            value={group}
                            onChange={(e) => setGroup(e.target.value)}
                            className="mt-1 w-full p-2 border border-gray-300 rounded text-black font-medium focus:ring-green-500 focus:border-green-500"
                        >
                            {currentGroups.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-800">Board / University</label>
                        <select 
                            name="board" 
                            value={board}
                            onChange={(e) => setBoard(e.target.value)}
                            className="mt-1 w-full p-2 border border-gray-300 rounded text-black font-medium focus:ring-green-500 focus:border-green-500"
                        >
                            {currentBoards.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                    
                    <div><label className="block text-sm font-bold text-gray-800">Passing Year</label>
                        <select name="passing_year" className="mt-1 w-full p-2 border border-gray-300 rounded text-black font-medium focus:ring-green-500 focus:border-green-500">
                            {Array.from({ length: 40 }, (_, i) => 2026 - i).map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div><label className="block text-sm font-bold text-gray-800">Session</label>
                        <select name="session" className="mt-1 w-full p-2 border border-gray-300 rounded text-black font-medium focus:ring-green-500 focus:border-green-500">
                            <option value="Annual">Annual</option>
                            <option value="Supplementary">Supplementary</option>
                            <option value="1st Annual">1st Annual</option>
                            <option value="2nd Annual">2nd Annual</option>
                            <option value="Spring">Spring</option>
                            <option value="Fall">Fall</option>
                        </select>
                    </div>
                    
                    <div><label className="block text-sm font-bold text-gray-800">Obtained Marks</label><input type="number" name="obtained_marks" className="mt-1 w-full p-2 border border-gray-300 rounded text-black font-medium focus:ring-green-500 focus:border-green-500" required /></div>
                    <div><label className="block text-sm font-bold text-gray-800">Total Marks</label><input type="number" name="total_marks" className="mt-1 w-full p-2 border border-gray-300 rounded text-black font-medium focus:ring-green-500 focus:border-green-500" required /></div>

                    <div className="md:col-span-2 pt-4 border-t">
                        <button type="submit" disabled={loading} className={\`w-full py-3 rounded-lg text-white font-bold text-lg transition \${loading ? 'bg-gray-400' : 'bg-green-700 hover:bg-green-800'}\`}>
                            {loading ? 'Saving Record...' : 'Save Student Record'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
`;

fs.writeFileSync(file, script);
console.log("Updated add-student");
