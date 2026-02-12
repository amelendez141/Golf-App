# LinkUp Golf - Deployment Guide

## Option A: Deploy as Demo (No Clerk Required)

This is the easiest option - deploy a fully working demo without any authentication service.

### Step 1: Deploy Backend to Railway

1. Go to https://railway.app and sign up with GitHub
2. Click "New Project" > "Deploy from GitHub repo"
3. Select your repository and set root directory to `backend`
4. Add these environment variables:

```
NODE_ENV=production
PORT=3001
DEMO_MODE=true
DATABASE_URL=postgresql://neondb_owner:npg_F2ExyoZcS8nf@ep-rough-shadow-aiwi8u9h-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
CLERK_SECRET_KEY=demo_placeholder
CLERK_WEBHOOK_SECRET=demo_placeholder
CLERK_PUBLISHABLE_KEY=demo_placeholder
CORS_ORIGIN=https://your-frontend.vercel.app
LOG_LEVEL=info
```

5. Deploy and copy your Railway URL (e.g., `https://xxx.up.railway.app`)

### Step 2: Deploy Frontend to Vercel

1. Go to https://vercel.com and sign up with GitHub
2. Click "Add New" > "Project"
3. Import your repository, set root directory to `frontend`
4. Add these environment variables:

```
NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app
NEXT_PUBLIC_WS_URL=wss://your-railway-url.up.railway.app
```

5. Deploy!

### Step 3: Update CORS

After Vercel gives you a URL, go back to Railway and update `CORS_ORIGIN` to match your Vercel URL exactly.

**That's it!** Your demo is live with:
- 60 demo professionals
- 45 real golf courses
- 190+ tee times
- User switching
- Full functionality

---

## Option B: Deploy with Real Authentication (Clerk)

For a production app with real user accounts:

### Prerequisites
- Clerk account (https://clerk.com) - free tier available
- Neon database (you have this)

### Backend Environment Variables (Railway)

```
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://neondb_owner:npg_F2ExyoZcS8nf@ep-rough-shadow-aiwi8u9h-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
CLERK_SECRET_KEY=sk_live_your_real_clerk_secret
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret
CLERK_PUBLISHABLE_KEY=pk_live_your_publishable_key
CORS_ORIGIN=https://your-frontend.vercel.app
LOG_LEVEL=info
```

### Frontend Environment Variables (Vercel)

```
NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app
NEXT_PUBLIC_WS_URL=wss://your-railway-url.up.railway.app
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_publishable_key
CLERK_SECRET_KEY=sk_live_your_secret_key
```

### Configure Clerk Webhooks

1. Go to Clerk Dashboard > Webhooks
2. Add endpoint: `https://your-backend.railway.app/api/webhooks/clerk`
3. Select events: `user.created`, `user.updated`, `user.deleted`
4. Copy signing secret to `CLERK_WEBHOOK_SECRET` in Railway

---

## Troubleshooting

### "UNAUTHORIZED" error
- Make sure `DEMO_MODE=true` is set in Railway for demo deployment
- Or configure real Clerk keys for production

### CORS errors
- Update `CORS_ORIGIN` in Railway to exactly match your Vercel URL
- Include the protocol (`https://`)

### Database connection failed
- Verify `DATABASE_URL` is correct
- Check Neon dashboard for connection issues
- Ensure `?sslmode=require` is at the end

### Build failed on Railway
- Check that `backend` is set as the root directory
- Verify all required environment variables are set

---

## Weather Feature Setup (Optional)

To enable real weather data on course pages:

1. Sign up at [openweathermap.org](https://openweathermap.org/api)
2. Get your free API key (1000 calls/day)
3. Add to Railway backend environment:
   ```
   OPENWEATHER_API_KEY=your_api_key_here
   ```

Without this key, the app will show demo weather data.

---

## Features Included

After deployment, you'll have:

**Core Features:**
- Tee time feed with filters
- Interactive map with course markers
- Quick Match (find games near you)
- Chat with quick replies and status indicators
- Post-round connect flow
- Meeting notes for business connections
- Player reviews and ratings

**Premium UX:**
- Dark mode toggle
- PWA support (install as app)
- Offline indicator
- 44px touch targets for accessibility
- Weather widget with playability scores
- Course condition reports

**Business Golf Features:**
- Golf Resume on profiles
- Connection requests after rounds
- Private meeting notes about contacts
- Player review system

---

## Cost Breakdown

| Service | Free Tier Limits |
|---------|------------------|
| **Vercel** | 100GB bandwidth/month |
| **Railway** | $5/month credit |
| **Neon DB** | 512MB storage |
| **Clerk** | 10,000 MAU |
| **OpenWeather** | 1,000 calls/day |

**Total for demo: $0/month** (all within free tiers)

---

## After Deployment

1. **Share your link** - Copy the Vercel URL
2. **Test on mobile** - Try installing as PWA
3. **Switch users** - Use the demo user switcher to test different perspectives
4. **Add custom domain** - In Vercel Settings > Domains

---

## Getting Help

- Check browser console for errors
- View Railway logs for backend issues
- Verify all environment variables are set
- Test the health endpoint: `https://your-backend.railway.app/health`
