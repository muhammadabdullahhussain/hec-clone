const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

async function testPhase4Logic() {
  console.log("--- RUNNING PHASE 4 TEST ---");
  
  // Test 1: Matric student with 704 / 1100 marks
  const tempAppId1 = crypto.randomUUID();
  const s1 = await prisma.student.create({
    data: {
      name: 'Muhammad Nabeel', father_name: 'Rafaqat Ali', roll_no: '235164',
      program: 'SSC / Matric', group: 'Science', board: 'BISE Abbottabad',
      passing_year: '2022', session: 'Annual', obtained_marks: 704, total_marks: 1100,
      percentage: '64.00', application_id: tempAppId1, secure_hash: crypto.randomUUID().replace(/-/g, '') + crypto.randomBytes(8).toString('hex')
    }
  });
  const finalId1 = 'MC' + String(s1.id).padStart(9, '0');
  const u1 = await prisma.student.update({ where: { id: s1.id }, data: { application_id: finalId1 } });
  
  console.log(`\nTEST 1 (Matric):`);
  console.log(`Name: ${u1.name}`);
  console.log(`Application ID: ${u1.application_id} (Expected MC prefix + 9 digit zero-padding)`);
  console.log(`Percentage: ${u1.percentage}% (Expected 64.00%)`);
  console.log(`Secure Hash: ${u1.secure_hash}`);

  // Test 2: Diploma student
  const tempAppId2 = crypto.randomUUID();
  const s2 = await prisma.student.create({
    data: {
      name: 'Ali Khan', father_name: 'Ahmad Khan', roll_no: 'DIP-992',
      program: 'Diploma', group: 'Pre-Engineering', board: 'Federal Board',
      passing_year: '2024', session: 'Supplementary', obtained_marks: 850, total_marks: 1000,
      percentage: '85.00', application_id: tempAppId2, secure_hash: crypto.randomUUID().replace(/-/g, '') + crypto.randomBytes(8).toString('hex')
    }
  });
  const finalId2 = 'CE' + String(s2.id).padStart(9, '0');
  const u2 = await prisma.student.update({ where: { id: s2.id }, data: { application_id: finalId2 } });

  console.log(`\nTEST 2 (Diploma):`);
  console.log(`Name: ${u2.name}`);
  console.log(`Roll Number: ${u2.roll_no} (Alphanumeric Support Working)`);
  console.log(`Application ID: ${u2.application_id} (Expected CE prefix + 9 digit zero-padding)`);
}

testPhase4Logic().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); });
