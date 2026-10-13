import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const authError = requireAdminAuth(req);
    if (authError) return authError;

    try {
        const [total, active, deleted] = await Promise.all([
            (prisma as any).hecRecord.count(),
            (prisma as any).hecRecord.count({ where: { isDeleted: false } }),
            (prisma as any).hecRecord.count({ where: { isDeleted: true } })
        ]);

        return NextResponse.json({
            success: true,
            total,
            active,
            deleted
        });
    } catch (error) {
        console.error('Stats fetch error:', error);
        return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
    }
}
