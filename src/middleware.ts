import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET_STRING = process.env.JWT_SECRET || 'ibcc_secure_key_1715_hec_portal_prod_2026';
const secretKey = new TextEncoder().encode(JWT_SECRET_STRING);

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    
    // Protect hec-admin routes
    if (path.startsWith('/hec-admin') && !path.startsWith('/hec-admin/login')) {
        const token = request.cookies.get('admin_token')?.value;
        
        let isValid = false;
        if (token) {
            try {
                await jwtVerify(token, secretKey);
                isValid = true;
            } catch (err) {
                isValid = false;
            }
        }

        // Redirect to login if token is missing or forged
        if (!isValid) {
            const redirectRes = NextResponse.redirect(new URL('/hec-admin/login', request.url));
            redirectRes.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
            redirectRes.headers.set('CDN-Cache-Control', 'no-store');
            // Clear invalid cookie
            redirectRes.cookies.delete('admin_token');
            return redirectRes;
        }
    }
    
    // Clean PDF URL routing (removes any "test" from URLs)
    const pdfMatch = path.match(/^\/(DAS_approved_letter_|DAS_revamped_AppForm_)?([^/]+)\.pdf$/i);
    if (pdfMatch) {
        const id = pdfMatch[2];
        const dest = new URL(`/api/pdf/${encodeURIComponent(id)}`, request.url);
        if (request.nextUrl.searchParams.has('download')) {
            dest.searchParams.set('download', request.nextUrl.searchParams.get('download')!);
        }
        return NextResponse.rewrite(dest);
    }

    // Handle redirects requested by client:
    // 1. https://e-verify.pk/ or www.e-verify.pk -> https://hec.e-verify.pk/#/degree-verification/hec-verification-public
    const host = (request.headers.get('host') || '').toLowerCase();
    if (host === 'e-verify.pk' || host === 'www.e-verify.pk') {
        const dest = new URL('https://hec.e-verify.pk/#/degree-verification/hec-verification-public');
        if (request.nextUrl.search) {
            dest.search = request.nextUrl.search;
        }
        return NextResponse.redirect(dest, 301);
    }

    // 2. /site/verification -> /#/degree-verification/hec-verification-public
    if (path === '/site/verification') {
        const dest = new URL('/#/degree-verification/hec-verification-public', request.url);
        if (request.nextUrl.search) {
            dest.search = request.nextUrl.search;
        }
        return NextResponse.redirect(dest, 301);
    }

    const response = NextResponse.next();
    if (path.startsWith('/hec-admin')) {
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
        response.headers.set('CDN-Cache-Control', 'no-store');
    }
    return response;
}

export const config = {
    matcher: ['/hec-admin/:path*', '/:path*.pdf', '/site/verification', '/'],
};

