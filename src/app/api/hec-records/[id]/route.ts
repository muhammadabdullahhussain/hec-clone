import path from 'path';
import fsModule from 'fs';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/auth';
import { validateUploadedFile, sanitizeString } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const authError = requireAdminAuth(req);
    if (authError) return authError;

    try {
        await (prisma as any).hecRecord.update({
            where: { id: Number(params.id) },
            data: { isDeleted: true }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const authError = requireAdminAuth(req);
    if (authError) return authError;

    try {
        const { isActive } = await req.json();
        await (prisma as any).hecRecord.update({
            where: { id: Number(params.id) },
            data: { isActive: Boolean(isActive) }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const authError = requireAdminAuth(req);
    if (authError) return authError;

    try {
        const record = await (prisma as any).hecRecord.findUnique({
            where: { id: Number(params.id) }
        });
        if (!record) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });


        // Find all linked degrees for this student
        const cleanCnic = (record.cnic || '').replace(/[^a-zA-Z0-9]/g, '');
        const baseAppId = (record.application_id || '').split('-')[0];

        const linkedDegrees = await (prisma as any).hecRecord.findMany({
            where: {
                isDeleted: false,
                OR: [
                    { cnic: record.cnic },
                    cleanCnic ? { cnic: cleanCnic } : {},
                    { application_id: { startsWith: baseAppId } }
                ]
            },
            orderBy: { id: 'asc' }
        });

        return NextResponse.json({ 
            success: true, 
            record,
            degrees: linkedDegrees && linkedDegrees.length > 0 ? linkedDegrees : [record]
        });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const authError = requireAdminAuth(req);
    if (authError) return authError;

    try {
        const formData = await req.formData();
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fsModule.existsSync(uploadsDir)) {
            fsModule.mkdirSync(uploadsDir, { recursive: true });
        }

        const degreeIds = formData.getAll('degree_id[]');
        const degreeTitles = formData.getAll('degree_title[]');
        const universities = formData.getAll('university[]');
        const enrollmentNos = formData.getAll('enrollment_no[]');
        const issuanceDates = formData.getAll('date_of_issuance[]');
        const attestedBys = formData.getAll('attested_by[]');
        const photos = formData.getAll('photo[]');
        const pdfs = formData.getAll('pdf[]');

        // Shared student info (sanitized)
        const cnic = sanitizeString(formData.get('cnic'), 30).replace(/[-\s]/g, '');
        const reference_number = sanitizeString(formData.get('reference_number'), 100);
        const baseAppId = sanitizeString(formData.get('application_id'), 100);
        const name = sanitizeString(formData.get('name'), 150);
        const father_name = sanitizeString(formData.get('father_name'), 150);
        const date_of_birth = sanitizeString(formData.get('date_of_birth'), 50);

        // If multi-degree form submitted
        if (degreeTitles.length > 0) {
            // Find all current degrees for this student to know which to keep/delete
            const currentRecord = await (prisma as any).hecRecord.findUnique({
                where: { id: Number(params.id) }
            });

            let allPrevDegrees: any[] = [];
            if (currentRecord) {
                const cleanCnic = (currentRecord.cnic || '').replace(/[^a-zA-Z0-9]/g, '');
                const cleanBase = (currentRecord.application_id || '').split('-')[0];
                allPrevDegrees = await (prisma as any).hecRecord.findMany({
                    where: {
                        isDeleted: false,
                        OR: [
                            { cnic: currentRecord.cnic },
                            cleanCnic ? { cnic: cleanCnic } : {},
                            { application_id: { startsWith: cleanBase } }
                        ]
                    }
                });
            }

            const submittedIds = new Set<number>();

            for (let i = 0; i < degreeTitles.length; i++) {
                const degIdStr = degreeIds[i] as string | undefined;
                const degId = degIdStr ? Number(degIdStr) : 0;
                const appId = i === 0 ? baseAppId : `${baseAppId}-${i + 1}`;

                let photoUrl: string | undefined = undefined;
                const photoFile = photos[i] as File | undefined;
                if (photoFile && photoFile.size > 0) {
                    const validation = validateUploadedFile(photoFile, 'photo');
                    if (validation.valid) {
                        const randomSuffix = crypto.randomBytes(8).toString('hex');
                        const photoName = `photo_${Date.now()}_${i}_${randomSuffix}.${validation.safeExt}`;
                        const photoBuffer = Buffer.from(await photoFile.arrayBuffer());
                        fsModule.writeFileSync(path.join(uploadsDir, photoName), photoBuffer);
                        photoUrl = `/uploads/${photoName}`;
                    }
                }

                let pdfUrl: string | undefined = undefined;
                const pdfFile = pdfs[i] as File | undefined;
                if (pdfFile && pdfFile.size > 0) {
                    const validation = validateUploadedFile(pdfFile, 'doc');
                    if (validation.valid) {
                        const randomSuffix = crypto.randomBytes(8).toString('hex');
                        const pdfName = `doc_${Date.now()}_${i}_${randomSuffix}.pdf`;
                        const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());
                        fsModule.writeFileSync(path.join(uploadsDir, pdfName), pdfBuffer);
                        pdfUrl = `/uploads/${pdfName}`;
                    }
                }

                if (degId && degId > 0) {
                    submittedIds.add(degId);
                    await (prisma as any).hecRecord.update({
                        where: { id: degId },
                        data: {
                            cnic,
                            reference_number,
                            application_id: appId,
                            name,
                            name_on_degree: name,
                            father_name,
                            date_of_birth,
                            degree_title: (degreeTitles[i] as string) || '',
                            university: (universities[i] as string) || '',
                            enrollment_no: (enrollmentNos[i] as string) || '',
                            date_of_issuance: (issuanceDates[i] as string) || '',
                            attested_by: (attestedBys[i] as string) || 'Muhammad Sulaiman',
                            ...(photoUrl ? { photo_url: photoUrl } : {}),
                            ...(pdfUrl ? { pdf_url: pdfUrl } : {})
                        }
                    });
                } else {
                    // Newly added degree
                    const created = await (prisma as any).hecRecord.create({
                        data: {
                            cnic,
                            reference_number,
                            application_id: appId,
                            name,
                            name_on_degree: name,
                            father_name,
                            date_of_birth,
                            degree_title: (degreeTitles[i] as string) || '',
                            university: (universities[i] as string) || '',
                            enrollment_no: (enrollmentNos[i] as string) || '',
                            date_of_issuance: (issuanceDates[i] as string) || '',
                            attested_by: (attestedBys[i] as string) || 'Muhammad Sulaiman',
                            photo_url: photoUrl || '',
                            pdf_url: pdfUrl || ''
                        }
                    });
                    submittedIds.add(created.id);
                }
            }

            // Mark removed degrees as deleted
            for (const prev of allPrevDegrees) {
                if (!submittedIds.has(prev.id)) {
                    await (prisma as any).hecRecord.update({
                        where: { id: prev.id },
                        data: { isDeleted: true }
                    });
                }
            }

            return NextResponse.json({ success: true });
        }

        // Fallback for single record update
        const updateData: any = {
            cnic,
            reference_number,
            application_id: baseAppId,
            name,
            name_on_degree: name,
            father_name,
            date_of_birth,
            enrollment_no: formData.get('enrollment_no') as string,
            degree_title: formData.get('degree_title') as string,
            university: formData.get('university') as string,
            date_of_issuance: formData.get('date_of_issuance') as string,
            attested_by: formData.get('attested_by') as string,
        };

        const photo = formData.get('photo');
        if (photo && (photo as File).size > 0) {
            const validation = validateUploadedFile(photo as File, 'photo');
            if (validation.valid) {
                const randomSuffix = crypto.randomBytes(8).toString('hex');
                const photoName = `photo_${Date.now()}_${randomSuffix}.${validation.safeExt}`;
                const photoBuffer = Buffer.from(await (photo as File).arrayBuffer());
                fsModule.writeFileSync(path.join(uploadsDir, photoName), photoBuffer);
                updateData.photo_url = `/uploads/${photoName}`;
            }
        }

        const pdf = formData.get('pdf');
        if (pdf && (pdf as File).size > 0) {
            const validation = validateUploadedFile(pdf as File, 'doc');
            if (validation.valid) {
                const randomSuffix = crypto.randomBytes(8).toString('hex');
                const pdfName = `doc_${Date.now()}_${randomSuffix}.pdf`;
                const pdfBuffer = Buffer.from(await (pdf as File).arrayBuffer());
                fsModule.writeFileSync(path.join(uploadsDir, pdfName), pdfBuffer);
                updateData.pdf_url = `/uploads/${pdfName}`;
            }
        }

        await (prisma as any).hecRecord.update({
            where: { id: Number(params.id) },
            data: updateData
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("PUT Error:", error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
