import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin, verifyPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const adminSession = getAuthenticatedAdmin(req);
        if (!adminSession) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { password } = body;

        if (!password) {
            return NextResponse.json({ error: 'Password is required to disable 2FA' }, { status: 400 });
        }

        const admin = await prisma.admin.findUnique({
            where: { id: adminSession.id }
        });

        if (!admin) {
            return NextResponse.json({ error: 'Admin account not found' }, { status: 404 });
        }

        const isPasswordValid = await verifyPassword(password, admin.password_hash);
        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
        }

        await prisma.admin.update({
            where: { id: admin.id },
            data: {
                twoFactorSecret: null,
                twoFactorEnabled: false,
                backupCodes: null
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Two-Factor Authentication has been disabled.'
        });
    } catch (error) {
        console.error('2FA Disable error:', error);
        return NextResponse.json({ error: 'Failed to disable 2FA' }, { status: 500 });
    }
}
