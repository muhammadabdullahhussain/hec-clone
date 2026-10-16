import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/auth';

import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
    const authError = requireAdminAuth(request);
    if (authError) return authError;

    try {
        const { ids } = await request.json();
        
        if (!ids || !Array.isArray(ids)) {
            return NextResponse.json({ error: "Invalid data." }, { status: 400 });
        }

        // Clean associated files from storage
        const records = await prisma.hecRecord.findMany({
            where: { id: { in: ids } },
            select: { photo_url: true, pdf_url: true }
        });

        for (const rec of records) {
            if (rec.photo_url) {
                const p = path.join(process.cwd(), 'public', rec.photo_url.replace(/^\//, ''));
                if (fs.existsSync(p)) {
                    try { fs.unlinkSync(p); } catch {}
                }
            }
            if (rec.pdf_url) {
                const p = path.join(process.cwd(), 'public', rec.pdf_url.replace(/^\//, ''));
                if (fs.existsSync(p)) {
                    try { fs.unlinkSync(p); } catch {}
                }
            }
        }

        await prisma.hecRecord.deleteMany({
            where: { id: { in: ids } }
        });

        return NextResponse.json({ success: true, message: "Deleted permanently." });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to delete permanently." }, { status: 500 });
    }
}
