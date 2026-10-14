import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signToken, hashPassword, sign2FATempToken } from '@/lib/auth';
import { checkRateLimit, getClientIp, sanitizeString } from '@/lib/security';

export async function POST(request: Request) {
    try {
        const clientIp = getClientIp(request);

        // Brute force protection: Max 5 attempts per 10 minutes per IP
        const rateCheck = checkRateLimit(`login_${clientIp}`, 5, 10 * 60);
        if (!rateCheck.allowed) {
            return NextResponse.json(
                { error: `Too many failed login attempts. Please wait ${rateCheck.resetInSec} seconds before trying again.` },
                { status: 429 }
            );
        }

        const body = await request.json();
        const username = sanitizeString(body.username, 50);
        const password = typeof body.password === 'string' ? body.password : '';

        if (!username || !password) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
        }

        // 1. Auto-seed if database is completely empty
        const adminCount = await prisma.admin.count();
        if (adminCount === 0) {
            const hashedPwd = await hashPassword('1715');
            await prisma.admin.create({
                data: {
                    username: 'admin',
                    password_hash: hashedPwd
                }
            });
        }

        // 2. Find Admin
        const admin = await prisma.admin.findUnique({ where: { username } });
        if (!admin) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // 3. Verify Password
        const isValid = await verifyPassword(password, admin.password_hash);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // 4. Check if Two-Factor Authentication is enabled
        if (admin.twoFactorEnabled && admin.twoFactorSecret) {
            const tempToken = sign2FATempToken({ id: admin.id, username: admin.username });
            return NextResponse.json({
                requires2FA: true,
                tempToken,
                message: 'Two-Factor Authentication required'
            });
        }

        // 5. Generate Standard JWT Token
        const token = signToken({ id: admin.id, username: admin.username });

        // 6. Set Secure HTTP-Only Cookie
        const response = NextResponse.json({ success: true, message: 'Logged in successfully' });
        response.cookies.set('admin_token', token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict',
            path: '/',
            maxAge: 8 * 60 * 60 // 8 hours
        });

        return response;

    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json({ error: 'System error during login' }, { status: 500 });
    }
}

