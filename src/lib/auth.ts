import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

export const AUTH_COOKIE_NAME = 'hec_admin_token';
const SECRET = process.env.JWT_SECRET || 'hec_secure_key_9843_portal_prod_2026';

export async function hashPassword(password: string) {
    return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
}

export function signToken(payload: object) {
    return jwt.sign(payload, SECRET, { expiresIn: '8h' });
}

export function verifyToken(token: string): any {
    try {
        return jwt.verify(token, SECRET);
    } catch (error) {
        return null;
    }
}

export function sign2FATempToken(payload: { id: number; username: string }) {
    return jwt.sign({ ...payload, is2FAPending: true }, SECRET, { expiresIn: '5m' });
}

export function verify2FATempToken(token: string): { id: number; username: string; is2FAPending?: boolean } | null {
    try {
        const decoded = jwt.verify(token, SECRET) as any;
        if (!decoded || !decoded.is2FAPending) return null;
        return decoded;
    } catch {
        return null;
    }
}

/**
 * Validates admin authentication from NextRequest cookies or Authorization header.
 * Returns decoded payload if valid, or null if unauthorized.
 */
export function getAuthenticatedAdmin(req: NextRequest | Request): any {
    try {
        let token: string | undefined;

        if ('cookies' in req && typeof req.cookies?.get === 'function') {
            token = req.cookies.get(AUTH_COOKIE_NAME)?.value || req.cookies.get('admin_token')?.value;
        }

        if (!token) {
            const authHeader = req.headers.get('authorization') || req.headers.get('cookie') || '';
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            } else if (authHeader.includes(`${AUTH_COOKIE_NAME}=`)) {
                const match = authHeader.match(new RegExp(`${AUTH_COOKIE_NAME}=([^;]+)`));
                if (match) token = match[1];
            } else if (authHeader.includes('admin_token=')) {
                const match = authHeader.match(/admin_token=([^;]+)/);
                if (match) token = match[1];
            }
        }

        if (!token) return null;
        return verifyToken(token);
    } catch {
        return null;
    }
}

/**
 * Reusable guard for admin API routes.
 * If unauthorized, returns a 401 NextResponse. If authorized, returns null.
 */
export function requireAdminAuth(req: NextRequest | Request): NextResponse | null {
    const admin = getAuthenticatedAdmin(req);
    if (!admin) {
        return NextResponse.json(
            { success: false, message: 'Unauthorized access. Authentication required.' },
            { status: 401 }
        );
    }
    return null;
}

