const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const s = await prisma.student.findFirst();
  if (s) {
    const idHex = s.id.toString(16).padStart(6, '0');
    console.log("Valid URL: http://localhost:3000/verify?code=" + idHex + "00000000000000000000000000000000");
  } else {
    console.log("No students in DB.");
  }
}
main();
