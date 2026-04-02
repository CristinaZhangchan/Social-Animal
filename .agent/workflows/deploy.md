---
description: how to deploy the application to Vercel
---

# Deploying to Vercel

Follow these steps to deploy SocialAnimal.ai to Vercel and connect it to your Supabase project.

## 1. Push to GitHub
Ensure all your latest changes are pushed to your GitHub repository:

```bash
git push origin feature/charmup-ui-migration
```

## 2. Connect to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New** -> **Project**.
3. Select your GitHub repository and click **Import**.

## 3. Configure Environment Variables
In the **Environment Variables** section of the Vercel project setup, add the following variables from your local `.env.local`:

| Variable Name | Value |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `HEYGEN_API_KEY` | Your HeyGen API key |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `ELEVENLABS_API_KEY` | Your ElevenLabs API key |

## 4. Deploy
Click **Deploy**. Vercel will build the project and provide a production URL.

## 5. Update Supabase Auth Redirects
Once deployed, you must add your Vercel URL to the Supabase redirect whitelist:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **Authentication** -> **URL Configuration**.
3. Add your Vercel production URL (e.g., `https://your-project.vercel.app/auth/callback`) to the **Redirect URLs**.

> [!IMPORTANT]
> If you encounter build errors related to ESLint or TypeScript, those can be ignored in the Vercel project settings or in `next.config.ts`.
