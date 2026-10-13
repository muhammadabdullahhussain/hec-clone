const { PrismaClient } = require('@prisma/client');
const path = require('path');

const dbPath = path.join(__dirname, '../prisma/dev.db');
const prisma = new PrismaClient({
    datasources: { db: { url: `file:${dbPath}` } },
});

const BOARDS = [
    "Federal Board (FBISE)", "BISE Lahore", "BISE Rawalpindi", "BISE Multan", "BISE Faisalabad",
    "BISE Gujranwala", "BISE Sargodha", "BISE Sahiwal", "BISE DG Khan", "BISE Bahawalpur",
    "BSEK Karachi (Matric)", "BIEK Karachi (Inter)", "BISE Hyderabad", "BISE Sukkur",
    "BISE Larkana", "BISE Mirpurkhas", "BISE Shaheed Benazirabad", "Aga Khan University Board",
    "BISE Peshawar", "BISE Swat", "BISE Kohat", "BISE Mardan", "BISE Bannu",
    "BISE DI Khan", "BISE Abbottabad", "BISE Malakand",
    "BISE Quetta", "BISE Turbat", "BISE Zhob", "BISE Loralai", "BISE Mirpur (AJK)",
    "Punjab Technical Board Lahore", "Sindh Board of Technical Education",
    "KPK Board of Technical Education", "Balochistan Board of Technical Education",
    "PBTE (Punjab Tech)", "KPBTE (KP Tech)", "SBTE (Sindh Tech)", "BTE (Balochistan Tech)",
];

const GROUPS = [
    "Science", "Arts / Humanities", "Computer Science", "General Science",
    "Pre-Medical", "Pre-Engineering", "ICS (Computer Science)", "I.Com (Commerce)",
    "Humanities (Arts)", "Home Economics", "Medical Technology",
    "Civil Technology", "Electrical Technology", "Mechanical Technology",
    "Electronics Technology", "Chemical Technology", "Computer Information Technology (CIT)",
    "Telecommunication Technology", "Mechatronics Technology", "Instrumentation Technology",
    "Automation Technology", "Architecture Technology", "Auto & Diesel Technology",
    "Refrigeration & Air Conditioning (RAC) Technology", "Textile Spinning Technology",
    "Textile Weaving Technology", "Textile Dyeing & Printing Technology",
    "Food Processing & Preservation Technology", "Glass Ceramics & Pottery Development Technology",
    "Petroleum Technology", "Petro-Chemical Technology", "Mining Technology",
    "Land & Mine Surveying Technology", "Metallurgy & Materials Technology",
    "Footwear Technology", "Printing & Graphic Arts Technology", "Biomedical Technology",
    "Agriculture Technology", "Dies & Mould Technology", "Mechanical Manufacturing Technology",
    "Information Technology", "Environmental Technology",
    "Accounting", "Finance", "Banking", "Secretarial Practice", "Commerce",
    "Business Administration", "Vocational", "Other",
];

const PROGRAMS = [
    "SSC / Matric", "HSSC / Intermediate",
    "Diploma / Diploma of Associate Engineer", "Diploma / Diploma in Commerce",
    "Diploma / Diploma in Business Administration", "Diploma / Vocational", "Diploma / Other",
];

const SESSIONS = [
    "Annual", "Supplementary", "1st Annual", "2nd Annual", "Spring", "Fall",
];

async function seed() {
    console.log('🌱 Seeding dropdown options...');
    let total = 0;

    const insert = async (category, values) => {
        for (const value of values) {
            try {
                await prisma.dropdownOption.upsert({
                    where: { category_value: { category, value } },
                    update: {},
                    create: { category, value },
                });
                total++;
            } catch (e) {
                console.log(`  Skipped: ${value} (already exists)`);
            }
        }
    };

    await insert('board', BOARDS);
    await insert('group', GROUPS);
    await insert('program', PROGRAMS);
    await insert('session', SESSIONS);

    console.log(`✅ Done! ${total} options seeded.`);
    await prisma.$disconnect();
}

seed().catch((e) => { console.error(e); process.exit(1); });
