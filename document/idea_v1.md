Hej Team,

Acting as the Product Manager for **CharmUp**, I have synthesized the requirements from our pitch deck into a streamlined **Product Requirements Document (PRD)** for our web demo MVP.

In the Nordics, we value *functionality, clarity, and minimalism*. We don't build features just to have them; we build them to solve the problem efficiently. Our goal for this demo is to prove the "Magic Moment": a user talks to an avatar and receives meaningful feedback.

Below is the technical specification for the "CharmUp Web Demo".

---

# Product Requirements Document: CharmUp Web Demo (MVP)

**Date:** 2026-01-15
**Status:** Ready for Development
**Priority:** High

## 1. Product Vision & Scope

We are building an AI-powered platform to help users improve social skills. The immediate goal is a **responsive web-based demo** that allows investors and early users to experience a single "training loop" without friction.

**Core Philosophy:**

* 
**Empowerment:** Help users express themselves with confidence.


* **Simplicity:** Clean UI, focus on the conversation.
* 
**Privacy:** Secure environment for realistic training.



---

## 2. User Journey (The Happy Path)

1. **Landing:** User sees the value prop ("Improve social skills") and clicks "Try Demo."
2. 
**Scenario Setup:** User selects a pre-made scenario (e.g., "Job Interview").


3. 
**Simulation:** User interacts with a lifelike AI video avatar via voice.


4. 
**Feedback:** System provides a summary and communication advice based on behavioral psychology.


5. 
**Upsell:** User sees the "Premium" gate for advanced analytics.



---

## 3. Functional Requirements

### A. The Simulator (Core Feature)

* **Video Avatar Interface:** The UI must feature a central video avatar. It must be responsive and lifelike.


* *Dev Note:* Use a placeholder API (like HeyGen or D-ID) or a high-quality reactive animation for the demo.


* **Voice Interaction:** Users must speak to the app.
* *Requirement:* Speech-to-Text (STT) for input and Text-to-Speech (TTS) for the avatar's response.


* **Scenario Logic:** The AI must adopt a persona.
* **Preset Scenarios:** Hardcode these three options for the demo:
1. Job Interview.


2. First Date.


3. Networking Event.




* 
**Custom Scenario:** Allow a text input field for "Create your own scenario" prompts.





### B. Feedback Engine

* 
**Real-time Transcription:** Display a basic transcript of the session as it happens.


* **Post-Session Analysis:** Once the user ends the call, generate a "Communication Scorecard."
* 
*Metric:* Emotional Intelligence assessment.


* 
*Actionable Advice:* "You spoke too fast," or "You seemed defensive.".





### C. Tiered Access System (The Paywall)

We need to demonstrate that we have a business model.

* **Free Tier Logic:** Limit the demo to a short duration or specific scenarios. Show "3 AI conversations per week" limit indicator.


* **Premium UI Elements:**
* When the user asks for "Detailed session transcripts" or "Advanced analytics," show a locked state prompting upgrade to Premium ($10/mo).


* Display the "Best Value" tag on the Annual plan ($60/yr).





---

## 4. Technical Stack Recommendations

*As a PM, I leave the final implementation to you, but these tools fit our speed-to-market needs:*

* **Frontend:** Next.js (React) + Tailwind CSS.
* 
*Style Guide:* Use the "CharmUp Gradient" (Pink/Yellow/Purple) seen in the deck for branding. Clean, lots of whitespace.




* **AI Orchestration:** Vercel AI SDK or LangChain.
* **LLM Model:** GPT-4o or Claude 3.5 Sonnet (optimized for conversational nuance).
* **Voice/Video:**
* *Video:* HeyGen API (for the avatar).
* *Voice:* OpenAI Whisper (STT) + ElevenLabs (TTS).



---

## 5. UI/UX Specifications (Nordic Design Principles)

### Layout

* 
**Mobile-First:** The PDF shows a mobile interface; the web demo must look perfect on mobile view.


* 
**Gamification:** Include a "Streak" counter in the top right corner (e.g., "Day 1") to show progress tracking.



### Visual Assets

* 
**Colors:** Soft gradients (Sunrise Yellow to Lilac) to evoke warmth and kindness.


* **Typography:** Sans-serif, highly readable.

---

## 6. Success Metrics for Demo

* **Latency:** Voice-to-voice response time under 2 seconds (critical for "lifelike" feel).
* 
**Conversion:** Tracking clicks on "Get Premium".



---

**Next Step for Engineering:**
Would you like me to set up a GitHub repository with a basic Next.js scaffold including the Tailwind configuration for the CharmUp color palette?