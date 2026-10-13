const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  const password_hash = await bcrypt.hash('1715', 10)
  
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password_hash: password_hash,
    },
  })
  
  console.log('Proof: Super Admin Created Successfully!')
  console.log('Username:', admin.username)
  console.log('Bcrypt Password Hash:', admin.password_hash)
  console.log('Creation Date:', admin.createdAt)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
