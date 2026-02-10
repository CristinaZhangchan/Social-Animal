# CharmUp Web Demo

![CharmUp Banner](https://via.placeholder.com/1200x300/FFE66D/6B46C1?text=CharmUp+-+Improve+Your+Social+Skills)

An AI-powered platform to help users improve their social skills through realistic conversations with AI avatars. Built with Next.js, OpenAI, and modern web technologies.

## Features

- **Interactive AI Conversations**: Practice social skills with lifelike AI avatars
- **Multiple Scenarios**: Job interviews, first dates, networking events, and custom scenarios
- **Real-time Feedback**: Get instant analysis of your communication skills
- **Voice Integration**: Speech-to-text and text-to-speech powered by OpenAI
- **Tiered Access**: Free tier with 3 conversations/week, premium plans for unlimited access
- **Mobile-First Design**: Beautiful, responsive UI with CharmUp gradient branding

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI/LLM**: OpenAI GPT-4o
- **Voice**: OpenAI Whisper (STT) & OpenAI TTS
- **Deployment**: Vercel (recommended)

## Project Structure

```
charmupai/
├── src/
│   ├── app/
│   │   ├── (landing)/          # Landing page
│   │   ├── demo/               # Scenario selection
│   │   │   └── session/        # Conversation simulator
│   │   ├── feedback/           # Post-session analysis
│   │   └── api/                # Backend API routes
│   │       ├── chat/           # LLM conversation endpoint
│   │       ├── transcribe/     # Speech-to-text
│   │       ├── speak/          # Text-to-speech
│   │       └── analyze/        # Conversation analysis
│   ├── components/             # React components
│   ├── hooks/                  # Custom React hooks
│   │   ├── useVoiceRecording.ts
│   │   └── useConversation.ts
│   └── lib/                    # Utility functions
│       ├── ai/                 # AI-related utilities
│       ├── audio/              # Audio processing
│       ├── avatar/             # Avatar integration
│       └── auth/               # Tier management
├── document/                   # Project documentation
│   ├── idea_v1.md             # Product requirements
│   └── dev_v1.md              # Development roadmap
└── public/                     # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key (required)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd charmupai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your API keys:
   ```env
   # Required
   OPENAI_API_KEY=sk-...

   # Optional (for advanced features)
   ELEVENLABS_API_KEY=...
   HEYGEN_API_KEY=...

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Keys Setup

### OpenAI API Key (Required)

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new secret key
5. Copy and paste into `.env.local`

**Note**: Ensure your OpenAI account has:
- GPT-4o access (for conversation)
- Whisper API access (for speech-to-text)
- TTS API access (for text-to-speech)

### Optional: ElevenLabs (Enhanced TTS)

For more natural voice synthesis:
1. Visit [ElevenLabs](https://elevenlabs.io/)
2. Get your API key
3. Update the TTS implementation in `src/app/api/speak/route.ts`

### Optional: HeyGen (Video Avatar)

For realistic video avatars:
1. Visit [HeyGen](https://www.heygen.com/)
2. Get API credentials
3. Implement in `src/lib/avatar/heygen-client.ts`

## Development

### Key Files to Understand

1. **`src/app/page.tsx`** - Landing page
2. **`src/app/demo/page.tsx`** - Scenario selection with tier checking
3. **`src/app/demo/session/page.tsx`** - Main conversation interface
4. **`src/app/feedback/page.tsx`** - Post-session feedback display
5. **`src/app/api/chat/route.ts`** - LLM conversation handler
6. **`src/hooks/useConversation.ts`** - Conversation orchestration logic

### Customizing Scenarios

Edit `SCENARIO_PROMPTS` in `src/app/api/chat/route.ts`:

```typescript
const SCENARIO_PROMPTS = {
  "my-scenario": `You are a [persona description]...`,
};
```

Then add to the preset scenarios in `src/app/demo/page.tsx`.

### Modifying Tier Limits

Edit `src/lib/auth/tier-manager.ts`:

```typescript
const FREE_TIER_LIMIT = 3; // Change this number
```

## Deployment

### Deploy to Vercel (Recommended)

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo>
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com/)
   - Click "New Project"
   - Import your GitHub repository
   - Configure build settings (auto-detected for Next.js)

3. **Add Environment Variables**

   In Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.local`:
     - `OPENAI_API_KEY`
     - `NEXT_PUBLIC_APP_URL` (set to your production domain)

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Your app will be live at `<project-name>.vercel.app`

5. **Custom Domain (Optional)**
   - Go to Project Settings → Domains
   - Add your custom domain (e.g., `demo.charmup.ai`)
   - Follow DNS configuration instructions

### Alternative: Deploy to Other Platforms

#### Netlify

```bash
npm run build
```
- Connect GitHub repo to Netlify
- Set build command: `npm run build`
- Set publish directory: `.next`
- Add environment variables

#### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## Testing

### Manual Testing Checklist

- [ ] Landing page loads correctly
- [ ] All 3 preset scenarios are clickable
- [ ] Custom scenario input works
- [ ] Voice recording starts/stops
- [ ] Transcript updates in real-time
- [ ] AI responds to user input
- [ ] TTS plays AI response
- [ ] Session can be ended
- [ ] Feedback page displays analysis
- [ ] Free tier limit is enforced
- [ ] Premium modal appears at limit
- [ ] Mobile responsive design works

### Voice Testing Tips

- Grant microphone permissions when prompted
- Speak clearly and wait for processing
- Check browser console for errors
- Test on both Chrome and Safari (different audio APIs)

## Performance Optimization

### Target Metrics

- **Voice Latency**: <2 seconds (critical)
- **Page Load**: <3 seconds
- **First Contentful Paint**: <1.5 seconds

### Optimization Strategies

1. **Edge Functions**: API routes run on Vercel Edge Runtime
2. **Streaming**: Chat responses use streaming for faster perceived performance
3. **Lazy Loading**: Non-critical components load on demand
4. **Image Optimization**: Use Next.js Image component
5. **Bundle Analysis**: Run `npm run build` and check bundle size

## Troubleshooting

### Common Issues

**Issue**: "Microphone not working"
- **Solution**: Check browser permissions, use HTTPS in production

**Issue**: "API rate limit exceeded"
- **Solution**: Implement rate limiting or upgrade OpenAI plan

**Issue**: "Voice latency too high"
- **Solution**: Ensure Vercel functions are deployed to nearest region, consider using streaming STT

**Issue**: "Build fails on Vercel"
- **Solution**: Check environment variables are set, ensure Node version is 18+

## Future Enhancements

- [ ] HeyGen video avatar integration
- [ ] Advanced analytics (tone graphs, personality insights)
- [ ] User authentication (Firebase/Auth0)
- [ ] Database integration (Supabase/PostgreSQL)
- [ ] Payment processing (Stripe)
- [ ] Progress tracking and history
- [ ] Social sharing features
- [ ] Multi-language support

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software for CharmUp. All rights reserved.

## Support

For questions or issues:
- Email: support@charmup.ai
- GitHub Issues: [Create an issue](https://github.com/your-org/charmupai/issues)

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [OpenAI](https://openai.com/)
- UI inspired by Nordic design principles
- Special thanks to the CharmUp team

---

**Made with ❤️ by the CharmUp Team**
