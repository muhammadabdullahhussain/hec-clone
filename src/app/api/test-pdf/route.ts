import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, PDFName, PDFString, PDFArray, rgb, StandardFonts, degrees } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const clientIp = getClientIp(req);
        // Rate limit: Max 30 PDF generation requests per minute per IP
        const rateCheck = checkRateLimit(`pdf_${clientIp}`, 30, 60);
        if (!rateCheck.allowed) {
            return new NextResponse('Too many PDF requests. Please wait a moment.', {
                status: 429,
                headers: { 'Retry-After': String(rateCheck.resetInSec) }
            });
        }
        let id = req.nextUrl.searchParams.get('id');
        if (!id) {
            const pathname = req.nextUrl.pathname || req.url || '';
            const match = pathname.match(/DAS_(?:approved_letter|revamped_AppForm)_([^/?#.]+)/i);
            if (match) {
                id = decodeURIComponent(match[1]);
            }
        }

        let record = null;
        if (id) {
            const cleanId = id.trim();
            record = await (prisma as any).hecRecord.findFirst({
                where: {
                    OR: [
                        { application_id: cleanId },
                        { application_id: cleanId.replace(/\.pdf$/i, '') },
                        { cnic: cleanId },
                        !isNaN(Number(cleanId)) ? { id: Number(cleanId) } : {}
                    ]
                }
            });

            // If the record exists but is disabled or deleted, redirect to public verification portal with invalid error popup
            if (record && (!record.isActive || record.isDeleted)) {
                const redirectUrl = new URL('/?error=invalid#/degree-verification/hec-verification-public', req.url);
                const redirectRes = NextResponse.redirect(redirectUrl, 302);
                redirectRes.cookies.set('hec_error', 'invalid', { maxAge: 15, path: '/' });
                return redirectRes;
            }
        }

        let cnic, reference_number, application_id, name, father_name, date_of_birth, enrollment_no, degree_title, university, date_of_issuance, photo_url;

        if (record) {
            cnic = record.cnic;
            reference_number = record.reference_number;
            application_id = record.application_id;
            name = record.name || record.name_on_degree;
            father_name = record.father_name || '';
            date_of_birth = record.date_of_birth || '';
            enrollment_no = record.enrollment_no || '';
            degree_title = record.degree_title || '';
            university = record.university || '';
            date_of_issuance = record.date_of_issuance || '';
            photo_url = record.photo_url || null;

            // Intelligent Fallback: If this degree is missing photo or PDF on disk, check linked sibling degrees of the same candidate
            const currentPhotoPath = photo_url ? path.join(process.cwd(), 'public', photo_url.replace(/^\//, '')) : '';
            const currentPdfPath = record.pdf_url ? path.join(process.cwd(), 'public', record.pdf_url.replace(/^\//, '')) : '';
            const photoDiskExists = photo_url && fs.existsSync(currentPhotoPath);
            const pdfDiskExists = record.pdf_url && fs.existsSync(currentPdfPath);

            if (!photoDiskExists || !pdfDiskExists) {
                try {
                    const baseAppId = (record.application_id || '').split('-')[0];
                    const siblings = await (prisma as any).hecRecord.findMany({
                        where: {
                            isDeleted: false,
                            OR: [
                                { application_id: baseAppId },
                                { application_id: { startsWith: baseAppId } },
                                { cnic: record.cnic }
                            ]
                        },
                        orderBy: { id: 'asc' }
                    });

                    for (const sib of siblings) {
                        if (!photoDiskExists && sib.photo_url) {
                            const sibPhotoPath = path.join(process.cwd(), 'public', sib.photo_url.replace(/^\//, ''));
                            if (fs.existsSync(sibPhotoPath)) {
                                photo_url = sib.photo_url;
                            }
                        }
                        if (!pdfDiskExists && sib.pdf_url) {
                            const sibPdfPath = path.join(process.cwd(), 'public', sib.pdf_url.replace(/^\//, ''));
                            if (fs.existsSync(sibPdfPath)) {
                                record.pdf_url = sib.pdf_url;
                            }
                        }
                    }
                } catch (siblingError) {
                    console.error("Sibling degree lookup error:", siblingError);
                }
            }
        } else {
            // Fallback Dummy Data if no ID is provided or record not found
            cnic = "3540139675680";
            reference_number = "HEC/A&A/DAS/2026/TEST-123";
            application_id = "TEST-APP-999";
            name = "Test Student Name";
            father_name = "Test Father Name";
            date_of_birth = "1999-01-01";
            enrollment_no = "23-UE-TEST";
            degree_title = "Bachelor of Science in Testing";
            university = "Test University of Lahore";
            date_of_issuance = "2026-10-10";
        }

        // 1. Generate QR Code (margin 0, exactly 120x120 to match original exact edge-to-edge size)
        const qrCodeUrl = `https://hec.e-verify.pk/#/degree-verification/hec-verification-public`;
        const qrCodeDataUri = await QRCode.toDataURL(qrCodeUrl, { errorCorrectionLevel: 'L', margin: 0, scale: 10 });
        const qrImageBuffer = Buffer.from(qrCodeDataUri.split(',')[1], 'base64');

        // 2. Load the Blank Template
        const templatePath = path.join(process.cwd(), 'public', 'blank_certificate.pdf');
        const templateBuffer = fs.readFileSync(templatePath);
        const templateDoc = await PDFDocument.load(templateBuffer);
        templateDoc.registerFontkit(fontkit);
        const page1 = templateDoc.getPages()[0];

        // Load Arial Fonts from public/assets/fonts/arial
        const arialPath = path.join(process.cwd(), 'public', 'assets', 'fonts', 'arial', 'ARIAL.TTF');
        const arialBoldPath = path.join(process.cwd(), 'public', 'assets', 'fonts', 'arial', 'ARIALBD.TTF');

        let fontNormal;
        let fontBold;
        if (fs.existsSync(arialPath) && fs.existsSync(arialBoldPath)) {
            fontNormal = await templateDoc.embedFont(fs.readFileSync(arialPath));
            fontBold = await templateDoc.embedFont(fs.readFileSync(arialBoldPath));
        } else {
            fontNormal = await templateDoc.embedFont(StandardFonts.Helvetica);
            fontBold = await templateDoc.embedFont(StandardFonts.HelveticaBold);
        }

        // 3. Draw Dynamic Text
        const yOffset = 4;
        const textYParams = {
            name: 410.95 + yOffset,
            father_name: 362.95 + yOffset,
            cnic: 315.95 + yOffset,
            dob: 268.95 + yOffset,
            doi: 221.95 + yOffset,
            ref: 612.60 
        };

        const drawText = (text: string, x: number, y: number, font = fontNormal, size = 12, color = rgb(0,0,0)) => {
            page1.drawText(text, { x, y, font, size, color });
        };

        drawText(name, 147.0, textYParams.name, fontNormal, 12);
        drawText(father_name, 147.0, textYParams.father_name, fontNormal, 12);
        drawText(cnic, 147.0, textYParams.cnic, fontNormal, 12);
        drawText(date_of_birth, 147.0, textYParams.dob, fontNormal, 12);
        drawText(date_of_issuance, 147.0, textYParams.doi, fontNormal, 12);
        
        // Exact Reference No. Match
        const refY = 617.52;
        const refText = "Reference No. ";
        drawText(refText, 132.27, refY, fontNormal, 16);
        const refNumX = 132.27 + fontNormal.widthOfTextAtSize(refText, 16);
        drawText(reference_number, refNumX, refY, fontBold, 16);

        // --- Dynamic Attestation Paragraph with Auto-Wrapping ---
        // Tokens with text and bold status
        const attestationTokens: { text: string; isBold: boolean }[] = [
            { text: "HEC attests/recognizes the", isBold: false },
            { text: degree_title, isBold: true },
            { text: "of above named person issued by", isBold: false },
            { text: university, isBold: true },
            { text: "with Registration No./Roll No./Seat No./Enrollment No./Student ID", isBold: false },
            { text: enrollment_no, isBold: true },
        ];

        // Flatten into word-level tokens preserving bold styling
        interface WordToken {
            word: string;
            font: any;
            width: number;
        }

        const words: WordToken[] = [];
        for (const token of attestationTokens) {
            const font = token.isBold ? fontBold : fontNormal;
            const parts = token.text.split(' ');
            for (const part of parts) {
                if (!part) continue;
                words.push({
                    word: part,
                    font,
                    width: font.widthOfTextAtSize(part, 10),
                });
            }
        }

        // Layout words into lines fitting within the box (x: 51.0 to 561.0 => max width 510)
        const maxWidth = 510.0;
        const startX = 51.0;

        // Auto-fit font size between 10.0 and 8.5 so paragraph fits cleanly in exactly 2 lines (matching official HEC layout)
        let chosenFontSize = 10.0;
        let finalLines: WordToken[][] = [];

        for (let testSize = 10.0; testSize >= 8.5; testSize -= 0.1) {
            const currentWords: WordToken[] = [];
            for (const token of attestationTokens) {
                const font = token.isBold ? fontBold : fontNormal;
                const parts = token.text.split(' ');
                for (const part of parts) {
                    if (!part) continue;
                    currentWords.push({
                        word: part,
                        font,
                        width: font.widthOfTextAtSize(part, testSize),
                    });
                }
            }

            const testSpaceWidth = fontNormal.widthOfTextAtSize(' ', testSize);
            const candidateLines: WordToken[][] = [];
            let tempLine: WordToken[] = [];
            let tempLineWidth = 0;

            for (const w of currentWords) {
                const neededWidth = tempLine.length === 0 ? w.width : tempLineWidth + testSpaceWidth + w.width;
                if (neededWidth <= maxWidth || tempLine.length === 0) {
                    tempLine.push(w);
                    tempLineWidth = neededWidth;
                } else {
                    candidateLines.push(tempLine);
                    tempLine = [w];
                    tempLineWidth = w.width;
                }
            }
            if (tempLine.length > 0) {
                candidateLines.push(tempLine);
            }

            if (candidateLines.length <= 2 || testSize <= 8.55) {
                chosenFontSize = testSize;
                finalLines = candidateLines;
                break;
            }
        }

        const activeSpaceWidth = fontNormal.widthOfTextAtSize(' ', chosenFontSize);

        // Baseline Y coordinates:
        // Original line 1 baseline: 156.55. Line 2 baseline: 141.46 (line height: ~15.1pt)
        const startY = 156.55;
        const lineSpacing = 15.09;

        finalLines.forEach((lineWords, lineIndex) => {
            const lineY = startY - (lineIndex * lineSpacing);
            let drawX = startX;
            lineWords.forEach((wordObj) => {
                page1.drawText(wordObj.word, {
                    x: drawX,
                    y: lineY,
                    font: wordObj.font,
                    size: chosenFontSize,
                    color: rgb(0, 0, 0),
                });
                drawX += wordObj.width + activeSpaceWidth;
            });
        });

        // Helper to add clickable PDF hyperlinks
        const addLinkAnnotation = (rect: [number, number, number, number], url: string) => {
            const context = templateDoc.context;
            const linkAnnot = context.obj({
                Type: 'Annot',
                Subtype: 'Link',
                Rect: rect,
                Border: [0, 0, 0],
                C: [0, 0, 1],
                A: {
                    Type: 'Action',
                    S: 'URI',
                    URI: PDFString.of(url),
                },
            });
            const linkAnnotRef = context.register(linkAnnot);
            
            let annots = page1.node.lookup(PDFName.of('Annots'), PDFArray);
            if (!annots) {
                annots = context.obj([]);
                page1.node.set(PDFName.of('Annots'), annots);
            }
            annots.push(linkAnnotRef);
        };

        // 4. Draw Links & Bottom Box (Blue, No Underlines as requested)
        const blueColor = rgb(0, 0, 1);
        // Hide original baked-in QR and URL (120x120 at original bbox)
        page1.drawRectangle({
            x: 458, y: 642, width: 120, height: 120,
            color: rgb(1, 1, 1)
        });

        // Center the Link exactly 8 points below the QR Code
        const actualPortalUrl = "https://hec.e-verify.pk/#/degree-verification/hec-verification-public";
        const qrDisplayUrl = "https://hec.e-verify.pk/site/verification";
        const qrUrlWidth = fontNormal.widthOfTextAtSize(qrDisplayUrl, 6.0);
        const qrCenterX = 478.2 + (78.4 / 2); 
        const qrUrlX = qrCenterX - (qrUrlWidth / 2);
        drawText(qrDisplayUrl, qrUrlX, 655.0, fontNormal, 6.0, blueColor);
        addLinkAnnotation(
            [qrUrlX - 2, 653.0, qrUrlX + qrUrlWidth + 2, 663.0],
            actualPortalUrl
        );

        // Bottom Rectangle Line 1 (Exact match with official HEC template: size 8.85pt, y = 68.5)
        let currentX = 66.15;
        const yBottom = 68.5; // Matches original baseline (792 - 723.34)
        const bFontSize = 8.85;
        const bottomPart1 = "Please visit ";
        drawText(bottomPart1, currentX, yBottom, fontNormal, bFontSize);
        currentX += fontNormal.widthOfTextAtSize(bottomPart1, bFontSize);

        const linkStartX = currentX;
        const bottomDisplayLink = "https://hec.e-verify.pk/site/verification";
        drawText(bottomDisplayLink, currentX, yBottom, fontNormal, bFontSize, blueColor);
        
        const linkWidth = fontNormal.widthOfTextAtSize(bottomDisplayLink, bFontSize);
        // Draw the proper underline 1.5 points below the baseline
        page1.drawLine({
            start: { x: linkStartX, y: yBottom - 1.5 },
            end: { x: linkStartX + linkWidth, y: yBottom - 1.5 },
            thickness: 0.6,
            color: blueColor
        });
        addLinkAnnotation(
            [linkStartX - 2, yBottom - 2, linkStartX + linkWidth + 2, yBottom + 10],
            actualPortalUrl
        );
        
        currentX += linkWidth + 1.5;

        const bottomPart3 = " for verification of this certificate and document(s) attested thereunder.";
        drawText(bottomPart3, currentX, yBottom, fontNormal, bFontSize);

        // Bottom Rectangle Line 2 (Italic, Exact match with official HEC template: size 9.0pt, y = 57.3)
        const fontItalic = await templateDoc.embedFont(StandardFonts.HelveticaOblique);
        const bottomLine2 = "This is a system generated certificate and does not require a signature.";
        const line2Width = fontItalic.widthOfTextAtSize(bottomLine2, 9.0);
        // Center this text within the box (box center is (51 + 561) / 2 = 306)
        const line2X = 306 - (line2Width / 2);
        drawText(bottomLine2, line2X, 57.3, fontItalic, 9.0);

        // 5. Draw Photo & Real QR Code
        let photoDrawn = false;
        if (photo_url) {
            try {
                // photo_url is something like "/uploads/photo_17000000.jpg"
                // Resolve it to a file system path
                const photoPath = path.join(process.cwd(), 'public', photo_url.replace(/^\//, ''));
                if (fs.existsSync(photoPath)) {
                    const photoBuffer = fs.readFileSync(photoPath);
                    let photoImage;
                    const isPng = photoBuffer.length > 4 && 
                        photoBuffer[0] === 0x89 && 
                        photoBuffer[1] === 0x50 && 
                        photoBuffer[2] === 0x4E && 
                        photoBuffer[3] === 0x47;
                    const isJpg = photoBuffer.length > 2 && 
                        photoBuffer[0] === 0xFF && 
                        photoBuffer[1] === 0xD8;

                    try {
                        if (isPng) {
                            photoImage = await templateDoc.embedPng(photoBuffer);
                        } else if (isJpg) {
                            photoImage = await templateDoc.embedJpg(photoBuffer);
                        } else {
                            try {
                                photoImage = await templateDoc.embedJpg(photoBuffer);
                            } catch {
                                photoImage = await templateDoc.embedPng(photoBuffer);
                            }
                        }
                    } catch (embedError) {
                        try {
                            photoImage = isPng ? await templateDoc.embedJpg(photoBuffer) : await templateDoc.embedPng(photoBuffer);
                        } catch {
                            try {
                                const sharp = (await import('sharp')).default;
                                const normalizedBuffer = await sharp(photoBuffer).png().toBuffer();
                                photoImage = await templateDoc.embedPng(normalizedBuffer);
                            } catch (e) {
                                console.error("Could not embed image", e);
                            }
                        }
                    }
                    if (photoImage) {
                        // Draw a solid white background first to cover the underlying baked-in image
                        // This fixes the issue where uploaded transparent PNGs reveal the lady's photo underneath
                        page1.drawRectangle({
                            x: 240, y: 475, width: 130, height: 120,
                            color: rgb(1, 1, 1)
                        });
                        
                        // Exact match of original photo to hide the underlying baked image
                        page1.drawImage(photoImage, { x: 240, y: 475, width: 130, height: 120 });
                        photoDrawn = true;
                    }
                }
            } catch(e) { console.error("Error drawing real photo", e); }
        }

        if (!photoDrawn) {
            // Draw a grey box placeholder if no photo is available
            page1.drawRectangle({
                x: 240, y: 475, width: 130, height: 120,
                color: rgb(0.9, 0.9, 0.9)
            });
            page1.drawText("DUMMY PHOTO", { x: 255, y: 530, size: 10, color: rgb(0.5, 0.5, 0.5) });
        }

        try {
            const qrImage = await templateDoc.embedPng(qrImageBuffer);
            // 1000000000% Exact calculated size (78.4x78.4) and position to match the black square
            page1.drawImage(qrImage, { x: 478.2, y: 663.4, width: 78.4, height: 78.4 });
            addLinkAnnotation(
                [478.2, 663.4, 478.2 + 78.4, 663.4 + 78.4],
                "https://hec.e-verify.pk/#/degree-verification/hec-verification-public"
            );
        } catch(e) { console.error("Error drawing QR", e); }

        // Remove the default blank 2nd page from the original HEC template if it exists
        if (templateDoc.getPageCount() > 1) {
            templateDoc.removePage(1);
        }

        // --- 6. Append User's Uploaded PDF and Apply HEC Stamp ---
        if (record && record.pdf_url) {
            try {
                const userPdfPath = path.join(process.cwd(), 'public', record.pdf_url.replace(/^\//, ''));
                if (fs.existsSync(userPdfPath)) {
                    const userPdfBytes = fs.readFileSync(userPdfPath);
                    const userPdfDoc = await PDFDocument.load(userPdfBytes);
                    
                    // Copy ALL pages from user's uploaded PDF (whether 1, 4, 10, or 100 pages)
                    // If uploaded PDF is a combined file where page 0 is an old letter and has multiple pages,
                    // we still ensure all document pages are included!
                    const totalUploadedPages = userPdfDoc.getPageCount();
                    const pageIndices = Array.from({ length: totalUploadedPages }, (_, idx) => idx);
                    const copiedPages = await templateDoc.copyPages(userPdfDoc, pageIndices);
                    
                    // Load the exact official HEC Stamp PNG (extracted 1:1 from official HEC certificate)
                    const stampPngPath = path.join(process.cwd(), 'public', 'hec-stamp.png');
                    let stampImage;
                    if (fs.existsSync(stampPngPath)) {
                        const stampBytes = fs.readFileSync(stampPngPath);
                        stampImage = await templateDoc.embedPng(stampBytes);
                    }

                    for (const copiedPage of copiedPages) {
                        templateDoc.addPage(copiedPage);
                        
                        // Draw stamp using exact official HEC parameters: 267.75x267.75, centered, opacity 0.28
                        if (stampImage) {
                            const { width, height } = copiedPage.getSize();
                            const stampW = 267.75;
                            const stampH = 267.75;
                            const stampX = (width - stampW) / 2;
                            const stampY = (height - stampH) / 2;
                            
                            copiedPage.drawImage(stampImage, {
                                x: stampX,
                                y: stampY,
                                width: stampW,
                                height: stampH,
                                opacity: 0.28, // Matches official live HEC degree watermark depth
                                rotate: degrees(0)
                            });
                        }
                    }
                }
            } catch(e) { console.error("Error appending user PDF and stamp", e); }
        }

        const fileName = `DAS_approved_letter_${application_id || 'record'}.pdf`;
        templateDoc.setTitle(`DAS_approved_letter_${application_id || 'record'}`);
        templateDoc.setSubject(`HEC Attestation Certificate - ${application_id || 'record'}`);
        templateDoc.setAuthor('Higher Education Commission');
        templateDoc.setProducer('HEC Document Attestation Engine');
        templateDoc.setCreator('HEC Online Portal');

        const pdfBytes = await templateDoc.save();

        const downloadParam = req.nextUrl.searchParams.get('download');
        const disposition = downloadParam === 'true' ? 'attachment' : 'inline';

        // Return PDF directly to browser (opens inline in new tab by default)
        return new NextResponse(Buffer.from(pdfBytes), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `${disposition}; filename="${fileName}"`,
                'Content-Length': Buffer.from(pdfBytes).length.toString(),
            }
        });

    } catch (error: any) {
        console.error('PDF Generation Error:', error);
        return new NextResponse('Unable to load document at this time. Please try again.', { status: 500 });
    }
}
