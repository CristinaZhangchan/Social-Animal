import { NextResponse } from 'next/server';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

export async function GET() {
    if (!HEYGEN_API_KEY) {
        return NextResponse.json(
            { error: 'HeyGen API key is not configured' },
            { status: 500 }
        );
    }

    try {
        const response = await fetch('https://api.heygen.com/v2/avatars', {
            method: 'GET',
            headers: {
                'X-Api-Key': HEYGEN_API_KEY,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('HeyGen API Error:', errorData);
            return NextResponse.json(
                { error: 'Failed to fetch avatars from HeyGen', details: errorData },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('SERVER ERROR fetching HeyGen avatars:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
