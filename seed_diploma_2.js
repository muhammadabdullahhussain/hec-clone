const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding diploma data...");

  const diplomaData = {
    name: "Muhammad Najaf Abbas",
    father_name: "Ulfat Ali",
    roll_no: "176260",
    program: "Diploma / Diploma of Associate Engineering",
    group: "Technical",
    board: "Punjab Board of Technical Education",
    passing_year: "2024",
    session: "Annual",
    obtained_marks: 2612,
    total_marks: 3450,
    percentage: "75.71",
    application_id: "E10784106",
    serial_number: "SN-DIP-002",
    secure_hash: crypto.randomBytes(32).toString('hex')
  };

  await prisma.student.create({ data: diplomaData });
  console.log("Created Diploma Record for Muhammad Najaf Abbas");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
