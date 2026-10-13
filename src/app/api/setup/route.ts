import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({ error: 'Endpoint disabled for security reasons.' }, { status: 403 });
}

export async function POST() {
    return NextResponse.json({ error: 'Endpoint disabled for security reasons.' }, { status: 403 });
}

