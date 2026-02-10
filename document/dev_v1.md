# CharmUp Web Demo - Complete Development Roadmap

**Date:** 2026-01-15
**Status:** In Development
**Based on:** idea_v1.md PRD

---

## **Phase 1: Project Foundation** 🏗️

### 1.1 Environment Setup
- **Initialize Next.js 14+ project** with TypeScript and App Router
- **Install core dependencies**: Tailwind CSS, Vercel AI SDK, Shadcn UI
- **Configure Tailwind** with CharmUp gradient theme (Pink/Yellow/Purple)
- **Set up ESLint & Prettier** for code consistency
- **Create `.env.local`** template for API keys
- **Initialize Git repository** and create `.gitignore`

### 1.2 Project Architecture
```
/app
  /(landing)/page.tsx
  /demo/page.tsx
  /feedback/page.tsx
/components
  /avatar/VideoAvatar.tsx
  /scenarios/ScenarioSelector.tsx
  /conversation/VoiceInterface.tsx
  /feedback/Scorecard.tsx
/lib
  /ai/conversation-engine.ts
  /audio/stt-handler.ts
  /audio/tts-handler.ts
  /avatar/heygen-client.ts
/hooks
  /useVoiceRecording.ts
  /useConversation.ts
```

---

## **Phase 2: UI/UX Development** 🎨

### 2.1 Design System
- **Create color palette** variables in Tailwind config (Sunrise Yellow → Lilac gradient)
- **Set up typography** system (sans-serif, readable hierarchy)
- **Build reusable components**: Button, Card, Badge, Modal
- **Implement mobile-first** breakpoints

### 2.2 Core Pages
- **Landing Page** (`app/(landing)/page.tsx`)
  - Hero section with value proposition
  - "Try Demo" CTA button
  - Feature highlights (3-section layout)

- **Scenario Selection** (`app/demo/page.tsx`)
  - 3 preset cards: Job Interview, First Date, Networking Event
  - Custom scenario text input field
  - Clean card-based UI with hover states

- **Simulator Interface** (`app/demo/session/page.tsx`)
  - Central video avatar container (16:9 aspect ratio)
  - Real-time transcript sidebar/overlay
  - Voice recording controls (Push-to-talk or auto-detect)
  - "End Session" button

- **Feedback Page** (`app/feedback/page.tsx`)
  - Communication Scorecard display
  - Emotional Intelligence metrics
  - Actionable advice cards
  - "Try Again" / "Upgrade to Premium" CTAs

### 2.3 Gamification Elements
- **Streak counter** component (top-right corner, "Day X" badge)
- **Progress indicators** for free tier usage ("2/3 conversations this week")

---

## **Phase 3: AI & Voice Integration** 🤖

### 3.1 Voice Processing
- **Speech-to-Text** (`lib/audio/stt-handler.ts`)
  - Integrate OpenAI Whisper API
  - Handle microphone permissions
  - Stream audio chunks for real-time processing
  - Error handling for noisy environments

- **Text-to-Speech** (`lib/audio/tts-handler.ts`)
  - Integrate ElevenLabs API
  - Select natural voice model
  - Audio playback queue management
  - Lip-sync timing (if using HeyGen)

### 3.2 Video Avatar
- **HeyGen Integration** (`lib/avatar/heygen-client.ts`)
  - Create avatar streaming session
  - Handle avatar state (idle, speaking, listening)
  - Fallback: High-quality animated placeholder if API fails
  - Optimize video loading (lazy load, preload critical frames)

### 3.3 Conversation Engine
- **LLM Orchestration** (`lib/ai/conversation-engine.ts`)
  - Use Vercel AI SDK with GPT-4o or Claude 3.5 Sonnet
  - **Persona system prompts** for each scenario:
    - Job Interview: Professional recruiter
    - First Date: Friendly, curious person
    - Networking: Industry professional
  - **Context management**: Track conversation history
  - **Response formatting**: Natural, conversational tone
  - **Session timeout**: Auto-end after inactivity

### 3.4 Feedback Generation
- **Analysis Pipeline** (`lib/ai/feedback-analyzer.ts`)
  - Parse transcript for behavioral markers
  - Calculate metrics:
    - Speech pace (words per minute)
    - Emotional tone analysis
    - Filler word count ("um", "like", etc.)
    - Response latency
  - Generate actionable advice using LLM
  - Format as Communication Scorecard JSON

---

## **Phase 4: Business Logic** 💼

