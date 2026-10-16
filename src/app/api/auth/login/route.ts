import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signToken, hashPassword, sign2FATempToken } from '@/lib/auth';
import { checkRateLimit, getClientIp, sanitizeString } from '@/lib/security';

export async function POST(request: Request) {
    try {
        const clientIp = getClientIp(request);

        // Brute force protection: Max 5 attempts per 10 minutes per IP
        const rateCheck = checkRateLimit(`login_${clientIp}`, 5, 10 * 60);
        if (!rateCheck.allowed) {
            return NextResponse.json(
                { error: `Too many failed login attempts. Please wait ${rateCheck.resetInSec} seconds before trying again.` },
                { status: 429 }
            );
        }

        const body = await request.json();
        const username = sanitizeString(body.username, 50);
        const password = typeof body.password === 'string' ? body.password : '';

        if (!username || !password) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
        }

        // 1. Auto-seed / Auto-heal schema if missing
        let adminCount = 0;
        try {
            adminCount = await prisma.admin.count();
        } catch (dbErr: any) {
            // Missing tables in MySQL: self-heal and create them
            try {
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
                adminCount = await prisma.admin.count();
            } catch (healErr) {
                console.error("Auto-heal tables error:", healErr);
                throw dbErr;
            }
        }

        if (adminCount === 0) {
            const hashedPwd = await hashPassword('1715');
            await prisma.admin.create({
                data: {
                    username: 'admin',
                    password_hash: hashedPwd
                }
            });
        }

        // 2. Find Admin
        const admin = await prisma.admin.findUnique({ where: { username } });
        if (!admin) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // 3. Verify Password
        const isValid = await verifyPassword(password, admin.password_hash);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // 4. Check if Two-Factor Authentication is enabled
        if (admin.twoFactorEnabled && admin.twoFactorSecret) {
            const tempToken = sign2FATempToken({ id: admin.id, username: admin.username });
            return NextResponse.json({
                requires2FA: true,
                tempToken,
                message: 'Two-Factor Authentication required'
            });
        }

        // 5. Generate Standard JWT Token
        const token = signToken({ id: admin.id, username: admin.username });

        // 6. Set Secure HTTP-Only Cookie
        const response = NextResponse.json({ success: true, message: 'Logged in successfully' });
        const cookieOptions = { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict' as const,
            path: '/',
            maxAge: 8 * 60 * 60 // 8 hours
        };
        response.cookies.set('hec_admin_token', token, cookieOptions);
        response.cookies.set('admin_token', token, cookieOptions);

        return response;

    } catch (error: any) {
        console.error("Login Error:", error);
        const isProd = process.env.NODE_ENV === 'production';
        return NextResponse.json({ 
            error: isProd ? 'Internal authentication error. Please try again.' : (error?.message || 'System error during login')
        }, { status: 500 });
    }
}

