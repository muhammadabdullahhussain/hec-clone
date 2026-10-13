const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

async function getAnotherStudent() {
    const students = await prisma.student.findMany({
        where: { isDeleted: false },
        orderBy: { id: 'asc' }
    });
    
    if (students.length > 1) {
        console.log(students[1].secure_hash);
        console.log(students[1].name);
    } else {
        const secureHash = crypto.randomBytes(24).toString('hex');
        const tempAppId = crypto.randomUUID();
        
        const newStudent = await prisma.student.create({
            data: {
                name: "Ali Hassan",
                father_name: "Tariq Mehmood",
                roll_no: "567890",
                program: "HSSC / Intermediate",
                group: "Pre-Medical",
                board: "Federal Board (FBISE)",
                passing_year: "2023",
                session: "Annual",
                obtained_marks: 950,
                total_marks: 1100,
                percentage: "86.36",
                application_id: tempAppId,
                secure_hash: secureHash
            }
        });
        
        const paddedId = String(newStudent.id).padStart(9, '0');
        const finalAppId = `CC${paddedId}`;
        
        await prisma.student.update({
            where: { id: newStudent.id },
            data: { application_id: finalAppId }
        });
        
        console.log(secureHash);
        console.log("Ali Hassan");
    }
}
getAnotherStudent().catch(console.error).finally(() => process.exit(0));
