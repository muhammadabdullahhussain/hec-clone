import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const MIME_TYPES: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.pdf': 'application/pdf',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
};

export async function GET(req: NextRequest, { params }: { params: { file: string[] } }) {
    try {
        const filePathParam = Array.isArray(params.file) ? params.file.join('/') : params.file;
        const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
        const resolvedPath = path.resolve(uploadsDir, filePathParam);

        // Security check: ensure target path is inside uploadsDir
        if (!resolvedPath.startsWith(uploadsDir) || !fs.existsSync(resolvedPath)) {
            return new NextResponse('File Not Found', { status: 404 });
        }

        const ext = path.extname(resolvedPath).toLowerCase();
        const contentType = MIME_TYPES[ext];
        if (!contentType) {
            return new NextResponse('File Type Not Allowed', { status: 403 });
        }
        const fileBuffer = fs.readFileSync(resolvedPath);

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Length': fileBuffer.length.toString(),
                'Cache-Control': 'public, max-age=31536000, immutable',
                'X-Content-Type-Options': 'nosniff',
            },
        });
    } catch (error) {
        return new NextResponse('Server Error', { status: 500 });
    }
}
