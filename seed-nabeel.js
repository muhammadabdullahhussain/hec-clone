const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const code = "18bf16225aa023d22344820cbf4e9663c52f9130009b6192";
    await prisma.student.update({
        where: { secure_hash: code },
        data: {
            name: "Muhammad nabeel bin Rafaqat",
            father_name: "Rafaqat ali",
            roll_no: "103560",
            program: "HSSC / Intermediate",
            board: "BISE Abbottabad",
            group: "Pre-Medical",
            passing_year: "2024",
            session: "2nd_Annual",
            obtained_marks: 758,
            total_marks: 1200,
            percentage: "63.17",
            application_id: "C10680221"
        }
    });
    console.log("Database updated for Muhammad nabeel bin Rafaqat!");
}
main().catch(console.error).finally(() => prisma.$disconnect());
