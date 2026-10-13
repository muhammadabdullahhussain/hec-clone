const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

async function seedData() {
    // Delete all current to start fresh for these 3 test cases
    // Actually, just create 3 new ones to not ruin their existing data.
    const baseUrl = "http://localhost:3000/verify?code=";

    const createStudent = async (name, program, prefix, isDiploma) => {
        const secureHash = crypto.randomBytes(24).toString('hex');
        const tempAppId = crypto.randomUUID();
        const newStudent = await prisma.student.create({
            data: {
                name: name,
                father_name: "Test Father",
                roll_no: "12345",
                program: program,
                group: "Science",
                board: "Federal Board",
                passing_year: "2024",
                session: "Annual",
                obtained_marks: 800,
                total_marks: 1000,
                percentage: "80.00",
                application_id: tempAppId,
                secure_hash: secureHash
            }
        });
        const finalAppId = `${prefix}${String(newStudent.id).padStart(9, '0')}`;
        await prisma.student.update({
            where: { id: newStudent.id },
            data: { application_id: finalAppId }
        });
        return `${baseUrl}${secureHash}`;
    };

    const matricUrl = await createStudent("Zain (Matric)", "SSC / Matric", "MC", false);
    const interUrl = await createStudent("Umar (Inter)", "HSSC / Intermediate", "CC", false);
    const diplomaUrl = await createStudent("Usman (Diploma)", "Diploma", "CE", true);

    console.log("MATRIC:", matricUrl);
    console.log("INTER:", interUrl);
    console.log("DIPLOMA:", diplomaUrl);
}

seedData().catch(console.error).finally(() => process.exit(0));
