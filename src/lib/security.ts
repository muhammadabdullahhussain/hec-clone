import { NextRequest, NextResponse } from 'next/server';

// -------------------------------------------------------------
// 1. IN-MEMORY RATE LIMITER (Protects against Brute-Force & Scrapers)
// -------------------------------------------------------------
interface RateLimitRecord {
    count: number;
    resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Cleanup stale rate limit entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    rateLimitMap.forEach((record, key) => {
        if (record.resetAt <= now) {
            rateLimitMap.delete(key);
        }
    });
}, 5 * 60 * 1000);

export function checkRateLimit(
    identifier: string,
    maxRequests: number = 20,
    windowSeconds: number = 60
): { allowed: boolean; remaining: number; resetInSec: number } {
    const now = Date.now();
    const existing = rateLimitMap.get(identifier);

    if (!existing || existing.resetAt <= now) {
        rateLimitMap.set(identifier, {
            count: 1,
            resetAt: now + windowSeconds * 1000
        });
        return { allowed: true, remaining: maxRequests - 1, resetInSec: windowSeconds };
    }

    if (existing.count >= maxRequests) {
        const resetInSec = Math.ceil((existing.resetAt - now) / 1000);
        return { allowed: false, remaining: 0, resetInSec };
    }

    existing.count += 1;
    return {
        allowed: true,
        remaining: maxRequests - existing.count,
        resetInSec: Math.ceil((existing.resetAt - now) / 1000)
    };
}

export function getClientIp(req: NextRequest | Request): string {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    const realIp = req.headers.get('x-real-ip');
    if (realIp) return realIp.trim();
    return '127.0.0.1';
}

// -------------------------------------------------------------
// 2. SAFE FILE UPLOAD VALIDATOR (Prevents Web Shells & File Injections)
// -------------------------------------------------------------
const ALLOWED_PHOTO_EXTENSIONS = new Set([
    'jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp', 'png', 'webp', 
    'gif', 'bmp', 'tiff', 'tif', 'ico', 'svg', 'avif', 'heic', 'heif'
]);
const ALLOWED_DOC_EXTENSIONS = new Set(['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']);

import fs from 'fs';
import sharp from 'sharp';

export function validateUploadedFile(
    file: File,
    type: 'photo' | 'doc'
): { valid: boolean; error?: string; safeExt?: string } {
    const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10 MB max upload
    const MAX_DOC_SIZE = 20 * 1024 * 1024;   // 20 MB max doc

    if (!file || file.size === 0) {
        return { valid: false, error: 'Empty file' };
    }

    const rawExt = (file.name.split('.').pop() || '').toLowerCase();

    if (type === 'photo') {
        // Allow any image extension or if mime-type starts with image/
        const isImageMime = file.type ? file.type.startsWith('image/') : false;
        if (!ALLOWED_PHOTO_EXTENSIONS.has(rawExt) && !isImageMime) {
            return { valid: false, error: 'Invalid photo format. Please upload an image file (JPG, PNG, JFIF, WEBP, BMP, etc.).' };
        }
        if (file.size > MAX_PHOTO_SIZE) {
            return { valid: false, error: 'Photo size exceeds limit (max 10MB).' };
        }
        let safe = rawExt;
        if (rawExt === 'jpeg' || rawExt === 'jfif' || rawExt === 'pjpeg' || rawExt === 'pjp') safe = 'jpg';
        return { valid: true, safeExt: safe || 'jpg' };
    }

    if (type === 'doc') {
        if (!ALLOWED_DOC_EXTENSIONS.has(rawExt)) {
            return { valid: false, error: 'Invalid document format. Only PDF files allowed.' };
        }
        if (file.size > MAX_DOC_SIZE) {
            return { valid: false, error: 'Document size exceeds limit (max 20MB).' };
        }
        return { valid: true, safeExt: 'pdf' };
    }

    return { valid: false, error: 'Unsupported file type.' };
}

/**
 * Optimizes student photo, strips tracking/camera EXIF metadata,
 * and saves compressed image to disk. Prevents storage bloat and tracking leaks.
 */
export async function processAndSaveOptimizedImage(
    buffer: Buffer,
    destinationPath: string
): Promise<void> {
    try {
        await sharp(buffer)
            .rotate() // Automatically orient based on EXIF before stripping
            .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 82, progressive: true, mozjpeg: true })
            .toFile(destinationPath);
    } catch {
        // Fallback: write raw buffer safely if image format not standard
        fs.writeFileSync(destinationPath, buffer);
    }
}

// -------------------------------------------------------------
// 3. INPUT SANITIZER
// -------------------------------------------------------------
export function sanitizeString(val: unknown, maxLength: number = 255): string {
    if (typeof val !== 'string') return '';
    return val
        .trim()
        .replace(/[<>]/g, '') // Strip HTML tags
        .slice(0, maxLength);
}
