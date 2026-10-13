import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await (prisma as any).hecRecord.update({
            where: { id: Number(params.id) },
            data: { isDeleted: false }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
