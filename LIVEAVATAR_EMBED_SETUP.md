# LiveAvatar Embed Setup Guide

This guide explains how to set up the LiveAvatar embedded chatbot for your demo.

## Why Use Embed Instead of Streaming API?

For demo purposes, the **Embed option** is recommended because:
- ✅ **No API complexity** - Just one line of HTML code
- ✅ **Works with trial credits** - Uses your 10 trial credits
- ✅ **No authentication issues** - No need for special API permissions
- ✅ **Faster setup** - Get started immediately
- ✅ **Built-in UI** - Avatar interface is ready to use

The Streaming API requires Team/Enterprise subscription, while Embed works with trial accounts.

## How to Get Your Own Embed ID

### Step 1: Go to LiveAvatar Dashboard
Visit: [https://app.liveavatar.com/embed](https://app.liveavatar.com/embed)

### Step 2: Create or Select an Avatar
1. If you haven't created an avatar yet, create a new one
2. Configure the avatar's:
   - **Appearance** (choose from available avatars)
   - **Voice** (select voice model)
   - **Personality/Prompt** (optional: customize the avatar's behavior)

### Step 3: Get the Embed Code
1. Navigate to the "Embed" section
2. You'll see code like this:
   ```html
   <iframe
     src="https://embed.liveavatar.com/v1/YOUR-EMBED-ID-HERE"
     allow="microphone"
     title="LiveAvatar Embed"
     style="aspect-ratio: 16/9;">
   </iframe>
   ```
3. Copy the **Embed ID** (the UUID after `/v1/`)
   - Example: `898a22ef-90c8-4bc1-8a0f-360a13fdab6c`

### Step 4: Update Environment Variables
Edit `.env.local` and replace the embed ID:

```env
NEXT_PUBLIC_LIVEAVATAR_EMBED_ID=your-embed-id-here
```

### Step 5: Restart Development Server
```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

## Testing Your Setup

1. Navigate to `http://localhost:3000`
2. Click "Try Demo"
3. Select a scenario (e.g., "Job Interview")
4. Click "Start Practice"
5. You should see the LiveAvatar embed load
6. Click the microphone button in the avatar window to start talking

## Customizing the Avatar

You can customize your embedded avatar in the LiveAvatar dashboard:

### Avatar Appearance
- Choose from pre-built avatars
- Customize clothing, background, etc.

### Voice Settings
- Select voice model
- Adjust speech speed
- Set language/accent

### Conversation Settings
- **System Prompt**: Define the avatar's personality and behavior
- **Knowledge Base**: Add custom information for the avatar to reference
- **Response Style**: Adjust formality, tone, etc.

### Example System Prompts for Different Scenarios

**For Job Interview Practice:**
```
You are an experienced HR recruiter conducting a job interview.
Ask relevant questions about the candidate's experience, skills,
and career goals. Be professional but friendly. Provide constructive
feedback when appropriate.
```

**For First Date Practice:**
```
You are on a first date at a nice restaurant. Be friendly, curious,
and engaging. Ask about interests, hobbies, and life experiences.
Show genuine interest and maintain a light, fun conversation.
```

**For Networking Practice:**
```
You are a professional at a networking event. You work in [industry].
Be interested in learning about others' work, share insights about
your field, and help build meaningful professional connections.
```

## Credits and Usage

- **Trial Account**: 10 credits (each conversation session uses credits)
- **Credit Usage**: Monitor your usage in the dashboard
- **Upgrade**: If you need more credits, upgrade your subscription

## Troubleshooting

### Issue: Avatar doesn't load
**Solution**:
- Check that the Embed ID is correct
- Ensure you're logged into LiveAvatar
- Verify your trial credits haven't expired

### Issue: Microphone not working
**Solution**:
- Allow microphone permissions in your browser
- Check browser console for permission errors
- Try a different browser (Chrome/Edge recommended)

### Issue: Avatar not responding
**Solution**:
- Check your credits balance
- Verify the avatar is properly configured in the dashboard
- Check network connection

## Advantages of This Approach

### For Demo/MVP:
- ✅ Quick to implement
- ✅ No backend API integration needed
- ✅ Works immediately with trial account
- ✅ Professional-looking interface included

### Limitations:
- ❌ Less customization of the UI
- ❌ Can't intercept conversation for transcripts
- ❌ Limited programmatic control

## Future Migration to Streaming API

If you later need more control (transcripts, custom UI, programmatic access), you can migrate to the Streaming API:

1. Upgrade to Team/Enterprise subscription
2. Use the Streaming API code we prepared (in `/src/hooks/useHeyGenAvatar.ts`)
3. Replace the iframe with custom video integration

The backend API routes are already prepared for when you're ready to upgrade.

## Resources

- [LiveAvatar Documentation](https://docs.liveavatar.com)
- [LiveAvatar Dashboard](https://app.liveavatar.com)
- [Embed Documentation](https://docs.liveavatar.com/docs/embed)
- [Credits & Subscriptions](https://docs.liveavatar.com/docs/credits-and-subscriptions)

## Support

If you encounter issues:
- Check the [FAQ](https://help.heygen.com/en/articles/12758866-liveavatar-faq)
- Contact support: support@heygen.com
- Join the [HeyGen Community](https://community.heygen.com)
