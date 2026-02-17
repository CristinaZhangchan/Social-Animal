import { NextResponse } from 'next/server';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

export async function POST() {
    if (!HEYGEN_API_KEY) {
        return NextResponse.json(
            { error: 'HeyGen API key is not configured' },
            { status: 500 }
        );
    }

    try {
        const response = await fetch('https://api.heygen.com/v1/streaming.create_token', {
            method: 'POST',
            headers: {
                'X-Api-Key': HEYGEN_API_KEY,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('HeyGen Token Error Status:', response.status);
            console.error('HeyGen Token Error Body:', data);
            return NextResponse.json(
                { error: 'Failed to generate HeyGen token', details: data },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('SERVER ERROR fetching HeyGen token:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
