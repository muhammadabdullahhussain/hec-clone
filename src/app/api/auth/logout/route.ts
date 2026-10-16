import { NextResponse } from 'next/server';

export async function POST() {
    // Destroy the JWT cookie to log the user out
    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    const clearOpts = { 
        httpOnly: true, 
        expires: new Date(0), // Expire immediately
        path: '/' 
    };
    response.cookies.set('hec_admin_token', '', clearOpts);
    response.cookies.set('admin_token', '', clearOpts);
    return response;
}
