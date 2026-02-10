# CharmUp Deployment Checklist

Use this checklist to ensure everything is ready before going live.

## Pre-Deployment

### 1. Environment Setup
- [ ] OpenAI API key obtained from https://platform.openai.com/api-keys
- [ ] API key has sufficient credits ($5+ recommended for testing)
- [ ] API key has access to:
  - [ ] GPT-4o model
  - [ ] Whisper API
  - [ ] TTS API
- [ ] `.env.local` file created with `OPENAI_API_KEY`

### 2. Local Testing
- [ ] Run `npm install` successfully
- [ ] Run `npm run dev` and server starts on http://localhost:3000
- [ ] Landing page loads correctly
- [ ] Can navigate to scenario selection
- [ ] Microphone permission prompt appears
- [ ] Can record voice (grant permissions)
- [ ] Voice transcription works
- [ ] AI responds to input
- [ ] TTS plays audio
- [ ] Session can be ended
- [ ] Feedback page displays analysis
- [ ] Free tier limit (3/week) is enforced
- [ ] Premium modal appears when limit reached

### 3. Build Verification
- [ ] Run `OPENAI_API_KEY=sk-dummy npm run build`
- [ ] Build completes without errors
- [ ] No critical TypeScript errors
- [ ] Bundle size is reasonable (<150kB first load)

## Deployment to Vercel

### 4. GitHub Setup
- [ ] Code pushed to GitHub repository
- [ ] Repository is accessible
- [ ] `.env.local` is NOT committed (in `.gitignore`)
- [ ] `README.md` is up to date

### 5. Vercel Configuration
- [ ] Vercel account created (free tier OK)
- [ ] Repository imported to Vercel
- [ ] Framework preset: **Next.js** (auto-detected)
- [ ] Build command: `npm run build` (default)
- [ ] Output directory: `.next` (default)
- [ ] Environment variables added:
  - [ ] `OPENAI_API_KEY` = your-actual-key
  - [ ] `NEXT_PUBLIC_APP_URL` = your-vercel-url

### 6. First Deployment
- [ ] Click "Deploy" button
- [ ] Wait for build to complete (2-3 minutes)
- [ ] Check deployment logs for errors
- [ ] Visit deployed URL
- [ ] All pages load correctly

### 7. Production Testing
- [ ] Landing page loads
- [ ] HTTPS is enabled (automatic on Vercel)
- [ ] Microphone access works (HTTPS required)
- [ ] Complete full conversation flow
- [ ] Feedback displays correctly
- [ ] Mobile view works (test on phone)
- [ ] Desktop view works
- [ ] No console errors in browser

## Post-Deployment

### 8. Monitoring Setup
- [ ] Vercel Analytics enabled (Settings → Analytics)
- [ ] OpenAI usage dashboard checked: https://platform.openai.com/usage
- [ ] Set OpenAI spending limit (recommended: $20/month for demo)
- [ ] Bookmark Vercel logs: Project → Functions → Logs

### 9. Cost Monitoring
- [ ] Understand pricing:
  - $0.043 per conversation (average)
  - Vercel Hobby plan: Free
- [ ] Set up billing alerts in OpenAI dashboard
- [ ] Monitor daily usage for first week

### 10. Optional Enhancements
- [ ] Custom domain configured (e.g., demo.charmup.ai)
- [ ] DNS records updated (CNAME to Vercel)
- [ ] SSL certificate verified (automatic)
- [ ] Update `NEXT_PUBLIC_APP_URL` with custom domain
- [ ] Redeploy with new URL

## Security Checklist

### 11. Security Verification
- [ ] No API keys in code (only in environment variables)
- [ ] `.gitignore` includes `.env.local`
- [ ] HTTPS enforced (Vercel default)
- [ ] CORS headers appropriate
- [ ] No sensitive data in client-side code
- [ ] localStorage used only for non-sensitive data

### 12. Rate Limiting (Recommended for Public Launch)
- [ ] Consider adding rate limiting to API routes
- [ ] Implement request throttling (e.g., 10 requests/minute per IP)
- [ ] Add CAPTCHA for signup (if adding auth)

## Go-Live Preparation

### 13. User Communication
- [ ] Share demo URL with stakeholders
- [ ] Prepare feedback collection method
- [ ] Create support email (e.g., support@charmup.ai)
- [ ] Write launch announcement

### 14. Analytics (Optional)
- [ ] Add PostHog or Mixpanel for user tracking
- [ ] Track key events:
  - Scenario selected
  - Conversation started
  - Conversation completed
  - Feedback viewed
  - Premium clicked
- [ ] Set up conversion funnel

### 15. Documentation
- [ ] Share README.md with team
- [ ] Document known limitations
- [ ] Create internal testing guide
- [ ] Prepare FAQ for users

## Rollback Plan

### 16. Emergency Procedures
- [ ] Know how to revert deployment in Vercel (Deployments → Promote)
- [ ] Have backup of working code in Git
- [ ] Can disable OpenAI API key if needed
- [ ] Team knows how to access Vercel logs

## Success Metrics

### 17. Track These KPIs
- [ ] Number of unique visitors
- [ ] Conversation completion rate
- [ ] Average session duration
- [ ] "Get Premium" click rate
- [ ] OpenAI API costs per day
- [ ] Error rate in Vercel logs

---

## Quick Reference

### Important URLs
- **Local Dev**: http://localhost:3000
- **Vercel Dashboard**: https://vercel.com/dashboard
- **OpenAI Dashboard**: https://platform.openai.com/usage
- **GitHub Repo**: [Add your repo URL]
- **Production URL**: [Add your Vercel URL]

### Emergency Contacts
- **Vercel Support**: https://vercel.com/support
- **OpenAI Support**: https://help.openai.com

### Quick Commands
```bash
# Start local dev
npm run dev

# Build for production
OPENAI_API_KEY=sk-dummy npm run build

# Deploy (via Vercel)
git push origin main  # Auto-deploys if connected
```

---

## Sign-Off

- [ ] All checklist items completed
- [ ] Production URL works end-to-end
- [ ] Costs are monitored
- [ ] Team has access to dashboards
- [ ] Support plan in place

**Deployment Lead**: _______________ Date: ___/___/______

**QA Verified**: _______________ Date: ___/___/______

**Ready for Launch**: ✅ / ❌

---

## Notes

_Add any deployment-specific notes, issues encountered, or decisions made:_

1.
2.
3.

---

**Good luck with launch! 🚀**
