# HeyGen Integration Testing Guide

## Pre-Testing Checklist

Before testing the HeyGen integration, ensure:

1. ✅ HeyGen SDK installed (`@heygen/streaming-avatar`)
2. ✅ Environment variable `HEYGEN_API_KEY` is set in `.env.local`
3. ✅ HeyGen account has active subscription with API access
4. ✅ Browser supports WebRTC (Chrome, Firefox, Safari, Edge)
5. ✅ Microphone permissions granted

## Testing Steps

### 1. Start Development Server

```bash
npm run dev
```

Navigate to `http://localhost:3000`

### 2. Navigate to Demo

1. Click "Try Demo" or go to `/demo`
2. Select any scenario (e.g., "Job Interview")
3. Click "Start Practice"

### 3. Test Avatar Connection

**Expected behavior:**
- Loading screen appears with "Connecting to avatar..."
- Video stream loads showing the avatar
- Status indicator shows "Idle" (blue)

**If connection fails:**
- Error message appears with details
- "Retry Connection" button is available
- Check browser console for detailed error messages

### 4. Test Voice Interaction

1. Click "Push to Talk" button
2. Speak into microphone (e.g., "Hello, how are you?")
3. Click "Stop Recording"

**Expected behavior:**
- Status changes to "Listening" (yellow) while recording
- After stopping, status changes to "Speaking" (green)
- Avatar video plays with synchronized lip movement
- AI response appears in transcript
- Status returns to "Idle" when complete

### 5. Test Transcript

**Expected behavior:**
- User message appears on the right (blue background)
- AI response appears on the left (purple background)
- Both labeled with "You" and "AI"

### 6. Test Session End

1. Click "End Session"
2. Should redirect to `/feedback` page

## Common Issues & Solutions

### Issue: "Avatar Connection Failed"

**Possible causes:**
1. Invalid or missing `HEYGEN_API_KEY`
   - Solution: Check `.env.local` file
2. API quota exceeded
   - Solution: Check HeyGen dashboard for usage
3. Network/firewall blocking WebRTC
   - Solution: Test on different network

### Issue: Avatar connects but doesn't speak

**Possible causes:**
1. Browser autoplay policy
   - Solution: User interaction required before video plays
2. Audio permissions
   - Solution: Check browser audio settings

### Issue: Avatar speaks but video is laggy

**Possible causes:**
1. Slow internet connection
   - Solution: Reduce quality in avatar config
2. High CPU usage
   - Solution: Close other applications

## Testing Checklist

- [ ] Avatar connects successfully
- [ ] Video stream displays correctly
- [ ] Voice recording works
- [ ] Audio transcription works
- [ ] AI generates response
- [ ] Avatar speaks with lip-sync
- [ ] Transcript updates correctly
- [ ] Session can be ended
- [ ] Error handling works (disconnect internet to test)
- [ ] Reconnection works

## Browser Console Debugging

Open browser console (F12) to see detailed logs:

```
✅ Avatar session started successfully
✅ Stream ready
✅ AI Response received: [response text]
✅ Transcript updated with AI response
Using HeyGen avatar to speak
Avatar started talking
Avatar stopped talking
```

## API Endpoint Testing

Test the backend session creation:

```bash
curl -X POST http://localhost:3000/api/heygen/session
```

**Expected response:**
```json
{
  "data": {
    "session_id": "...",
    "access_token": "...",
    "sdp": {...},
    "ice_servers2": [...]
  }
}
```

## Performance Metrics

Monitor these metrics during testing:

- **Avatar connection time**: Should be < 5 seconds
- **Voice-to-response latency**: Should be < 3-5 seconds
  - Transcription: ~1-2 seconds
  - AI generation: ~1-2 seconds
  - Avatar speech: Immediate
- **Video quality**: Should be smooth at 30fps

## Next Steps After Testing

If all tests pass:
1. Consider customizing avatar and voice
2. Implement continuous voice chat mode
3. Add avatar selection UI
4. Deploy to production

If tests fail:
1. Check error messages in console
2. Verify API credentials
3. Test network connectivity
4. Review HeyGen documentation
5. Contact HeyGen support if needed
