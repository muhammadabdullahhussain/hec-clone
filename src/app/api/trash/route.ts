import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const authError = requireAdminAuth(request);
    if (authError) return authError;

    try {
        const records = await prisma.hecRecord.findMany({
            where: { isDeleted: true },
            orderBy: { updatedAt: 'desc' }
        });
        return NextResponse.json({ success: true, records });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to fetch trash." }, { status: 500 });
    }
}
