# SocialAnimal v1.2 Upgrade Documentation

## Overview

This document describes the upgrade from CharmUpAI to SocialAnimal v1.2, implementing a dark sci-fi themed interface with enhanced features including user-led conversations, prompt polishing, rhythm analysis, and user camera feed.

## Changes Summary

### 1. Branding & Theme

- **Brand Name**: CharmUp → SocialAnimal
- **Color Scheme**: Bright gradients → Dark sci-fi theme
  - Primary background: `#0a0a0f`
  - Accent colors: Cyan (`#00d4ff`), Purple (`#a855f7`)
- **Visual Style**: Chamfered rectangles (Iron Man HUD style), neon glow effects, grid patterns

### 2. UI/UX Changes

#### Landing Page (`src/app/page.tsx`)
- Dark background with grid pattern
- Neon accent colors
- Feature cards with numbered indicators
- Removed emojis, replaced with tech-styled elements

#### Scenario Selection (`src/app/demo/page.tsx`)
- **Removed**: 3 preset scenario cards
- **Added**: Single custom scenario input with placeholder
- Example scenarios provided as clickable chips
- Sci-fi styled input with cyan glow border

#### Session Page (`src/app/demo/session/page.tsx`)
- **Removed**: 4 control buttons (Interrupt, Listen, Stop Listen, End)
- **Added**: User camera feed component (lower-right corner)
- **Added**: Prompt polishing before session start
- Avatar starts silently (user-led conversation)
- HUD-style corner decorations
- Speaking indicators with neon styling

#### Feedback Page (`src/app/feedback/page.tsx`)
- Dark sci-fi theme
- **Added**: Rhythm metrics display
  - Interruption count
  - Average response latency
- Conditional feedback messages based on thresholds

### 3. Backend APIs

#### New: Prompt Polish API (`src/app/api/prompt-polish/route.ts`)
```typescript
POST /api/prompt-polish
Input: { userInput: string }
Output: { persona, knowledge, instructions, combinedPrompt }
```
Uses GPT-4o-mini to expand user's simple scenario into structured avatar configuration.

#### Updated: Context API (`src/app/api/liveavatar/context/route.ts`)
- Session naming: `socialanimal-{name}-{timestamp}`
- `opening_text` defaults to empty string for silent avatar start

#### Updated: Analyze API (`src/app/api/analyze/route.ts`)
- Accepts `speakEvents` array for rhythm analysis
- Calculates interruption count and response latency
- Returns `rhythmMetrics` object with feedback

### 4. Frontend Components

#### New: UserCameraFeed (`src/components/UserCameraFeed.tsx`)
- Position: Fixed lower-right corner
- Size: 240x180px (desktop), 25-30% width (mobile)
- Style: Chamfered rectangle with cyan neon border
- Features:
  - VAD-triggered border highlight animation
  - Local-only stream (no server upload)
  - Graceful error handling for permission denial

#### Updated: useLiveAvatar Hook (`src/hooks/useLiveAvatar.ts`)
- **Added**: `speakEvents` state for timestamp tracking
- **Added**: `getSpeakTimestamps()` helper function
- Records all speak_started/speak_ended events with timestamps

### 5. Configuration

#### Tailwind Config (`tailwind.config.ts`)
New color tokens:
```typescript
sa: {
  bg: { primary, secondary, tertiary },
  accent: { cyan, purple, magenta },
  text: { primary, secondary, muted }
}
```

New utilities:
- `shadow-neon-cyan`, `shadow-neon-purple`
- `animation-pulse-glow`, `animation-border-glow`

#### Global CSS (`src/app/globals.css`)
New component classes:
- `.clip-chamfer`, `.clip-chamfer-lg` - Chamfered rectangle shapes
- `.border-neon-cyan`, `.border-neon-purple` - Neon border effects
- `.text-glow-cyan`, `.text-glow-purple` - Glowing text
- `.bg-grid` - Grid background pattern
- `.speaking-pulse` - Speaking indicator animation

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `tailwind.config.ts` | Modified | New color system, animations |
| `src/app/globals.css` | Modified | Dark theme, HUD components |
| `src/app/layout.tsx` | Modified | Metadata, dark class |
| `src/app/page.tsx` | Modified | Landing page redesign |
| `src/app/demo/page.tsx` | Rewritten | Single custom input |
| `src/app/demo/session/page.tsx` | Refactored | Remove buttons, add camera |
| `src/app/feedback/page.tsx` | Modified | Rhythm metrics display |
| `src/app/api/prompt-polish/route.ts` | **New** | Prompt polisher |
| `src/app/api/liveavatar/context/route.ts` | Modified | Silent start |
| `src/app/api/analyze/route.ts` | Modified | Rhythm analysis |
| `src/hooks/useLiveAvatar.ts` | Modified | Timestamp tracking |
| `src/components/UserCameraFeed.tsx` | **New** | User camera component |

## Verification Checklist

### UI Checks
- [x] No "Start/Interrupt/Listen" control buttons visible
- [x] Dark sci-fi theme with neon accents
- [x] User camera displays in lower-right corner
- [x] Speaking indicator highlights camera border

### Flow Checks
- [x] User enters custom scenario → Prompt is polished → Session starts
- [x] Avatar appears and waits silently (no opening speech)
- [x] User speaks first, avatar responds
- [x] Session ends → Feedback shows rhythm metrics

### API Checks
- [x] POST /api/prompt-polish returns structured JSON
- [x] POST /api/liveavatar/context has empty opening_text
- [x] POST /api/analyze returns rhythmMetrics

## Running the Application

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Production build
npm run build
npm start
```

## Environment Variables

```env
# Required
OPENAI_API_KEY=sk-...
LIVEAVATAR_API_KEY=...

# Optional (for sandbox/development)
LIVEAVATAR_SANDBOX_MODE=true
LIVEAVATAR_SANDBOX_AVATAR_ID=dd73ea75-1218-4ef3-92ce-606d5f7fbc0a
```

## Architecture

```
User Flow:
1. Landing (/) → Demo (/demo) → Enter custom scenario
2. Prompt polished via /api/prompt-polish
3. Context created via /api/liveavatar/context (opening_text="")
4. Session started via /api/liveavatar/token → /api/liveavatar/start
5. LiveKit connection established
6. Avatar waits silently, user speaks first
7. Conversation proceeds with automatic turn-taking
8. User ends session → Data saved to localStorage
9. Feedback page (/feedback) shows analysis with rhythm metrics
```

## Known Limitations

1. **Camera Permission**: User must grant camera permission; graceful fallback if denied
2. **Sandbox Mode**: 1-minute session limit in sandbox
3. **Browser Support**: Requires modern browser with WebRTC support

## Future Enhancements

- Multi-language support
- Session recording/playback
- Custom avatar selection
- Advanced analytics dashboard
