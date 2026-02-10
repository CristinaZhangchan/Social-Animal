# CharmUp Web Demo - Quick Deployment Guide

## Pre-Deployment Checklist

### 1. Required API Keys

Before deploying, ensure you have:

- ✅ **OpenAI API Key** (required for all features)
  - Get it from: https://platform.openai.com/api-keys
  - Ensure you have credits and access to:
    - GPT-4o model
    - Whisper API
    - TTS API

### 2. Environment Variables

Create these in your deployment platform:

```env
OPENAI_API_KEY=sk-proj-...
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Deployment Steps (Vercel)

### Step 1: Push to GitHub

```bash
cd d:\ChromeDownload\charmupai
git init
git add .
git commit -m "Initial CharmUp deployment"
git branch -M main
git remote add origin https://github.com/your-username/charmupai.git
git push -u origin main
```

### Step 2: Connect Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Vercel will auto-detect Next.js settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### Step 3: Configure Environment Variables

In Vercel dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add these variables:
   - `OPENAI_API_KEY`: Your OpenAI secret key
   - `NEXT_PUBLIC_APP_URL`: Your Vercel domain (e.g., `https://charmup.vercel.app`)

### Step 4: Deploy

1. Click **Deploy**
2. Wait 2-3 minutes for build to complete
3. Visit your deployed site at `https://your-project.vercel.app`

### Step 5: Test Production

Test these features:
- [ ] Landing page loads
- [ ] Can select a scenario
- [ ] Microphone permission prompt works
- [ ] Voice recording functions
- [ ] AI responds to voice input
- [ ] Feedback page displays after session
- [ ] Free tier limit modal appears after 3 conversations

## Cost Estimation

### OpenAI API Costs (Approximate)

**Per Conversation (5 minutes average):**
- Whisper (STT): $0.006 per minute × 5 = **$0.03**
- GPT-4o (Chat): ~500 tokens = **$0.01**
- TTS: ~200 characters × $0.015/1K = **$0.003**
- **Total per conversation: ~$0.043**

**Monthly Estimates:**
- 100 conversations: **$4.30**
- 1,000 conversations: **$43**
- 10,000 conversations: **$430**

### Vercel Hosting

- **Hobby Plan**: Free (good for demo)
  - 100GB bandwidth
  - Unlimited requests (fair use)
  - Edge functions included

- **Pro Plan**: $20/month (if needed for production)
  - Higher limits
  - Better analytics
  - Priority support

## Performance Monitoring

After deployment, monitor:

1. **Vercel Analytics**
   - Enable in Settings → Analytics
   - Track page load times and Web Vitals

2. **OpenAI Dashboard**
   - Monitor API usage at https://platform.openai.com/usage
   - Set spending limits to prevent overages

3. **Error Tracking**
   - Check Vercel logs at: Project → Functions → Logs
   - Monitor for failed API calls

## Optimization Tips

### 1. Reduce Voice Latency

Current target: <2 seconds
- API routes use Edge Runtime (faster)
- Responses stream incrementally
- Audio processing happens in parallel

### 2. Minimize API Costs

- Use GPT-4o-mini for non-critical analysis (cheaper)
- Cache common responses
- Implement request rate limiting

### 3. Scale Considerations

When traffic increases:
- Move to database for user data (not localStorage)
- Implement proper authentication
- Add CDN for static assets
- Consider Redis for session caching

## Custom Domain Setup

### Option A: Vercel Domain

1. Go to Project Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `demo.charmup.ai`)
4. Follow DNS configuration:
   ```
   Type: CNAME
   Name: demo
   Value: cname.vercel-dns.com
   ```
5. Wait for DNS propagation (5-30 minutes)

### Option B: Update Environment Variable

After adding domain:
```env
NEXT_PUBLIC_APP_URL=https://demo.charmup.ai
```

Redeploy the project for changes to take effect.

## Troubleshooting Production Issues

### Issue: 500 Error on API Routes

**Check:**
- Environment variables are set correctly
- OpenAI API key is valid and has credits
- Vercel function logs for specific error

**Solution:**
```bash
# Check logs
vercel logs <your-project-url>
```

### Issue: Voice Features Not Working

**Check:**
- HTTPS is enabled (required for microphone access)
- Browser permissions granted
- Audio API support (test on Chrome first)

### Issue: High API Costs

**Immediate Actions:**
1. Set OpenAI spending limit
2. Enable rate limiting on API routes
3. Review usage patterns in OpenAI dashboard

**Long-term:**
```typescript
// Add rate limiting to API routes
export const config = {
  maxDuration: 30, // Limit function runtime
};
```

## Security Checklist

Before going live:

- [ ] API keys are in environment variables (not code)
- [ ] CORS is properly configured
- [ ] Rate limiting implemented
- [ ] No sensitive data in client-side code
- [ ] HTTPS enforced
- [ ] CSP headers configured

## Next Steps After Deployment

1. **Marketing Site**: Create a proper landing page
2. **Authentication**: Add user login (Firebase/Clerk)
3. **Payments**: Integrate Stripe for premium plans
4. **Database**: Move from localStorage to Supabase/PostgreSQL
5. **Analytics**: Add PostHog or Mixpanel for user tracking
6. **Testing**: Set up E2E tests with Playwright

## Rollback Procedure

If deployment has issues:

1. Go to Vercel → Deployments
2. Find the last working deployment
3. Click "..." → "Promote to Production"
4. Instant rollback (no downtime)

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **OpenAI API Docs**: https://platform.openai.com/docs
- **Troubleshooting**: See README.md

---

**Deployment Completed!** 🎉

Your CharmUp demo is now live and ready for users to practice their social skills.
