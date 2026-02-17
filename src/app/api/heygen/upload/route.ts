import { NextResponse } from 'next/server';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

/**
 * POST /api/heygen/upload
 * Uploads an image to HeyGen to create a Talking Photo.
 * 
 * Flow:
 * 1. Fetch image from URL (or accept base64)
 * 2. Upload to HeyGen's asset upload API
 * 3. Return the image_key for use with video generation
 */
export async function POST(req: Request) {
    if (!HEYGEN_API_KEY) {
        return NextResponse.json({ error: 'HeyGen API Key missing' }, { status: 500 });
    }

    try {
        const { url } = await req.json();
        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        console.log('[HeyGen Upload] Fetching image from:', url.substring(0, 80) + '...');

        // Step 1: Fetch the image
        const imgRes = await fetch(url);
        if (!imgRes.ok) {
            return NextResponse.json({ error: 'Failed to fetch image from URL' }, { status: 400 });
        }
        const blob = await imgRes.blob();

        // Step 2: Upload to HeyGen Asset Upload API
        const formData = new FormData();
        formData.append('file', blob, 'avatar.jpg');

        const uploadRes = await fetch('https://upload.heygen.com/v1/asset', {
            method: 'POST',
            headers: {
                'X-Api-Key': HEYGEN_API_KEY,
            },
            body: formData,
        });

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
            console.error('[HeyGen Upload] Asset upload failed:', uploadRes.status, uploadData);
            return NextResponse.json(
                { error: 'Failed to upload image to HeyGen', details: uploadData },
                { status: uploadRes.status }
            );
        }

        console.log('[HeyGen Upload] Asset uploaded:', uploadData);

        // The upload should return an image_key/url that can be used with video generation
        // Return the full response so the client can extract what it needs
        return NextResponse.json({
            data: {
                image_key: uploadData.data?.image_key || uploadData.data?.url || uploadData.data?.id,
                ...uploadData.data,
            }
        });

    } catch (error) {
        console.error('[HeyGen Upload] Server Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
