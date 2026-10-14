import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. Create Admin Table if not exists
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS \`Admin\` (
              \`id\` INT NOT NULL AUTO_INCREMENT,
              \`username\` VARCHAR(191) NOT NULL,
              \`password_hash\` VARCHAR(191) NOT NULL,
              \`twoFactorSecret\` VARCHAR(191) NULL,
              \`twoFactorEnabled\` BOOLEAN NOT NULL DEFAULT false,
              \`backupCodes\` TEXT NULL,
              \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
              PRIMARY KEY (\`id\`),
              UNIQUE KEY \`Admin_username_key\` (\`username\`)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        `);

        // 2. Create HecRecord Table if not exists
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS \`HecRecord\` (
              \`id\` INT NOT NULL AUTO_INCREMENT,
              \`cnic\` VARCHAR(191) NOT NULL,
              \`reference_number\` VARCHAR(191) NOT NULL,
              \`application_id\` VARCHAR(191) NOT NULL,
              \`name\` VARCHAR(191) NOT NULL,
              \`name_on_degree\` VARCHAR(191) NOT NULL,
              \`father_name\` VARCHAR(191) NOT NULL DEFAULT '',
              \`date_of_birth\` VARCHAR(191) NOT NULL DEFAULT '',
              \`enrollment_no\` VARCHAR(191) NOT NULL DEFAULT '',
              \`degree_title\` VARCHAR(191) NOT NULL,
              \`university\` VARCHAR(191) NOT NULL,
              \`date_of_issuance\` VARCHAR(191) NOT NULL DEFAULT '',
              \`attested_by\` VARCHAR(191) NOT NULL,
              \`photo_url\` VARCHAR(191) NULL,
              \`pdf_url\` VARCHAR(191) NULL,
              \`isActive\` BOOLEAN NOT NULL DEFAULT true,
              \`isDeleted\` BOOLEAN NOT NULL DEFAULT false,
              \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
              \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
              PRIMARY KEY (\`id\`),
              INDEX \`HecRecord_application_id_idx\` (\`application_id\`),
              INDEX \`HecRecord_cnic_idx\` (\`cnic\`),
              INDEX \`HecRecord_reference_number_idx\` (\`reference_number\`)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        `);

        // 3. Ensure Admin exists
        const adminCount = await prisma.admin.count();
        if (adminCount === 0) {
            const hashed = await hashPassword('1715');
            await prisma.admin.create({
                data: {
                    username: 'admin',
                    password_hash: hashed
                }
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Database tables verified, schema ready, and admin initialized!',
            adminCount: await prisma.admin.count(),
            recordsCount: await prisma.hecRecord.count()
        });
    } catch (err: any) {
        console.error('Setup error:', err);
        return NextResponse.json({
            success: false,
            error: err?.message || String(err),
            code: err?.code,
            details: String(err)
        }, { status: 500 });
    }
}
