const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding data...");

  // INTERMEDIATE RECORD
  const interData = {
    name: "Muhammad nabeel bin Rafaqat",
    father_name: "Rafaqat ali",
    roll_no: "103560",
    program: "HSSC / Intermediate",
    group: "Pre-Medical",
    board: "BISE Abbottabad",
    passing_year: "2024",
    session: "2nd_Annual",
    obtained_marks: 758,
    total_marks: 1200,
    percentage: "63.17",
    application_id: "C10680221-Inter", // appended to avoid unique constraint if needed
    serial_number: "SN-INT-001",
    secure_hash: crypto.randomBytes(32).toString('hex')
  };

  // MATRIC RECORD
  const matricData = {
    name: "Muhammad nabeel bin Rafaqat",
    father_name: "Rafaqat ali",
    roll_no: "235164",
    program: "SSC / Matric",
    group: "Science",
    board: "BISE Abbottabad",
    passing_year: "2022",
    session: "Annual",
    obtained_marks: 704,
    total_marks: 1100,
    percentage: "64.00",
    application_id: "C10680221-Matric",
    serial_number: "SN-MAT-001",
    secure_hash: crypto.randomBytes(32).toString('hex')
  };

  await prisma.student.create({ data: interData });
  console.log("Created Inter Record");

  await prisma.student.create({ data: matricData });
  console.log("Created Matric Record");

  // DIPLOMA RECORD (from earlier, for completeness)
  const diplomaData = {
    name: "Muhammad Waqar",
    father_name: "Mukhtar Ahmed",
    roll_no: "666317",
    program: "Diploma / Diploma of Associate Engineer",
    group: "Mechanical Technology",
    board: "Punjab Technical Board Lahore",
    passing_year: "2011",
    session: "Annual",
    obtained_marks: 2612,
    total_marks: 3450,
    percentage: "75",
    application_id: "C10894072-Diploma",
    serial_number: "SN-DIP-001",
    secure_hash: crypto.randomBytes(32).toString('hex')
  };

  await prisma.student.create({ data: diplomaData });
  console.log("Created Diploma Record");

  console.log("Seed successful.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
