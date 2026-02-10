# HeyGen LiveAvatar Integration Guide

This project now integrates HeyGen's LiveAvatar API for realistic video avatar interactions.

## Features

- **Real-time video avatar**: Display a live, interactive avatar that responds to user input
- **Voice-to-video**: User speaks into microphone, AI responds through the avatar
- **Seamless integration**: Avatar speaks AI-generated responses with lip-sync
- **Fallback support**: Graceful degradation to audio-only if avatar fails

## Setup Instructions

### 1. Install Dependencies

The HeyGen SDK is already installed:
```bash
npm install @heygen/streaming-avatar
```

### 2. Get HeyGen API Key

1. Go to [HeyGen](https://heygen.com) and create an account
2. Navigate to your account settings
3. Go to **Settings > Subscriptions & API > HeyGen API**
4. Generate an API token
5. **Keep this token secure** - never expose it in client-side code

### 3. Configure Environment Variables

Add your HeyGen API key to `.env.local`:

```env
HEYGEN_API_KEY=your_heygen_api_key_here
```

### 4. Customize Avatar and Voice (Optional)

In the following files, you can customize the avatar and voice:

**File**: `src/app/api/heygen/session/route.ts`
```typescript
{
  quality: "high",
  avatar_name: "Wayne_20240711", // Change to your preferred avatar
  voice: {
    voice_id: "1bd001e7e50f421d891986aad5158bc8", // Change to your preferred voice
  },
}
```

**File**: `src/hooks/useHeyGenAvatar.ts`
```typescript
await avatar.createStartAvatar({
  quality: AvatarQuality.High,
  avatarName: "Wayne_20240711", // Change to your preferred avatar
  voice: {
    voiceId: "1bd001e7e50f421d891986aad5158bc8", // Change to your preferred voice
  },
});
```

To find available avatars and voices, check the [HeyGen documentation](https://docs.heygen.com).

## How It Works

### Architecture

1. **Backend Session Creation** (`/api/heygen/session`)
   - Creates a secure streaming session with HeyGen API
   - Returns session token, SDP, and ICE servers

2. **Frontend Avatar Management** (`useHeyGenAvatar` hook)
   - Connects to HeyGen using session token
   - Manages WebRTC stream for video display
   - Handles avatar state (speaking, idle)
   - Provides `speak()` function for text-to-avatar

3. **Conversation Flow** (`useConversation` hook)
   - User speaks → Transcribed via Whisper API
   - Transcript → Sent to GPT for AI response
   - AI response → Avatar speaks via HeyGen
   - Fallback to ElevenLabs TTS if avatar unavailable

4. **Session Interface** (`/demo/session`)
   - Displays video stream in real-time
   - Shows loading/error/connected states
   - Integrates with voice recording

### User Flow

```
User speaks → Microphone → Whisper STT → GPT-4 → HeyGen Avatar (video + audio)
                                            ↓
                                       Transcript displayed
```

## Troubleshooting

### Avatar doesn't connect
- **Check API key**: Ensure `HEYGEN_API_KEY` is correctly set in `.env.local`
- **Check account status**: Verify your HeyGen account has API access
- **Check browser console**: Look for error messages
- **Network issues**: Ensure WebRTC connections are not blocked by firewall

### Video shows but no audio
- **Browser permissions**: Allow audio playback
- **Check video element**: Ensure `autoPlay` and `playsInline` attributes are set

### Avatar speaks but video freezes
- **Network bandwidth**: HeyGen requires stable, high-bandwidth connection
- **Quality settings**: Try reducing quality in avatar configuration

## API Usage Limits

HeyGen API has usage limits based on your subscription:
- Free tier: Limited sessions
- Paid tiers: Higher limits

Monitor your usage in the HeyGen dashboard.

## Development Notes

### File Structure
```
src/
├── app/api/heygen/
│   └── session/route.ts          # Backend: Create HeyGen session
├── hooks/
│   ├── useHeyGenAvatar.ts        # Manage avatar connection
│   └── useConversation.ts        # Handle voice → AI → avatar flow
└── app/demo/session/page.tsx     # UI: Display avatar + controls
```

### Key Events
- `STREAM_READY`: Video stream is ready to display
- `AVATAR_START_TALKING`: Avatar begins speaking
- `AVATAR_STOP_TALKING`: Avatar finishes speaking
- `STREAM_DISCONNECTED`: Connection lost

## Resources

- [HeyGen Documentation](https://docs.heygen.com)
- [Streaming Avatar SDK Reference](https://docs.heygen.com/docs/streaming-avatar-sdk-reference)
- [HeyGen API Quick Start](https://docs.heygen.com/docs/quick-start)

## Future Enhancements

- [ ] Voice chat mode (continuous conversation without push-to-talk)
- [ ] Multiple avatar selection UI
- [ ] Voice selection UI
- [ ] Connection quality indicator
- [ ] Automatic reconnection on disconnect
