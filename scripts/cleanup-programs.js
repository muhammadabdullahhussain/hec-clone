const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupPrograms() {
    // Pehle current options dekho
    const all = await prisma.dropdownOption.findMany({ where: { category: 'program' } });
    console.log('Current programs in DB:', all.map(o => o.value));

    // Sirf ye 3 rakhne hain
    const keep = ['SSC / Matric', 'HSSC / Intermediate', 'Diploma'];

    // Delete karo jo in 3 mein nahi hain
    const deleted = await prisma.dropdownOption.deleteMany({
        where: { category: 'program', value: { notIn: keep } }
    });
    console.log('Deleted extra options:', deleted.count);

    // Ensure ye 3 exist karte hain (agar nahi toh add karo)
    for (const val of keep) {
        await prisma.dropdownOption.upsert({
            where: { category_value: { category: 'program', value: val } },
            update: {},
            create: { category: 'program', value: val }
        });
    }

    const final = await prisma.dropdownOption.findMany({ where: { category: 'program' } });
    console.log('Final programs in DB:', final.map(o => o.value));
    console.log('✅ DB cleanup done!');
    await prisma.$disconnect();
}

cleanupPrograms().catch(console.error);
