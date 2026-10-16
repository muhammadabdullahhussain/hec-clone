import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { requireAdminAuth } from '@/lib/auth';
import { validateUploadedFile, sanitizeString, processAndSaveOptimizedImage } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const authError = requireAdminAuth(req);
    if (authError) return authError;

    try {
        const formData = await req.formData();
        
        // Extract & sanitize fields
        const cnic = sanitizeString(formData.get('cnic'), 30);
        const reference_number = sanitizeString(formData.get('reference_number'), 100);
        const application_id = sanitizeString(formData.get('application_id'), 100);
        const name = sanitizeString(formData.get('name'), 150);
        const name_on_degree = sanitizeString(formData.get('name_on_degree'), 150) || name;
        const father_name = sanitizeString(formData.get('father_name'), 150);
        const date_of_birth = sanitizeString(formData.get('date_of_birth'), 50);
        const enrollment_no = sanitizeString(formData.get('enrollment_no'), 100);
        const degree_title = sanitizeString(formData.get('degree_title'), 200);
        const university = sanitizeString(formData.get('university'), 250);
        const date_of_issuance = sanitizeString(formData.get('date_of_issuance'), 50);
        const attested_by = sanitizeString(formData.get('attested_by'), 150) || 'Muhammad Sulaiman';

        const photo = formData.get('photo') as File | null;
        const pdfFile = formData.get('pdf') as File | null;

        if (!cnic || !reference_number || !degree_title || !name_on_degree) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        const cleanCnic = cnic.replace(/[-\s]/g, '').trim();
        const cleanRef = reference_number.trim();
        const cleanAppId = application_id.trim();

        // Directories for uploads
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

        let photoUrl = '';
        if (photo && photo.size > 0) {
            const validation = validateUploadedFile(photo, 'photo');
            if (!validation.valid) {
                return NextResponse.json({ success: false, message: validation.error }, { status: 400 });
            }
            const randomSuffix = crypto.randomBytes(8).toString('hex');
            const photoName = `photo_${Date.now()}_${randomSuffix}.${validation.safeExt}`;
            const photoPath = path.join(uploadsDir, photoName);
            const photoBuffer = Buffer.from(await photo.arrayBuffer());
            await processAndSaveOptimizedImage(photoBuffer, photoPath);
            photoUrl = `/uploads/${photoName}`;
        }

        let pdfUrl = '';
        if (pdfFile && pdfFile.size > 0) {
            const validation = validateUploadedFile(pdfFile, 'doc');
            if (!validation.valid) {
                return NextResponse.json({ success: false, message: validation.error }, { status: 400 });
            }
            const randomSuffix = crypto.randomBytes(8).toString('hex');
            const safeAppId = cleanAppId.replace(/[^a-zA-Z0-9]/g, '');
            const pdfName = `doc_${safeAppId || 'hec'}_${Date.now()}_${randomSuffix}.pdf`;
            const pdfPath = path.join(uploadsDir, pdfName);
            const uploadedPdfBuffer = Buffer.from(await pdfFile.arrayBuffer());
            fs.writeFileSync(pdfPath, uploadedPdfBuffer);
            pdfUrl = `/uploads/${pdfName}`;
        }

        // Check for duplicates (only reject if same application_id AND same degree_title)
        if (cleanAppId && degree_title) {
            const existingRecord = await (prisma as any).hecRecord.findFirst({
                where: {
                    application_id: cleanAppId,
                    degree_title: degree_title
                }
            });
            if (existingRecord) {
                return NextResponse.json({ success: false, message: 'This degree for this Application ID already exists!' }, { status: 400 });
            }
        }

        // Save to Database
        const newRecord = await (prisma as any).hecRecord.create({
            data: {
                cnic: cleanCnic,
                reference_number: cleanRef,
                application_id: cleanAppId,
                name,
                name_on_degree,
                father_name,
                date_of_birth,
                enrollment_no,
                degree_title,
                university,
                date_of_issuance,
                attested_by,
                photo_url: photoUrl,
                pdf_url: pdfUrl
            }
        });

        return NextResponse.json({ success: true, record: newRecord });

    } catch (error) {
        console.error('Error adding record:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const authError = requireAdminAuth(req);
    if (authError) return authError;

    try {
        const url = new URL(req.url);
        const listType = url.searchParams.get('list');
        const isDeleted = listType === 'trash';

        const records = await (prisma as any).hecRecord.findMany({
            where: { isDeleted },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, records });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const authError = requireAdminAuth(req);
    if (authError) return authError;

    try {
        const body = await req.json();
        const { ids } = body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ success: false, message: 'Invalid or empty IDs array' }, { status: 400 });
        }

        await (prisma as any).hecRecord.updateMany({
            where: { id: { in: ids.map(Number) } },
            data: { isDeleted: true }
        });

        return NextResponse.json({ success: true, count: ids.length, message: 'Moved to trash' });
    } catch (error) {
        console.error('Error in bulk delete:', error);
        return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const authError = requireAdminAuth(req);
    if (authError) return authError;

    try {
        const body = await req.json();
        const { ids, isActive } = body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ success: false, message: 'Invalid or empty IDs array' }, { status: 400 });
        }

        await (prisma as any).hecRecord.updateMany({
            where: { id: { in: ids.map(Number) } },
            data: { isActive: Boolean(isActive) }
        });

        return NextResponse.json({ success: true, count: ids.length });
    } catch (error) {
        console.error('Error in bulk status update:', error);
        return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
    }
}

