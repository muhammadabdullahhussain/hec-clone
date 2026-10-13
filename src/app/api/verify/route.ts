import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp, sanitizeString } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const clientIp = getClientIp(req);

        // Anti-Scraping Rate Limit: Max 15 searches per minute per IP
        const rateCheck = checkRateLimit(`verify_${clientIp}`, 15, 60);
        if (!rateCheck.allowed) {
            return NextResponse.json(
                { found: false, message: `Too many verification requests. Please wait ${rateCheck.resetInSec} seconds.` },
                { status: 429 }
            );
        }

        const body = await req.json();
        const rawCnic = sanitizeString(body.cnic, 30);
        const rawRef = sanitizeString(body.reference_number, 100);
        const captchaToken = typeof body.captchaToken === 'string' ? body.captchaToken : '';

        // Basic validation
        if (!rawCnic || !rawRef) {
            return NextResponse.json(
                { found: false, message: 'Please provide valid CNIC/Passport number and reference number.' },
                { status: 400 }
            );
        }

        // Verify reCAPTCHA with Google's Keys
        if (!captchaToken) {
            return NextResponse.json(
                { found: false, message: 'Captcha verification is required. Please check the captcha.' },
                { status: 400 }
            );
        }

        const isProduction = process.env.NODE_ENV === 'production';
        if (captchaToken !== 'dev_bypass' || isProduction) {
            const verifyRes = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `secret=6LcmkugtAAAAAEfxEUKjc2_2nbE88evnF6sn1pOI&response=${encodeURIComponent(captchaToken)}`
            });
            const captchaData = await verifyRes.json();
            if (!captchaData.success) {
                return NextResponse.json(
                    { found: false, message: 'reCAPTCHA verification failed. Please try again.' },
                    { status: 400 }
                );
            }
        }


        // Clean and normalize search inputs
        const cleanCnic = rawCnic.replace(/[-\s]/g, '').trim();
        const cleanRef = rawRef.trim();

        // Extract base/numeric part of reference number (e.g. 5076464 from HEC/A&A/DAS/2026/5076464)
        const refParts = cleanRef.split('/');
        const refBase = refParts[refParts.length - 1].trim();

        // Step 1: Verify the search query matches at least one authentic record
        const matchingRecord = await (prisma as any).hecRecord.findFirst({
            where: {
                AND: [
                    {
                        OR: [
                            { cnic: cleanCnic },
                            { cnic: rawCnic },
                            { cnic: { contains: cleanCnic } }
                        ]
                    },
                    {
                        OR: [
                            { reference_number: cleanRef },
                            { reference_number: { contains: cleanRef } },
                            { reference_number: { contains: refBase } },
                            { application_id: cleanRef },
                            { application_id: refBase }
                        ]
                    },
                    { isActive: true },
                    { isDeleted: false }
                ]
            }
        });

        if (!matchingRecord) {
            return NextResponse.json({ found: false, records: [] });
        }

        // Step 2: Fetch ALL attestation records for this verified person (by CNIC or Application ID)
        const candidateCnic = matchingRecord.cnic ? matchingRecord.cnic.replace(/[-\s]/g, '').trim() : cleanCnic;
        const candidateAppId = matchingRecord.application_id ? matchingRecord.application_id.trim() : '';

        const records = await (prisma as any).hecRecord.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            { cnic: candidateCnic },
                            { cnic: cleanCnic },
                            { cnic: rawCnic },
                            { cnic: { contains: candidateCnic } },
                            ...(candidateAppId ? [{ application_id: candidateAppId }] : [])
                        ]
                    },
                    { isActive: true },
                    { isDeleted: false }
                ]
            },
            select: {
                id: true,
                application_id: true,
                cnic: true,
                reference_number: true,
                degree_title: true,
                name_on_degree: true,
                university: true,
                attested_by: true,
                pdf_url: true,
            },
            orderBy: {
                id: 'asc'
            }
        });

        if (!records || records.length === 0) {
            return NextResponse.json({ found: false, records: [] });
        }

        return NextResponse.json({ found: true, count: records.length, records });
    } catch (error) {
        console.error('Verify API error:', error);
        return NextResponse.json(
            { found: false, message: 'An error occurred. Please try again.' },
            { status: 500 }
        );
    }
}
