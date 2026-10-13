import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken, verifyPassword, hashPassword } from '@/lib/auth';



export async function PUT(request: Request) {
    try {
        const token = cookies().get('admin_token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded: any = verifyToken(token);
        if (!decoded || !decoded.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { currentPassword, newPassword } = await request.json();

        // Find Admin
        const admin = await prisma.admin.findUnique({ where: { id: decoded.id } });
        if (!admin) return NextResponse.json({ error: 'Admin not found' }, { status: 404 });

        // Verify Current Password
        const isMatch = await verifyPassword(currentPassword, admin.password_hash);
        if (!isMatch) return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });

        // Hash and Update New Password
        const hashedNewPassword = await hashPassword(newPassword);
        await prisma.admin.update({
            where: { id: admin.id },
            data: { password_hash: hashedNewPassword }
        });

        return NextResponse.json({ success: true, message: 'Password updated successfully' });

    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
    }
}
