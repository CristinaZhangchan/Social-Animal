import { NextRequest, NextResponse } from 'next/server';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

/**
 * GET /api/heygen/video-status?id=xxx
 * Check the status of a HeyGen video generation job.
 * Returns: { status: string, video_url?: string }
 */
export async function GET(request: NextRequest) {
    if (!HEYGEN_API_KEY) {
        return NextResponse.json(
            { error: 'HeyGen API key is not configured' },
            { status: 500 }
        );
    }

    const videoId = request.nextUrl.searchParams.get('id');
    if (!videoId) {
        return NextResponse.json(
            { error: 'Video ID is required' },
            { status: 400 }
        );
    }

    try {
        const response = await fetch(
            `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`,
            {
                method: 'GET',
                headers: {
                    'X-Api-Key': HEYGEN_API_KEY,
                },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error('[HeyGen Status] Error:', response.status, data);
            return NextResponse.json(
                { error: 'Failed to check video status', details: data },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('[HeyGen Status] Server error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
