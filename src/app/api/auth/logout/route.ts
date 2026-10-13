import { NextResponse } from 'next/server';

export async function POST() {
    // Destroy the JWT cookie to log the user out
    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    response.cookies.set('admin_token', '', { 
        httpOnly: true, 
        expires: new Date(0), // Expire immediately
        path: '/' 
    });
    return response;
}
