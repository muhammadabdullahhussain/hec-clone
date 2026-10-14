import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { verifyTOTP, hashBackupCode } from '@/lib/totp';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const adminSession = getAuthenticatedAdmin(req);
        if (!adminSession) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { code, secret, backupCodes } = body;

        if (!code || !secret || !Array.isArray(backupCodes)) {
            return NextResponse.json({ error: 'Missing required 2FA verification parameters' }, { status: 400 });
        }

        // Verify the 6-digit TOTP code
        const isValid = verifyTOTP(code.trim(), secret);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid 6-digit code. Please check your authenticator app.' }, { status: 400 });
        }

        // Hash backup codes before storing
        const hashedCodes = backupCodes.map(c => hashBackupCode(c));

        // Save to database
        await prisma.admin.update({
            where: { id: adminSession.id },
            data: {
                twoFactorSecret: secret,
                twoFactorEnabled: true,
                backupCodes: JSON.stringify(hashedCodes)
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Two-Factor Authentication has been successfully enabled!'
        });
    } catch (error) {
        console.error('2FA Enable error:', error);
        return NextResponse.json({ error: 'Failed to enable 2FA' }, { status: 500 });
    }
}
