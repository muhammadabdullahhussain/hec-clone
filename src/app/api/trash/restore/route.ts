import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
    const authError = requireAdminAuth(request);
    if (authError) return authError;

    try {
        const { ids } = await request.json();
        
        if (!ids || !Array.isArray(ids)) {
            return NextResponse.json({ error: "Invalid data." }, { status: 400 });
        }

        await prisma.hecRecord.updateMany({
            where: { id: { in: ids } },
            data: { isDeleted: false }
        });

        return NextResponse.json({ success: true, message: "Restored successfully." });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to restore." }, { status: 500 });
    }
}
