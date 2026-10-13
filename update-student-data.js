const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateStudent() {
  const secureHash = '41861018f30b4b47b5a2211ef403700bb0705ddc45de5483';

  try {
    const updatedStudent = await prisma.student.update({
      where: { secure_hash: secureHash },
      data: {
        name: 'Muhammad Waqar',
        father_name: 'Mukhtar Ahmed',
        roll_no: '666317',
        program: 'Diploma / Diploma of Associate Engineer',
        board: 'Punjab Technical Board Lahore',
        group: 'Mechanical Technology',
        passing_year: '2011',
        session: 'Annual',
        obtained_marks: 2612,
        total_marks: 3450,
        percentage: '75',
        application_id: 'C10894072'
      }
    });
    console.log('Successfully updated student data:', updatedStudent.name);
  } catch (error) {
    console.error('Error updating student:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateStudent();
