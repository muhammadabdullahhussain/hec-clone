import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const adminSession = getAuthenticatedAdmin(req);
        if (!adminSession) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const admin = await prisma.admin.findUnique({
            where: { id: adminSession.id },
            select: {
                id: true,
                username: true,
                twoFactorEnabled: true,
                backupCodes: true
            }
        });

        if (!admin) {
            return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
        }

        let remainingBackupCodesCount = 0;
        if (admin.backupCodes) {
            try {
                const list = JSON.parse(admin.backupCodes);
                remainingBackupCodesCount = Array.isArray(list) ? list.length : 0;
            } catch {}
        }

        return NextResponse.json({
            twoFactorEnabled: admin.twoFactorEnabled,
            remainingBackupCodesCount
        });
    } catch (error) {
        console.error('2FA Status error:', error);
        return NextResponse.json({ error: 'Failed to fetch 2FA status' }, { status: 500 });
    }
}
