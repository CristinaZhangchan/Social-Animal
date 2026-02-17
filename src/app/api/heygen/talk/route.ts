import { NextRequest, NextResponse } from 'next/server';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

/**
 * POST /api/heygen/talk
 * Generate a talking video using HeyGen's v2 video generation API.
 * 
 * Body: { 
 *   avatar_id: string,       // HeyGen avatar ID
 *   text: string,            // Text for the avatar to speak
 *   voice_id?: string,       // Voice ID (optional)
 *   talking_photo_url?: string, // Custom photo URL (for talking photo mode)
 * }
 * Returns: { data: { video_id: string } }
 */
export async function POST(request: NextRequest) {
    if (!HEYGEN_API_KEY) {
        return NextResponse.json(
            { error: 'HeyGen API key is not configured' },
            { status: 500 }
        );
    }

    try {
        const body = await request.json();
        const { avatar_id, text, voice_id, talking_photo_url } = body;

        if (!text) {
            return NextResponse.json(
                { error: 'text is required' },
                { status: 400 }
            );
        }

        // Build the character config based on whether we have a custom photo or a HeyGen avatar
        let character: any;

        if (talking_photo_url) {
            // Custom photo mode: upload first, then use as talking photo
            console.log('[HeyGen Talk] Using custom photo URL');

            // First upload the photo to HeyGen
            const imgRes = await fetch(talking_photo_url);
            if (!imgRes.ok) {
                return NextResponse.json({ error: 'Failed to fetch custom photo' }, { status: 400 });
            }
            const blob = await imgRes.blob();
            const formData = new FormData();
            formData.append('file', blob, 'avatar.jpg');

            const uploadRes = await fetch('https://upload.heygen.com/v1/asset', {
                method: 'POST',
                headers: { 'X-Api-Key': HEYGEN_API_KEY },
                body: formData,
            });

            if (!uploadRes.ok) {
                const uploadErr = await uploadRes.json().catch(() => ({}));
                console.error('[HeyGen Talk] Upload failed:', uploadErr);
                return NextResponse.json({ error: 'Failed to upload photo', details: uploadErr }, { status: 500 });
            }

            const uploadData = await uploadRes.json();
            const imageUrl = uploadData?.data?.url || uploadData?.data?.image_key;
            console.log('[HeyGen Talk] Uploaded photo, got:', imageUrl);

            // Use talking_photo type with the uploaded URL
            character = {
                type: 'talking_photo',
                talking_photo_url: imageUrl,
            };
        } else if (avatar_id) {
            // Standard HeyGen avatar
            character = {
                type: 'avatar',
                avatar_id: avatar_id,
                avatar_style: 'normal',
            };
        } else {
            return NextResponse.json(
                { error: 'Either avatar_id or talking_photo_url is required' },
                { status: 400 }
            );
        }

        const videoInput: any = {
            character,
            voice: {
                type: 'text',
                input_text: text,
                voice_id: voice_id || '1bd001e7e50f421d891986aad5571870',
                speed: 1.0,
            },
        };

        console.log('[HeyGen Talk] Generating video with character type:', character.type);

        const response = await fetch('https://api.heygen.com/v2/video/generate', {
            method: 'POST',
            headers: {
                'X-Api-Key': HEYGEN_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                video_inputs: [videoInput],
                dimension: {
                    width: 512,
                    height: 512,
                },
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('[HeyGen Talk] Error:', response.status, data);
            return NextResponse.json(
                { error: 'Failed to generate video', details: data },
                { status: response.status }
            );
        }

        console.log('[HeyGen Talk] Video generation started:', data);
        return NextResponse.json(data);
    } catch (error) {
        console.error('[HeyGen Talk] Server error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
