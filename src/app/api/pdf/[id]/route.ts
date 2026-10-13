import { NextRequest } from 'next/server';
import { GET as testPdfGet } from '@/app/api/test-pdf/route';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    let cleanId = params.id || '';
    cleanId = cleanId.replace(/^DAS_approved_letter_/i, '').replace(/\.pdf$/i, '');
    const url = new URL(req.url);
    url.searchParams.set('id', cleanId);
    const modifiedReq = new NextRequest(url.toString(), req as any);
    return testPdfGet(modifiedReq);
}