### 4.1 Tiered Access System
- **Free Tier Logic** (`lib/auth/tier-manager.ts`)
  - Session counter (localStorage or database)
  - "3 conversations per week" limit enforcement
  - Reset timer (weekly cron or client-side)

- **Premium Gates**
  - Lock "Detailed Transcripts" with upgrade modal
  - Lock "Advanced Analytics" (personality insights, tone graphs)
  - Display pricing: $10/mo, $60/yr ("Best Value" badge)

### 4.2 Analytics Integration
- **Conversion Tracking**
  - Track "Get Premium" button clicks
  - Session completion rate
  - Scenario popularity
  - Use Vercel Analytics or PostHog

---

## **Phase 5: Performance & Optimization** ⚡

### 5.1 Voice Latency Optimization
- **Target: <2 seconds** voice-to-voice response
  - Use WebSocket for real-time STT streaming
  - Parallel processing: Start TTS generation before avatar animation
  - Edge runtime deployment for Vercel functions
  - CDN caching for avatar video chunks

### 5.2 Code Optimization
- **Lazy loading**: Non-critical components
- **Image optimization**: Next.js Image component
- **Bundle analysis**: Remove unused dependencies
- **API route caching**: Redis or Vercel KV for repeated requests

---

## **Phase 6: Testing & QA** ✅

### 6.1 Functional Testing
- **User flow testing**: Complete happy path end-to-end
- **Voice testing**: Various accents, background noise
- **Avatar testing**: Different network speeds
- **Error scenarios**: API failures, timeout handling

### 6.2 Cross-Platform Testing
- **Mobile browsers**: iOS Safari, Chrome, Android Chrome
- **Desktop browsers**: Chrome, Firefox, Safari, Edge
- **Responsive design**: Test all breakpoints (320px - 1920px)
- **Accessibility**: Keyboard navigation, screen reader support

---

## **Phase 7: Deployment & Production** 🚀

### 7.1 Pre-Deployment Checklist
- [ ] All API keys in Vercel environment variables
- [ ] Rate limiting configured (to prevent abuse)
- [ ] Error logging (Sentry or Vercel Error Tracking)
- [ ] HTTPS enforced
- [ ] CORS policies configured
- [ ] Privacy policy page (GDPR compliance)

### 7.2 Vercel Deployment
1. **Connect GitHub repository** to Vercel
2. **Configure build settings**:
   - Framework: Next.js
   - Build command: `npm run build`
   - Output directory: `.next`
3. **Set environment variables**:
   - `OPENAI_API_KEY`
   - `ELEVENLABS_API_KEY`
   - `HEYGEN_API_KEY`
   - `NEXT_PUBLIC_APP_URL`
4. **Deploy to production**
5. **Configure custom domain** (e.g., demo.charmup.ai)

### 7.3 Post-Launch
- **Monitor performance**: Vercel Analytics dashboard
- **Track errors**: Review logs daily
- **User feedback**: Add feedback form
- **A/B testing**: Test different CTAs for "Get Premium"

---

## **Critical Success Factors**

1. **Voice latency <2s** - Key to "lifelike" experience
2. **Mobile responsiveness** - Primary demo platform
3. **Clear premium value** - Conversion funnel optimization
4. **Reliable avatar** - Fallback if HeyGen fails

---

## **Development Task List**

### Phase 1: Foundation
- [ ] Initialize Next.js project with TypeScript
- [ ] Configure Tailwind CSS with CharmUp theme
- [ ] Set up project folder structure
- [ ] Create environment variables template

### Phase 2: UI/UX
- [ ] Build landing page
- [ ] Create scenario selection interface
- [ ] Design simulator interface layout
- [ ] Build feedback page components

### Phase 3: AI Integration
- [ ] Integrate OpenAI Whisper (STT)
- [ ] Integrate ElevenLabs (TTS)
- [ ] Set up HeyGen avatar
- [ ] Build conversation engine with LLM
- [ ] Create feedback analysis system

### Phase 4: Business Logic
- [ ] Implement free tier limits
- [ ] Create premium upgrade modals
- [ ] Add analytics tracking

### Phase 5: Optimization
- [ ] Optimize voice latency
- [ ] Performance testing and improvements
- [ ] Mobile responsiveness refinement

### Phase 6: Testing
- [ ] End-to-end user flow testing
- [ ] Cross-browser/device testing
- [ ] Accessibility testing

### Phase 7: Deployment
- [ ] Configure Vercel deployment
- [ ] Set up production environment
- [ ] Deploy to production
- [ ] Configure custom domain
- [ ] Post-launch monitoring setup

---

**Next Steps:** Begin Phase 1 - Project Foundation
