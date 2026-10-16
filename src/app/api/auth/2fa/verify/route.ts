import { NextRequest, NextResponse } from 'next/server';
import { verify2FATempToken, signToken } from '@/lib/auth';
import { verifyTOTP, verifyAndConsumeBackupCode } from '@/lib/totp';
import { checkRateLimit, getClientIp } from '@/lib/security';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const clientIp = getClientIp(req);

        // Rate limit: 5 2FA verification attempts per 5 minutes per IP
        const rateCheck = checkRateLimit(`2fa_verify_${clientIp}`, 5, 5 * 60);
        if (!rateCheck.allowed) {
            return NextResponse.json(
                { error: `Too many failed attempts. Please wait ${rateCheck.resetInSec} seconds.` },
                { status: 429 }
            );
        }

        const body = await req.json();
        const { tempToken, code, isBackupCode } = body;

        if (!tempToken || !code) {
            return NextResponse.json({ error: 'Missing 2FA verification parameters' }, { status: 400 });
        }

        const tempAdmin = verify2FATempToken(tempToken);
        if (!tempAdmin) {
            return NextResponse.json({ error: '2FA session expired. Please log in again.' }, { status: 401 });
        }

        const admin = await prisma.admin.findUnique({
            where: { id: tempAdmin.id }
        });

        if (!admin || !admin.twoFactorEnabled || !admin.twoFactorSecret) {
            return NextResponse.json({ error: '2FA is not configured for this account' }, { status: 400 });
        }

        let verified = false;

        if (isBackupCode) {
            // Check backup code
            const consumeResult = verifyAndConsumeBackupCode(code.trim(), admin.backupCodes);
            if (consumeResult.valid) {
                verified = true;
                // Update remaining backup codes in database
                await prisma.admin.update({
                    where: { id: admin.id },
                    data: { backupCodes: JSON.stringify(consumeResult.remainingCodes) }
                });
            }
        } else {
            // Verify 6-digit TOTP
            verified = verifyTOTP(code.trim(), admin.twoFactorSecret);
        }

        if (!verified) {
            return NextResponse.json(
                { error: isBackupCode ? 'Invalid or already used backup code.' : 'Invalid 6-digit verification code.' },
                { status: 400 }
            );
        }

        // Login verified! Issue full admin token
        const token = signToken({ id: admin.id, username: admin.username });
        const response = NextResponse.json({ success: true, message: '2FA verified successfully' });
        const cookieOpts = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict' as const,
            path: '/',
            maxAge: 8 * 60 * 60 // 8 hours
        };
        response.cookies.set('hec_admin_token', token, cookieOpts);
        response.cookies.set('admin_token', token, cookieOpts);

        return response;
    } catch (error) {
        console.error('2FA Verification error:', error);
        return NextResponse.json({ error: 'Internal system error' }, { status: 500 });
    }
}
