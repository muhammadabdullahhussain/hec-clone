import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { generateBase32Secret, getOTPAuthURI, generateQRCodeDataURL, generateBackupCodes } from '@/lib/totp';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const admin = getAuthenticatedAdmin(req);
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const secret = generateBase32Secret(32);
        const otpauthUri = getOTPAuthURI(admin.username || 'admin', secret, 'HEC Portal');
        const qrCodeUrl = await generateQRCodeDataURL(otpauthUri);
        const backupCodes = generateBackupCodes(5);

        return NextResponse.json({
            success: true,
            secret,
            qrCodeUrl,
            backupCodes
        });
    } catch (error) {
        console.error('2FA Setup error:', error);
        return NextResponse.json({ error: 'Failed to initialize 2FA setup' }, { status: 500 });
    }
}
