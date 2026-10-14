const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

async function runBackup() {
    console.log('📦 Starting HEC Database Disaster Recovery Backup...');
    const prisma = new PrismaClient();

    try {
        const backupDir = path.join(process.cwd(), 'backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(backupDir, `hec_backup_${timestamp}.sql`);

        console.log('Fetching database records...');
        const [admins, records] = await Promise.all([
            prisma.admin.findMany(),
            prisma.hecRecord.findMany()
        ]);

        console.log(`Found ${admins.length} Admins and ${records.length} HEC Records.`);

        const escapeStr = (val) => {
            if (val === null || val === undefined) return 'NULL';
            const s = String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            return `'${s}'`;
        };

        const toDateTime = (val) => {
            if (!val) return 'NOW(3)';
            const d = new Date(val);
            if (isNaN(d.getTime())) return 'NOW(3)';
            return `'${d.toISOString().slice(0, 19).replace('T', ' ')}'`;
        };

        const sqlLines = [
            `-- HEC Verification Portal Automated Database Backup`,
            `-- Generated at: ${now.toUTCString()}`,
            `SET FOREIGN_KEY_CHECKS=0;`,
            '',
            `CREATE TABLE IF NOT EXISTS \`Admin\` (`,
            `  \`id\` INT NOT NULL AUTO_INCREMENT,`,
            `  \`username\` VARCHAR(191) NOT NULL,`,
            `  \`password_hash\` VARCHAR(191) NOT NULL,`,
            `  \`twoFactorSecret\` VARCHAR(191) NULL,`,
            `  \`twoFactorEnabled\` BOOLEAN NOT NULL DEFAULT false,`,
            `  \`backupCodes\` TEXT NULL,`,
            `  \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),`,
            `  PRIMARY KEY (\`id\`),`,
            `  UNIQUE KEY \`Admin_username_key\` (\`username\`)`,
            `) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
            '',
            `CREATE TABLE IF NOT EXISTS \`HecRecord\` (`,
            `  \`id\` INT NOT NULL AUTO_INCREMENT,`,
            `  \`cnic\` VARCHAR(191) NOT NULL,`,
            `  \`reference_number\` VARCHAR(191) NOT NULL,`,
            `  \`application_id\` VARCHAR(191) NOT NULL,`,
            `  \`name\` VARCHAR(191) NOT NULL,`,
            `  \`name_on_degree\` VARCHAR(191) NOT NULL,`,
            `  \`father_name\` VARCHAR(191) NOT NULL DEFAULT '',`,
            `  \`date_of_birth\` VARCHAR(191) NOT NULL DEFAULT '',`,
            `  \`enrollment_no\` VARCHAR(191) NOT NULL DEFAULT '',`,
            `  \`degree_title\` VARCHAR(191) NOT NULL,`,
            `  \`university\` VARCHAR(191) NOT NULL,`,
            `  \`date_of_issuance\` VARCHAR(191) NOT NULL DEFAULT '',`,
            `  \`attested_by\` VARCHAR(191) NOT NULL,`,
            `  \`photo_url\` VARCHAR(191) NULL,`,
            `  \`pdf_url\` VARCHAR(191) NULL,`,
            `  \`isActive\` BOOLEAN NOT NULL DEFAULT true,`,
            `  \`isDeleted\` BOOLEAN NOT NULL DEFAULT false,`,
            `  \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),`,
            `  \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),`,
            `  PRIMARY KEY (\`id\`),`,
            `  INDEX \`HecRecord_application_id_idx\` (\`application_id\`),`,
            `  INDEX \`HecRecord_cnic_idx\` (\`cnic\`),`,
            `  INDEX \`HecRecord_reference_number_idx\` (\`reference_number\`)`,
            `) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
            ''
        ];

        // Export Admins
        for (const a of admins) {
            sqlLines.push(
                `INSERT INTO \`Admin\` (\`id\`, \`username\`, \`password_hash\`, \`twoFactorSecret\`, \`twoFactorEnabled\`, \`backupCodes\`, \`createdAt\`) ` +
                `VALUES (${a.id}, ${escapeStr(a.username)}, ${escapeStr(a.password_hash)}, ${escapeStr(a.twoFactorSecret)}, ${a.twoFactorEnabled ? 1 : 0}, ${escapeStr(a.backupCodes)}, ${toDateTime(a.createdAt)}) ` +
                `ON DUPLICATE KEY UPDATE \`username\`=VALUES(\`username\`);`
            );
        }

        // Export HEC Records
        for (const r of records) {
            sqlLines.push(
                `INSERT INTO \`HecRecord\` (\`id\`, \`cnic\`, \`reference_number\`, \`application_id\`, \`name\`, \`name_on_degree\`, \`father_name\`, \`date_of_birth\`, \`enrollment_no\`, \`degree_title\`, \`university\`, \`date_of_issuance\`, \`attested_by\`, \`photo_url\`, \`pdf_url\`, \`isActive\`, \`isDeleted\`, \`createdAt\`, \`updatedAt\`) ` +
                `VALUES (${r.id}, ${escapeStr(r.cnic)}, ${escapeStr(r.reference_number)}, ${escapeStr(r.application_id)}, ${escapeStr(r.name)}, ${escapeStr(r.name_on_degree)}, ${escapeStr(r.father_name)}, ${escapeStr(r.date_of_birth)}, ${escapeStr(r.enrollment_no)}, ${escapeStr(r.degree_title)}, ${escapeStr(r.university)}, ${escapeStr(r.date_of_issuance)}, ${escapeStr(r.attested_by)}, ${escapeStr(r.photo_url)}, ${escapeStr(r.pdf_url)}, ${r.isActive ? 1 : 0}, ${r.isDeleted ? 1 : 0}, ${toDateTime(r.createdAt)}, ${toDateTime(r.updatedAt)}) ` +
                `ON DUPLICATE KEY UPDATE \`name\`=VALUES(\`name\`);`
            );
        }

        sqlLines.push('');
        sqlLines.push('SET FOREIGN_KEY_CHECKS=1;');

        fs.writeFileSync(backupFile, sqlLines.join('\n'), 'utf8');
        console.log(`✅ Backup successfully created at: ${backupFile}`);
        console.log(`📁 File size: ${(fs.statSync(backupFile).size / 1024).toFixed(2)} KB`);

    } catch (err) {
        console.error('❌ Backup Failed:', err);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

runBackup();
