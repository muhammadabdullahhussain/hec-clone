const fs = require('fs');

const file = 'src/app/verify/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// The faulty parsing block:
const faultyParsing = `    const studentId = parseInt(code.substring(0, 6), 16);
    if (isNaN(studentId)) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md border-t-4 border-red-500">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Verification Failed</h2>
                    <p className="text-gray-700 font-medium">QR code format is invalid.</p>
                </div>
            </div>
        );
    }

    const student = await prisma.student.findUnique({
        where: { id: studentId }
    });`;

// The correct lookup:
const correctLookup = `    const student = await prisma.student.findUnique({
        where: { secure_hash: code }
    });`;

content = content.replace(faultyParsing, correctLookup);

fs.writeFileSync(file, content);
console.log("Fixed verify page to look up by secure_hash.");
